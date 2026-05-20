import Base from '@/lib/core';
import AIDifficulty from '@/lib/ai/core/ai-difficulty.js';
import createSnapshot from '@/lib/ai/snapshot/create-snapshot.js';
import selfPlay from '@/lib/ai/planner/self-play.js';

/**
 * # AI 控制器
 *
 * 负责自动玩俄罗斯方块的 AI 逻辑。
 *
 * ## 核心流程
 *
 * 1. 通过 `loop()` 持续监控游戏状态
 * 2. 当需要决策时，调用 `think()` 分析当前棋盘
 * 3. `think()` 遍历所有可能的移动，用 `evaluateBoard` 评分
 * 4. 选出最优动作序列，逐个通过 `dispatch:input` 发送给 Game 执行
 *
 * ## 生命周期
 *
 * - `ai:start` 事件 → `start()` → 开始循环
 * - `ai:stop` 事件 → `stop()` → 停止循环并清空待执行动作
 *
 * ## 依赖注入
 *
 * | 依赖       | 类型   | 说明                                      |
 * | ---------- | ------ | ----------------------------------------- |
 * | Game       | object | 游戏主实例，提供 Store、emit、getSpeed 等 |
 * | Store      | object | 游戏状态存储，提供 getState()             |
 * | Scheduler  | object | 调度器，管理定时任务                      |
 * | Animations | object | 动画系统，用于判断动画阻塞状态            |
 *
 * @class AIController
 */
class AIController extends Base {
  /**
   * ## 构造函数
   *
   * 初始化 AI 控制器的默认状态。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Store - 游戏状态存储
   * @param {object} options.Scheduler - 调度器
   * @param {object} options.Animations - 动画系统
   */
  constructor(options) {
    super(options);

    /**
     * ## 是否启用 AI
     *
     * @default false
     * @type {boolean}
     */
    this.enabled = false;

    /**
     * ## 待执行的动作队列
     *
     * 每次 `think()` 产生的最佳动作序列存储在此， 然后由 `loop()` 逐个取出执行。
     *
     * @type {string[]}
     */
    this.actions = [];

    /**
     * ## 当前调度任务的 ID
     *
     * 用于取消上一次未执行的调度。
     *
     * @default 0
     * @type {number}
     */
    this.aiSchedulerId = 0;
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
   * 清除 enabled 标志、清空待执行动作、取消调度任务。
   *
   * @returns {void}
   */
  stop() {
    this.enabled = false;

    this.actions = [];

    this.Scheduler.cancel(this.aiSchedulerId);

    this.aiSchedulerId = 0;
  }

  /**
   * ## AI 主循环
   *
   * 每帧（由调度器触发）执行以下逻辑：
   *
   * 1. 检查是否启用
   * 2. 检查游戏状态（必须为 playing 且无动画阻塞）
   * 3. 如果没有待执行动作，调用 `think()` 生成新的动作计划
   * 4. 从队列中取出一个动作，通过 `dispatch:input` 发送给 Game
   * 5. 调度下一次循环
   *
   * @returns {void}
   */
  loop = () => {
    // 未启用则直接退出
    if (!this.enabled) {
      return;
    }

    const state = this.Game.Store.getState();

    // 游戏中断或者游戏动画暂停了，100毫秒后再尝试
    if (state.mode !== 'playing' || this.Animations.hasBlocking()) {
      this.aiSchedulerId = this.Scheduler.delay(this.loop, 100);
      return;
    }

    /** 当前没有 action plan，需要重新决策 */
    if (this.actions.length === 0) {
      const best = this.think(state);

      if (best) {
        // 深拷贝动作序列，避免后续操作污染原始数据
        this.actions = [...best.actions];
      }
    }

    /** 一次只执行一个 action，保证动作节奏与游戏同步 */
    const action = this.actions.shift();

    if (action) {
      this.Game.emit('dispatch:input', {
        device: 'ai',
        action,
        payload: {
          Game: this.Game,
        },
      });
    }

    // 调度下一次循环，延迟时间为当前等级的下落速度
    this.aiSchedulerId = this.Scheduler.delay(this.loop, this.Game.getSpeed());
  };

  /**
   * ## AI 决策
   *
   * 分析当前游戏状态，计算最佳动作序列。
   *
   * ### 决策流程
   *
   * 1. 将棋盘从颜色字符串格式转换为数字格式（0 为空，1 为占用）
   * 2. 构建 AI 需要的 piece 对象（shape + position）
   * 3. 调用 `generateMoves` 生成所有可能的移动
   * 4. 用 `evaluateBoard` 为每个结果评分
   * 5. 返回评分最高的移动
   *
   * @param {object} state - 游戏状态对象
   * @param {string[][]} state.board - 棋盘二维数组（颜色字符串）
   * @param {object} state.curr - 当前方块对象
   * @param {number[][]} state.curr.shape - 方块形状矩阵
   * @param {number} state.cx - 当前方块 X 坐标
   * @param {number} state.cy - 当前方块 Y 坐标
   * @returns {object | null} 最佳移动对象（{ board, actions }），无法决策时返回 null
   */
  think(state) {
    // 根据当前难度等级读取配置
    const difficulty = this.getDifficultyConfig();
    const { lookahead, weights } = difficulty;
    return selfPlay(createSnapshot(state), weights, lookahead);
  }

  getDifficultyConfig() {
    const difficulty = this.Game.Store.getDifficulty();
    const map = {
      easy: AIDifficulty.EASY,
      normal: AIDifficulty.NORMAL,
      hard: AIDifficulty.HARD,
      expert: AIDifficulty.HARD,
    };
    return map[difficulty] || AIDifficulty.NORMAL;
  }

  /**
   * ## 订阅 AI 事件
   *
   * 监听 `ai:<uuid>:start` 和 `ai:<uuid>:stop` 事件。
   *
   * @returns {void}
   */
  subscribe() {
    const uuid = this.Game.id;

    this.on(`ai:${uuid}:start`, this._onStart);
    this.on(`ai:${uuid}:stop`, this._onStop);
  }

  /**
   * ## 取消订阅 AI 事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const uuid = this.Game.id;

    this.off(`ai:${uuid}:start`, this._onStart);
    this.off(`ai:${uuid}:stop`, this._onStop);
  }

  /**
   * ## 处理 AI 启动事件
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
   * @private
   * @returns {void}
   */
  _onStop = () => {
    this.stop();
  };
}

export default AIController;
