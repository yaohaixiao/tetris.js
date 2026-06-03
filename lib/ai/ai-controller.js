import Base from '@/lib/core';
import AIDifficulty from '@/lib/ai/core/ai-difficulty.js';
import createSnapshot from '@/lib/ai/snapshot/create-snapshot.js';
import selfPlay from '@/lib/ai/planner/self-play.js';
import { AIEvents } from '@/lib/events/event-catalog.js';

/**
 * # AI 控制器
 *
 * 负责自动玩俄罗斯方块的 AI 逻辑。支持两种运行模式：
 *
 * - **主线程模式**：直接在 Scheduler 中同步调用 selfPlay（降级方案）
 * - **Worker 模式**：selfPlay 在独立 Web Worker 线程中运行，不阻塞主线程渲染
 *
 * Worker 模式在 AI vs AI 对战时优势明显——两个 AI 可在各自 Worker 中并行计算， 互不阻塞对方的渲染和输入处理。
 *
 * ## 核心流程
 *
 * 1. `loop()` 每帧由 Scheduler 触发，持续监控游戏状态
 * 2. 当需要决策时（无待执行动作且 Worker 空闲），调用 `think()`
 * 3. `think()` 根据运行模式：
 *
 *    - **Worker 模式**：异步发送消息给 Worker 线程，结果通过 `onmessage` 回调写入 `this.actions`
 *    - **主线程模式**：同步调用 selfPlay，直接返回结果
 * 4. `loop()` 从 `this.actions` 队列中逐个取出动作，通过 `dispatch:input` 发送给 Game 执行
 *
 * ## Worker 消息协议
 *
 * | 方向      | 消息                                               | 说明         |
 * | --------- | -------------------------------------------------- | ------------ |
 * | 主→Worker | `{ type: 'think', state, weights, depth, beam }`   | 发起决策请求 |
 * | Worker→主 | `{ type: 'result', best: { actions, y } \| null }` | 返回最佳移动 |
 * | Worker→主 | `{ type: 'error', error: string }`                 | 错误信息     |
 *
 * ## 生命周期
 *
 * - `ai:start` 事件 → `start()` → 设置 enabled=true，开始 loop
 * - `ai:stop` 事件 → `stop()` → 设置 enabled=false，清空动作队列，取消调度
 *
 * ## 依赖注入
 *
 * | 依赖       | 类型   | 说明                                           |
 * | ---------- | ------ | ---------------------------------------------- |
 * | Game       | object | 游戏主实例，提供 Store、emit、getSpeed 等      |
 * | Store      | object | 游戏状态存储，提供 getState()、getDifficulty() |
 * | Scheduler  | object | 调度器，管理定时任务                           |
 * | Animations | object | 动画系统，用于判断动画阻塞状态                 |
 *
 * @augments Base
 * @class AIController
 */
class AIController extends Base {
  /**
   * ## 构造函数
   *
   * 接收依赖配置，通过 Base.inject() 自动注入依赖， 然后调用 initialize() 初始化内部状态。
   *
   * @param {object} options - 依赖配置对象
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## 初始化内部状态
   *
   * 设置所有实例属性的默认值，并尝试创建 Web Worker。 依赖（Game/Store/Scheduler/Animations）已由 Base
   * 构造函数注入， 此方法中可直接通过 this 访问。
   *
   * @returns {void}
   */
  initialize() {
    /**
     * ## 是否启用 AI
     *
     * 由 `start()` 设为 true，`stop()` 设为 false。 `loop()` 每帧检查此标志，为 false 时直接退出。
     *
     * @type {boolean}
     */
    this.enabled = false;

    /**
     * ## 待执行的动作队列
     *
     * 每次 `think()` 产生的最佳动作序列存储在此， `loop()` 每帧从中取出一个动作执行（shift）。 队列为空时触发下一次
     * `think()` 决策。
     *
     * @type {string[]}
     */
    this.actions = [];

    /**
     * ## 当前调度任务的 ID
     *
     * Scheduler.delay() 返回的 ID，用于 `stop()` 时取消调度。
     *
     * @type {number}
     */
    this.aiSchedulerId = 0;

    /**
     * ## AI Worker 实例
     *
     * Web Worker 线程引用。null 表示 Worker 不可用， 此时降级为主线程同步模式。
     *
     * @type {Worker | null}
     */
    this.worker = null;

    /**
     * ## Worker 忙碌标志
     *
     * 防止在 Worker 计算期间重复发起决策请求。 Worker 返回结果（或出错）后设为 false。
     *
     * @type {boolean}
     */
    this.workerBusy = false;

    // 尝试创建 Web Worker 线程
    this._initialize();
  }

  /**
   * ## 初始化 Web Worker
   *
   * 创建独立线程运行 selfPlay 决策。如果浏览器不支持 Worker 或创建过程中抛出异常，自动将 this.worker 设为 null， 后续
   * `think()` 会降级为主线程同步模式。
   *
   * Worker 创建成功后，绑定 message 和 error 事件监听器。
   *
   * @private
   * @returns {void}
   */
  _initialize() {
    this.worker =
      typeof Worker === 'undefined'
        ? null
        : new Worker('js/ai-worker.js', { type: 'module' });
  }

  /**
   * ## 启动 AI
   *
   * 设置 enabled 标志并立即开始第一次循环。
   *
   * @returns {void}
   */
  start() {
    this.enabled = true;
    this.loop();
  }

  /**
   * ## 停止 AI
   *
   * 清除 enabled 标志、清空待执行动作、重置 Worker 忙碌状态、 取消当前调度任务。
   *
   * @returns {void}
   */
  stop() {
    const { Scheduler } = this;

    this.enabled = false;
    this.actions = [];
    this.workerBusy = false;

    Scheduler.cancel(this.aiSchedulerId);
    this.aiSchedulerId = 0;
  }

  /**
   * ## AI 主循环
   *
   * 每帧（由 Scheduler 按难度 delay 触发）执行以下步骤：
   *
   * 1. 检查 enabled 标志
   * 2. 检查游戏状态（必须为 'playing' 且无动画阻塞），否则 100ms 后重试
   * 3. 如果动作队列为空且 Worker 空闲，调用 `think()` 发起决策
   * 4. 从队列头部取出一个动作，通过 `dispatch:input` 事件发送给 Game
   * 5. 调度下一次循环（延迟 = 难度配置的 delay）
   *
   * 每个决策周期只执行一个动作，保证动作节奏与游戏下落速度同步。
   *
   * @returns {void}
   */
  loop = () => {
    if (!this.enabled) {
      return;
    }

    const { Game, Animations, Scheduler } = this;
    const state = Game.Store.getState();

    // 游戏中断（暂停/回放/结束）或动画阻塞（消行闪烁等），100ms 后再试
    if (state.mode !== 'playing' || Animations.hasBlocking()) {
      this.aiSchedulerId = Scheduler.delay(this.loop, 100);
      return;
    }

    const difficulty = this.getDifficultyConfig();

    /**
     * 无待执行动作且 Worker 空闲时，发起新一轮决策
     *
     * - Worker 模式：think() 异步发送消息给 Worker，不阻塞循环
     * - 主线程模式：think() 同步返回结果，直接写入 this.actions
     */
    if (this.actions.length === 0 && !this.workerBusy) {
      const best = this.think(state, difficulty);

      // 主线程模式：同步返回结果，直接写入 actions
      if (best) {
        this.actions = [...best.actions];
      }
    }

    // 一次只执行一个动作
    const action = this.actions.shift();

    // 没有动作，但 Worker 正在计算中，继续等待，不退出
    if (!action && this.workerBusy) {
      this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
      return;
    }

    if (!action) {
      return;
    }

    this.emit('dispatch:input', {
      device: 'ai',
      action,
      payload: { Game },
    });

    /**
     * 调度下一次循环
     *
     * 延迟时间使用难度配置的 delay：
     *
     * - EASY: 580ms（慢，给玩家充足反应时间）
     * - NORMAL: 480ms（中等）
     * - HARD: 280ms（快，有压迫感）
     * - EXPERT: 150ms（极快，但保留呼吸感）
     */
    this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
  };

  /**
   * ## AI 决策入口
   *
   * 根据运行模式选择决策方式：
   *
   * - **Worker 模式**（this.worker 存在）：发送 `{ type: 'think', ... }` 消息给 Worker
   *   线程。Worker 完成后通过 `_onWorkerMessage` 回调将结果写入 `this.actions`。 此方法在 Worker
   *   模式下不返回任何值（返回 undefined）。
   * - **主线程模式**（this.worker 为 null）：同步调用 selfPlay， 直接返回最佳移动对象 `{ placeOn,
   *   actions, y }`。 其中 `placeOn` 是函数，仅在主线程降级时可用，不会被序列化传递。
   *
   * ## 返回值结构（主线程模式）
   *
   * | 字段      | 类型     | 说明                                            |
   * | --------- | -------- | ----------------------------------------------- |
   * | `placeOn` | Function | 放置函数，接收目标棋盘，原地写入方块            |
   * | `actions` | string[] | 动作序列，如 `['ROTATE', 'MOVE_RIGHT', 'DROP']` |
   * | `y`       | number   | 硬降终点的 Y 坐标                               |
   *
   * ## Worker 模式下的数据流
   *
   *     think() → postMessage({ state, weights, depth, beam })
   *       → Worker: createSnapshot → selfPlay → { placeOn, actions, y }
   *       → postMessage({ actions, y })  // placeOn 是函数，不可序列化
   *       → _onWorkerMessage: this.actions = [...best.actions]
   *
   * 主线程只需要 `actions` 来驱动游戏，`placeOn` 和 `y` 仅在 AI 内部评分阶段使用，不需要传递到执行层。
   *
   * @param {object} state - 游戏状态对象（Store.getState() 的返回值）
   * @param {string[][]} state.board - 棋盘二维数组（颜色字符串格式）
   * @param {object} state.curr - 当前活动方块对象（含 shape、color）
   * @param {number} state.cx - 当前方块的 X 坐标（列索引）
   * @param {number} state.cy - 当前方块的 Y 坐标（行索引）
   * @param {object} difficulty - 难度配置对象（由 getDifficultyConfig() 返回）
   * @param {number} difficulty.lookahead - 前瞻深度
   * @param {object} difficulty.weights - 评估权重
   * @param {number} difficulty.beam - Beam Search 剪枝宽度
   * @returns {object | void} 主线程模式返回 { placeOn, actions, y }，Worker 模式返回
   *   undefined
   */
  think(state, difficulty) {
    const { lookahead, weights, beam } = difficulty;

    if (this.worker) {
      /**
       * ======== Worker 模式：异步发送决策请求 ========
       *
       * 1. 设置 workerBusy = true，防止在 Worker 计算期间重复发起请求
       * 2. 将游戏状态（state）和搜索配置（weights/depth/beam）序列化发送给 Worker
       * 3. Worker 在独立线程中执行：
       *
       *    - CreateSnapshot(state)：将游戏状态转为 AI 快照
       *    - SelfPlay(snapshot, weights, depth, beam)：执行完整的决策搜索
       *    - 返回 { placeOn, actions, y }
       * 4. Worker 通过 postMessage 将结果发回主线程
       * 5. _onWorkerMessage 回调接收结果，将 actions 写入 this.actions 队列
       * 6. Loop() 在后续帧中逐个取出 action 执行
       *
       * 注意：Worker 模式下此方法不返回任何值。 调用方（loop）通过 workerBusy 标志和 actions 队列感知决策状态。
       */
      this.workerBusy = true;
      this.worker.postMessage({
        type: 'think',
        state,
        weights,
        depth: lookahead,
        beam,
      });
    } else {
      /**
       * ======== 主线程模式（降级）：同步执行 selfPlay ========
       *
       * 当浏览器不支持 Web Worker 或 Worker 创建失败时使用。 直接在 Scheduler 的循环中同步执行 selfPlay，
       * 可能造成微小的帧延迟（depth=4 时约 15-45ms）。
       *
       * 执行流程：
       *
       * 1. CreateSnapshot(state)：深拷贝游戏状态为 AI 快照
       * 2. SelfPlay(snapshot, weights, lookahead, beam)：
       *
       *    - GenerateMoves：生成所有候选（含 Hold）
       *    - Beam Search 剪枝
       *    - 分支复制 + 递归前瞻评分
       *    - 返回最优移动 { placeOn, actions, y }
       * 3. 调用方（loop）接收返回值，从 best.actions 写入动作队列
       *
       * PlaceOn 是函数，在主线程模式下可直接使用（无需序列化）。 但在 loop 中只取 actions 字段驱动游戏，placeOn 和 y
       * 不参与执行。
       */
      const snapshot = createSnapshot(state);
      return selfPlay(snapshot, weights, lookahead, beam);
    }
  }

  /**
   * ## 获取当前难度的完整配置
   *
   * 从 Store 读取当前选择的难度等级，映射到对应的 AIDifficulty 配置对象。 未知难度降级为 NORMAL。
   *
   * @returns {object} 难度配置对象，包含 lookahead、noise、weights、delay、beam 等字段
   */
  getDifficultyConfig() {
    const { Game } = this;
    const difficulty = Game.Store.getDifficulty();

    const map = {
      easy: AIDifficulty.EASY,
      normal: AIDifficulty.NORMAL,
      hard: AIDifficulty.HARD,
      expert: AIDifficulty.EXPERT,
    };

    return map[difficulty] || AIDifficulty.NORMAL;
  }

  /**
   * ## 绑定 Worker 事件监听器
   *
   * 在 Worker 创建成功后调用，绑定 message 和 error 事件。
   *
   * @returns {void}
   */
  addEventListeners() {
    if (!this.worker) {
      return;
    }

    this.worker.addEventListener('message', this._onWorkerMessage);
    this.worker.addEventListener('error', this._onWorkerError);
  }

  /**
   * ## 移除 Worker 事件监听器
   *
   * 在销毁 Worker 或停止 AI 时调用。
   *
   * @returns {void}
   */
  removeEventListeners() {
    if (!this.worker) {
      return;
    }

    this.worker.removeEventListener('message', this._onWorkerMessage);
    this.worker.removeEventListener('error', this._onWorkerError);
  }

  /**
   * ## 处理 Worker 返回的消息
   *
   * Worker 完成 selfPlay 决策后，通过 postMessage 发送结果。 此回调将结果写入 this.actions 队列，并解除
   * workerBusy 锁。
   *
   * @private
   * @param {MessageEvent} e - Worker 消息事件
   * @returns {void}
   */
  _onWorkerMessage = (e) => {
    const { type, best, error } = e.data;

    if (type === 'result') {
      // Worker 决策完成，解锁并写入动作序列
      this.workerBusy = false;
      if (best) {
        this.actions = [...best.actions];
      }
    }

    if (type === 'error') {
      // Worker 内部出错，解锁并记录
      this.workerBusy = false;
      console.error('AI Worker Error:', error);
    }
  };

  /**
   * ## 处理 Worker 自身错误
   *
   * Worker 线程崩溃或无法响应时触发。 解除忙碌锁并将 worker 设为 null，后续决策降级为主线程模式。
   *
   * @private
   * @param {ErrorEvent} err - Worker 错误事件
   * @returns {void}
   */
  _onWorkerError = (err) => {
    this.workerBusy = false;

    console.error('AI Worker Error:', err);
    // 降级为主线程模式
    this.worker = null;
  };

  /**
   * ## 订阅 AI 事件
   *
   * 监听 `ai:<uuid>:start` 和 `ai:<uuid>:stop` 事件。
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    const events = AIEvents(Game.id);
    this.on(events.START, this._onStart);
    this.on(events.STOP, this._onStop);
  }

  /**
   * ## 取消订阅 AI 事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const events = AIEvents(Game.id);
    this.off(events.START, this._onStart);
    this.off(events.STOP, this._onStop);
  }

  /** @private */
  _onStart = () => this.start();
  /** @private */
  _onStop = () => this.stop();
}

export default AIController;
