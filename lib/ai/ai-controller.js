import Base from '@/lib/core';
import AIDifficulty from '@/lib/ai/core/ai-difficulty.js';
import createSnapshot from '@/lib/ai/snapshot/create-snapshot.js';
import selfPlay from '@/lib/ai/planner/self-play.js';
import { AIEvents, GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # AI 控制器
 *
 * 负责自动玩俄罗斯方块的 AI 逻辑。 当前使用**主线程同步模式**，直接在 Scheduler 中调用 selfPlay。 Worker
 * 模式代码保留但暂未使用。
 *
 * ## 核心流程
 *
 * 1. `loop()` 每帧由 Scheduler 按难度 delay 触发，持续监控游戏状态
 * 2. 当需要决策时（无待执行动作），调用 `think()`
 * 3. `think()` 创建快照，同步调用 selfPlay，返回最优移动
 * 4. `loop()` 从 `this.actions` 队列中逐个取出动作，通过 `dispatch:input` 发送给 Game 执行
 *
 * ## 防重入保护
 *
 * `start()` 方法包含 `if (this.enabled) return;` 检查，防止被多次调用导致 多个 `loop()` 实例在
 * Scheduler 中交替运行。
 *
 * Battle 模式修复： 之前 `Game.initialize()` 和 `_onGameStart` 各调用了一次 `start()`， 导致两个
 * `loop()` 交替执行，AI 动作序列被打乱。
 *
 * ## Worker 消息协议（保留备用）
 *
 * | 方向      | 消息                                                              | 说明         |
 * | --------- | ----------------------------------------------------------------- | ------------ |
 * | 主→Worker | `{ type: 'think', state, weights, depth, beam, algorithm, mode }` | 发起决策请求 |
 * | Worker→主 | `{ type: 'result', best: { actions, y } \| null }`                | 返回最佳移动 |
 * | Worker→主 | `{ type: 'error', error: string }`                                | 错误信息     |
 *
 * @augments Base
 * @class AIController
 */
class AIController extends Base {
  /**
   * ## 构造函数
   *
   * 接收依赖配置，通过 Base.inject() 自动注入依赖，然后调用 initialize() 初始化内部状态。
   *
   * @param {object} options - 依赖配置对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Store - 游戏状态存储
   * @param {object} options.Scheduler - 任务调度器
   * @param {object} options.Animations - 动画系统
   * @param {object} options.Player - 玩家信息对象
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## 初始化内部状态
   *
   * 设置所有实例属性的默认值，并尝试创建 Web Worker。 当前 Worker 创建后暂未使用，think() 走同步路径。
   *
   * @returns {void}
   */
  initialize() {
    /** 是否启用 AI，由 start() 设为 true，stop() 设为 false */
    this.enabled = false;
    /** 待执行的动作队列，每次 think() 产生的最佳动作序列存储在此 */
    this.actions = [];
    /** 当前调度任务的 ID，用于 stop() 时取消调度 */
    this.aiSchedulerId = 0;
    /** AI Worker 实例，null 表示降级为主线程同步模式 */
    this.worker = null;
    /** Worker 忙碌标志，防止重复发起决策请求 */
    this.workerBusy = false;
    // 尝试创建 Web Worker 线程（当前未使用，保留备用）
    this._initialize();
  }

  /**
   * ## 初始化 Web Worker
   *
   * 创建独立线程运行 selfPlay 决策。如果浏览器不支持 Worker， 将 this.worker 设为 null，后续 think()
   * 降级为主线程同步模式。
   *
   * 当前版本统一使用主线程同步模式，Worker 代码保留备用。
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
   * ### 防重入保护
   *
   * 如果 `this.enabled` 已经是 true，说明 AI 已经在运行中， 直接返回不重复启动。这修复了 Battle 模式下 AI
   * 被启动两次的问题—— `Game.initialize()` 和 `_onGameStart` 各调用了一次 `start()`。
   *
   * @returns {void}
   */
  start() {
    if (this.enabled) {
      return;
    }
    this.enabled = true;
    this.loop();
  }

  /**
   * ## 停止 AI
   *
   * 清除 enabled 标志、清空待执行动作、重置 Worker 忙碌状态、 取消当前 Scheduler 中的调度任务。
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
   * 每帧（由 Scheduler 按难度 delay 触发）执行：
   *
   * 1. 检查 enabled 标志
   * 2. 检查游戏状态（必须为 'playing' 且无动画阻塞），否则 100ms 后重试
   * 3. 如果动作队列为空且 Worker 空闲，调用 think() 发起决策
   * 4. 从队列头部取出一个动作执行
   * 5. 调度下一次循环
   *
   * ### 动作执行时序
   *
   * 每帧只执行一个动作（this.actions.shift()）。 一个完整的动作序列（如 HOLD → ROTATE → MOVE →
   * DROP）需要多帧才能执行完毕。 序列执行期间不会发起新的 think()，因为 this.actions.length > 0。
   *
   * ### Battle 模式事件隔离
   *
   * 使用 `GameEvents(Game.id).DISPATCH_INPUT` 发送事件， 事件名包含 Game 的 UUID，确保 Battle
   * 模式下两个 Game 实例的事件不会互相干扰。
   *
   * @returns {void}
   */
  loop = () => {
    if (!this.enabled) {
      return;
    }

    const { Game, Animations, Scheduler } = this;
    const state = Game.Store.getState();

    /*
     * ==================== 状态检查 ====================
     *
     * 游戏中断（非 playing 模式）或动画阻塞时，100ms 后重试。
     * 阻塞动画包括：消行动画、倒计时动画、升级动画等。
     * 这些动画期间方块无法操作，AI 应等待动画结束。
     */
    if (state.mode !== 'playing' || Animations.hasBlocking()) {
      this.aiSchedulerId = Scheduler.delay(this.loop, 100);
      return;
    }

    const difficulty = this.getDifficultyConfig();

    /*
     * ==================== 决策阶段 ====================
     *
     * 当动作队列为空（上一轮动作已全部执行完毕）且 Worker 空闲时，
     * 发起新一轮 AI 决策。
     *
     * think() 返回最佳移动对象 { x, y, placeOn, actions }，
     * 将 actions 数组浅拷贝到 this.actions 队列中。
     *
     * 当前使用主线程同步模式：think() 直接返回结果。
     * Worker 模式下（!this.worker 为 false），
     * think() 返回 undefined，结果由 _onWorkerMessage 异步填充。
     */
    if (this.actions.length === 0 && !this.workerBusy) {
      const best = this.think(state, difficulty);

      if (!this.worker) {
        this.actions = best ? [...best.actions] : [];
      }
    }

    /*
     * ==================== 动作执行阶段 ====================
     *
     * 从队列头部取出一个动作执行。
     * 每帧只执行一个动作，保证动作序列按顺序逐帧执行。
     *
     * 如果队列为空但 Worker 正在计算中，继续等待（Worker 模式）。
     * 如果队列为空且没有在计算，说明本轮决策未产生动作，直接返回。
     */
    const action = this.actions.shift();

    // 没有动作但 Worker 正在计算中，继续等待
    if (!action && this.workerBusy) {
      this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
      return;
    }

    if (!action) {
      return;
    }

    /*
     * ==================== 发送动作 ====================
     *
     * 通过 Game ID 隔离的 dispatch:input 事件发送动作。
     *
     * 事件名格式：game:<uuid>:dispatch:input
     * Engine._subscribe() 中为每个 Game 实例单独订阅了此事件，
     * 确保 Battle 模式下 human Game 不会收到 AI 的输入。
     *
     * 事件流：
     *   emit(DISPATCH_INPUT)
     *   → Engine._onDispatchInput
     *   → dispatchInput()
     *   → CommandQueue.enqueue()
     *   → CommandQueue.flush()
     *   → cmd.execute()
     *   → dispatchCommand()
     *   → action handler（如 GAME_PLAYING_ACTIONS.DROP）
     */
    const events = GameEvents(Game.id);

    this.emit(events.DISPATCH_INPUT, {
      device: 'ai',
      action,
      payload: { Game },
    });

    /*
     * ==================== 调度下一次循环 ====================
     *
     * 延迟时间使用难度配置的 delay：
     * - Easy: 480ms
     * - Normal: 380ms
     * - Hard: 200ms
     * - Expert: 130ms
     *
     * 注意：loop() 每 200ms（Hard）触发一次，但每帧只执行一个动作。
     * 这意味着 AI 可以在 200ms 内执行约 12 帧 ≈ 12 个动作（如果动作序列够长）。
     * 实际上动作序列通常 4-8 个动作，在下次 loop 触发前就能执行完毕。
     */
    this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
  };

  /**
   * ## AI 决策入口
   *
   * 根据运行模式选择决策方式：
   *
   * - **Worker 模式**：异步发送消息给 Worker 线程
   * - **主线程模式**（当前使用）：同步调用 selfPlay，直接返回最佳移动对象
   *
   * ### mode 参数
   *
   * 根据当前游戏模式传递不同的 mode 给 selfPlay：
   *
   * - Single 模式：'survival'（生存模式，只关心自己棋盘的存活）
   * - Battle 模式：'versus'（对战模式，额外考虑攻击力奖励）
   *
   * Mode 参数贯穿整个决策链：selfPlay → evaluateBoard， 在 evaluateBoard 中根据 mode
   * 使用不同的权重和奖励策略。
   *
   * ### bag 参数
   *
   * 从 Game.getBagSnapshot() 获取当前 Game 实例专属的 7-bag 快照。 每个 Game 实例维护独立的
   * this.bag，Battle 模式下不会互相干扰。
   *
   * @param {object} state - 游戏状态对象（Game.Store.getState() 的返回值）
   * @param {object} difficulty - 难度配置对象，包含 lookahead、weights、beam、delay
   * @returns {object | void} 主线程模式返回 { x, y, placeOn, actions }，Worker 模式返回
   *   undefined
   */
  think(state, difficulty) {
    const { Store, Game } = this;
    const { lookahead, weights, beam } = difficulty;
    const difficultyLevel = Store.getDifficulty();
    // Expert 难度预留 mcts 算法切换（当前统一使用 selfPlay）
    const algorithm = difficultyLevel === 'expert' ? 'mcts' : 'selfPlay';
    // 根据游戏模式决定 AI 策略模式
    const mode = Game.isVersus() ? 'versus' : 'survival';
    // 获取当前 Game 实例专属的 7-bag 快照
    const bag = Game.getBagSnapshot();

    if (this.worker) {
      // Worker 模式（当前未使用，保留备用）
      this.workerBusy = true;
      this.worker.postMessage({
        type: 'think',
        state,
        bag,
        weights,
        depth: lookahead,
        beam,
        algorithm,
        mode,
      });
    } else {
      /*
       * ==================== 降级返回（Worker 不可用时） ====================
       *
       * 如果 Worker 分支走了但没有 return（Worker 模式下 think() 返回 undefined），
       * 下面的代码作为降级方案，确保 AI 仍然能做出决策。
       */
      const snapshot = createSnapshot(state, bag);
      return selfPlay(snapshot, weights, lookahead, beam, mode);
    }
  }

  /**
   * ## 获取当前难度的完整配置
   *
   * 从 Store 读取当前选择的难度等级，映射到对应的 AIDifficulty 配置对象。 未知难度降级为 NORMAL。
   *
   * ### 配置内容
   *
   * | 难度   | lookahead | beam | noise | delay | 特点                         |
   * | ------ | --------- | ---- | ----- | ----- | ---------------------------- |
   * | EASY   | 2         | 2    | 0.08  | 480ms | 多看一步，偶尔犯错，反应慢   |
   * | NORMAL | 3         | 3    | 0.05  | 380ms | 多看两步，偶尔失误，中等速度 |
   * | HARD   | 4         | 4    | 0     | 200ms | 多看三步，从不犯错，较快     |
   * | EXPERT | 4         | 5    | 0     | 130ms | 多看三步，最宽搜索，极快     |
   *
   * @returns {object} 难度配置对象，包含 lookahead、noise、weights、delay、beam
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
   * 注册 Worker 的 message 和 error 事件处理函数。 当前 Worker 未使用，此方法保留备用。
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
   * 在 Game 销毁或模式切换时调用，防止内存泄漏。
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
   * Worker 完成决策后，将结果写入 this.actions 队列，解除 workerBusy 锁。 当前 Worker 未使用，此方法保留备用。
   *
   * @private
   * @param {MessageEvent} e - Worker 消息事件
   * @returns {void}
   */
  _onWorkerMessage = (e) => {
    const { type, best, error } = e.data;
    if (type === 'result') {
      this.workerBusy = false;
      if (best) {
        this.actions = [...best.actions];
      }
    }
    if (type === 'error') {
      this.workerBusy = false;
      console.error('AI Worker Error:', error);
    }
  };

  /**
   * ## 处理 Worker 自身错误
   *
   * Worker 线程崩溃时解除忙碌锁并降级为主线程模式。 当前 Worker 未使用，此方法保留备用。
   *
   * @private
   * @param {ErrorEvent} err - Worker 错误事件
   * @returns {void}
   */
  _onWorkerError = (err) => {
    this.workerBusy = false;
    console.error('AI Worker Error:', err);
    this.worker = null;
  };

  /**
   * ## 订阅 AI 事件
   *
   * 监听 `ai:<uuid>:start` 和 `ai:<uuid>:stop` 事件。 事件名包含 Game 的 UUID，确保 Battle
   * 模式下两个 Game 实例的事件隔离。
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
   * 在 Game 销毁或模式切换时调用，防止内存泄漏。
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const events = AIEvents(Game.id);
    this.off(events.START, this._onStart);
    this.off(events.STOP, this._onStop);
  }

  /**
   * ## 处理 AI 启动事件
   *
   * 当收到 `ai:<uuid>:start` 事件时调用 start()。 start() 包含防重入检查，重复调用安全。
   *
   * @private
   * @returns {void}
   */
  _onStart = () => {
    this.start();
  };

  /**
   * ## 处理 AI 停止事件
   *
   * 当收到 `ai:<uuid>:stop` 事件时调用 stop()。
   *
   * @private
   * @returns {void}
   */
  _onStop = () => {
    this.stop();
  };
}

export default AIController;
