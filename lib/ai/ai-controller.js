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
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## 初始化内部状态
   *
   * 设置所有实例属性的默认值，并尝试创建 Web Worker。
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
    // 尝试创建 Web Worker 线程
    this._initialize();
  }

  /**
   * ## 初始化 Web Worker
   *
   * 创建独立线程运行 selfPlay 决策。如果浏览器不支持 Worker， 将 this.worker 设为 null，后续 think()
   * 降级为主线程同步模式。
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
   * 清除 enabled 标志、清空待执行动作、重置 Worker 忙碌状态、取消当前调度任务。
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
   * @returns {void}
   */
  loop = () => {
    if (!this.enabled) {
      return;
    }

    const { Game, Animations, Scheduler } = this;
    const state = Game.Store.getState();

    // 游戏中断或动画阻塞时 100ms 后重试
    if (state.mode !== 'playing' || Animations.hasBlocking()) {
      this.aiSchedulerId = Scheduler.delay(this.loop, 100);
      return;
    }

    const difficulty = this.getDifficultyConfig();

    // 无待执行动作且 Worker 空闲时，发起新一轮决策
    if (this.actions.length === 0 && !this.workerBusy) {
      const best = this.think(state, difficulty);
      if (best) {
        this.actions = [...best.actions];
      }
    }

    // 一次只执行一个动作
    const action = this.actions.shift();

    // 没有动作但 Worker 正在计算中，继续等待
    if (!action && this.workerBusy) {
      this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
      return;
    }

    if (!action) {
      return;
    }

    // 通过 dispatch:input 事件发送动作给 Game
    this.emit('dispatch:input', {
      device: 'ai',
      action,
      payload: { Game },
    });

    // 调度下一次循环，延迟时间使用难度配置的 delay
    this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
  };

  /**
   * ## AI 决策入口
   *
   * 根据运行模式选择决策方式：
   *
   * - **Worker 模式**：异步发送消息给 Worker 线程
   * - **主线程模式**：同步调用 selfPlay，直接返回最佳移动对象
   *
   * @param {object} state - 游戏状态对象
   * @param {object} difficulty - 难度配置对象
   * @returns {object | void} 主线程模式返回 { placeOn, actions, y }，Worker 模式返回
   *   undefined
   */
  think(state, difficulty) {
    const { Store } = this;
    const { lookahead, weights, beam } = difficulty;
    const difficultyLevel = Store.getDifficulty();
    // Expert 难度预留 mcts 算法切换
    const algorithm = difficultyLevel === 'expert' ? 'mcts' : 'selfPlay';

    if (this.worker) {
      this.workerBusy = true;
      this.worker.postMessage({
        type: 'think',
        state,
        weights,
        depth: lookahead,
        beam,
        algorithm,
      });
    } else {
      const snapshot = createSnapshot(state);
      return selfPlay(snapshot, weights, lookahead, beam);
    }
  }

  /**
   * ## 获取当前难度的完整配置
   *
   * 从 Store 读取当前选择的难度等级，映射到对应的 AIDifficulty 配置对象。 未知难度降级为 NORMAL。
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
   * Worker 完成决策后，将结果写入 this.actions 队列，解除 workerBusy 锁。
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
   * Worker 线程崩溃时解除忙碌锁并降级为主线程模式。
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
  _onStart = () => {
    this.start();
  };

  /** @private */
  _onStop = () => {
    this.stop();
  };
}

export default AIController;
