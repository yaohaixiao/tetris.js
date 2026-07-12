import Base from '@/lib/core';
import AIDifficulty from '@/lib/ai/core/ai-difficulty.js';
import AIRouter from '@/lib/events/router/ai-router.js';
import createSnapshot from '@/lib/ai/snapshot/create-snapshot.js';
import selfPlay from '@/lib/ai/planner/self-play.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：AIController AI 控制器
 *
 * ============================================================
 *
 * 负责自动玩俄罗斯方块的 AI 逻辑。 使用主线程同步模式，直接在 Scheduler 中调用 selfPlay。
 *
 * ## 核心流程
 *
 * 1. Loop() 每帧由 Scheduler 按难度 delay 触发
 * 2. 当需要决策时（无待执行动作），调用 think()
 * 3. Think() 创建快照，同步调用 selfPlay，返回最优移动
 * 4. Loop() 从 this.actions 队列中逐个取出动作执行
 *
 * ## 防重入保护
 *
 * Start() 方法包含 enabled 检查，防止被多次调用导致 多个 loop() 实例在 Scheduler 中交替运行。
 *
 * @augments Base
 * @class AIController
 */
class AIController extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 依赖配置对象
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## initialize：初始化内部状态
   *
   * @returns {void}
   */
  initialize() {
    this._initialize();
  }

  /**
   * ## _initialize：初始化状态和 Worker
   *
   * @private
   * @param {boolean} [terminate=false] - 是否销毁 Worker. Default is `false`
   * @returns {void}
   */
  _initialize(terminate = false) {
    const { Game } = this;

    /** 是否启用 AI */
    this.enabled = false;
    /** 待执行的动作队列 */
    this.actions = [];
    /** 当前调度任务的 ID */
    this.aiSchedulerId = 0;
    /** AI Worker 实例（当前未使用，保留备用） */
    this.worker = null;
    /** Worker 忙碌标志 */
    this.workerBusy = false;

    // 尝试创建 Web Worker 线程（当前未使用，保留备用）
    this.worker =
      typeof Worker === 'undefined' || terminate
        ? null
        : new Worker('js/ai-worker.js', { type: 'module' });

    this.Router = new AIRouter({
      AI: this,
      Game,
    });
  }

  /**
   * ## start：启动 AI
   *
   * 设置 enabled 标志并立即开始第一次循环。 包含防重入检查，已启动时直接返回。
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
   * ## stop：停止 AI
   *
   * 清除 enabled 标志、清空动作队列、取消调度任务。
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
   * ## loop：AI 主循环
   *
   * 每帧由 Scheduler 按难度 delay 触发：
   *
   * 1. 检查 enabled 标志和游戏状态
   * 2. 动作队列为空时调用 think() 发起决策
   * 3. 从队列头部取出一个动作执行
   * 4. 调度下一次循环
   *
   * 每帧只执行一个动作，完整动作序列需多帧执行完毕。
   *
   * @returns {void}
   */
  loop = () => {
    if (!this.enabled) {
      return;
    }

    const { Game, Animations, Scheduler } = this;
    const state = Game.Store.getState();

    // 状态检查：非 playing 模式或动画阻塞时，100ms 后重试
    if (state.mode !== 'playing' || Animations.hasBlocking()) {
      this.aiSchedulerId = Scheduler.delay(this.loop, 100);
      return;
    }

    const difficulty = this.getDifficultyConfig();

    // 决策阶段：动作队列为空且 Worker 空闲时发起新决策
    if (this.actions.length === 0 && !this.workerBusy) {
      const best = this.think(state, difficulty);

      if (!this.worker) {
        this.actions = best ? [...best.actions] : [];
      }
    }

    // 动作执行阶段：从队列头部取出一个动作
    const action = this.actions.shift();

    // 没有动作但 Worker 正在计算中，继续等待
    if (!action && this.workerBusy) {
      this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
      return;
    }

    if (!action) {
      return;
    }

    // 通过 Game ID 隔离的 dispatch:input 事件发送动作
    const events = GameEvents(Game.id);

    this.emit(events.DISPATCH_INPUT, {
      device: 'ai',
      action,
      payload: { Game },
    });

    // 调度下一次循环
    this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
  };

  /**
   * ## think：AI 决策入口
   *
   * 根据运行模式选择决策方式：
   *
   * - Worker 模式（当前未使用）：异步发送消息
   * - 主线程模式（当前使用）：同步调用 selfPlay
   *
   * Mode 参数根据游戏模式传递：
   *
   * - Single：'survival'
   * - Battle：'versus'
   *
   * @param {object} state - 游戏状态对象
   * @param {object} difficulty - 难度配置对象
   * @returns {object | void} 主线程模式返回最佳移动对象，Worker 模式返回 undefined
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
      const snapshot = createSnapshot(state, bag);
      return selfPlay(snapshot, weights, lookahead, beam, mode);
    }
  }

  /**
   * ## getDifficultyConfig：获取当前难度的完整配置
   *
   * 从 Store 读取当前选择的难度等级，映射到对应的 AIDifficulty 配置对象。 未知难度降级为 NORMAL。
   *
   * @returns {object} 难度配置对象
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
   * ## subscribe：订阅 AI 事件
   *
   * @returns {void}
   */
  subscribe() {
    this.Router.subscribe();
  }

  /**
   * ## unsubscribe：取消订阅 AI 事件
   *
   * @returns {void}
   */
  unsubscribe() {
    this.Router.unsubscribe();
  }

  /**
   * ## addEventListeners：绑定 Worker 事件监听器
   *
   * 当前 Worker 未使用，此方法保留备用。
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
   * ## removeEventListeners：移除 Worker 事件监听器
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
   * ## _onWorkerMessage：处理 Worker 返回的消息
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
   * ## _onWorkerError：处理 Worker 自身错误
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
   * ## destroy：销毁 AI 的相关数据
   *
   * 当玩家选择游戏模式重置界面时，AI 的 worker 和相关属性需要重置。
   *
   * @returns {void}
   */
  destroy() {
    this.worker.terminate();
    this._initialize(true);
  }
}

export default AIController;
