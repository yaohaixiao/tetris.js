import Base from '@/lib/core';
import AIDifficulty from '@/lib/ai/core/ai-difficulty.js';
import createSnapshot from '@/lib/ai/snapshot/create-snapshot.js';
import selfPlay from '@/lib/ai/planner/self-play.js';
import { AIEvents } from '@/lib/events/event-catalog.js';

/**
 * # AI 控制器
 *
 * 负责自动玩俄罗斯方块的 AI 逻辑。 支持两种决策算法：
 *
 * - **Self-Play**（EASY / NORMAL / HARD）：基于启发式评估 + 前瞻搜索
 * - **MCTS**（EXPERT）：基于蒙特卡洛树搜索，通过大量随机模拟做决策
 *
 * ## 核心流程
 *
 * 1. 通过 `loop()` 持续监控游戏状态
 * 2. 当需要决策时，调用 `think()` 分析当前棋盘
 * 3. `think()` 根据难度选择决策算法：
 *
 *    - EASY / NORMAL / HARD → `selfPlay`（前瞻搜索 + 束搜索剪枝）
 *    - EXPERT → `mcts`（蒙特卡洛树搜索）
 * 4. 选出最优动作序列，逐个通过 `dispatch:input` 发送给 Game 执行
 *
 * ## 生命周期
 *
 * - `ai:start` 事件 → `start()` → 开始循环
 * - `ai:stop` 事件 → `stop()` → 停止循环并清空待执行动作
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
    const { Scheduler } = this;

    this.enabled = false;
    this.actions = [];

    Scheduler.cancel(this.aiSchedulerId);
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
   * 5. 根据当前难度配置的 delay 调度下一次循环
   *
   * @returns {void}
   */
  loop = () => {
    // 未启用则直接退出
    if (!this.enabled) {
      return;
    }

    const { Game, Animations, Scheduler } = this;

    const state = Game.Store.getState();

    // 游戏中断或者游戏动画暂停了，100 毫秒后再尝试
    if (state.mode !== 'playing' || Animations.hasBlocking()) {
      this.aiSchedulerId = Scheduler.delay(this.loop, 100);
      return;
    }

    // 获取当前难度配置（用于 delay）
    const difficulty = this.getDifficultyConfig();

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
      this.emit('dispatch:input', {
        device: 'ai',
        action,
        payload: {
          Game,
        },
      });
    }

    /**
     * 调度下一次循环，延迟时间使用难度配置的 delay。
     *
     * 不同难度的 delay 不同：
     *
     * - EASY: 580ms（慢，给玩家充足反应时间）
     * - NORMAL: 480ms（中等）
     * - HARD: 280ms（快，有压迫感）
     * - EXPERT: 150ms（极快，但保留呼吸感）
     */
    this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
  };

  /**
   * ## AI 决策
   *
   * 分析当前游戏状态，计算最佳动作序列。
   *
   * ### 决策算法选择
   *
   * | 难度   | 算法                          | 说明                            |
   * | ------ | ----------------------------- | ------------------------------- |
   * | EASY   | selfPlay (lookahead=1)        | 只看当前方块，轻度启发式评估    |
   * | NORMAL | selfPlay (lookahead=1)        | 同上，但权重更严格              |
   * | HARD   | selfPlay (lookahead=2 + beam) | 前瞻搜索 + 束搜索剪枝           |
   * | EXPERT | MCTS (iterations=300)         | 蒙特卡洛树搜索，随机模拟 300 次 |
   *
   * ### 流程
   *
   * 1. 根据当前难度等级读取配置（lookahead、weights、beam 等）
   * 2. 从真实游戏状态创建快照（深拷贝，隔离 AI 模拟）
   * 3. 调用对应的决策算法
   * 4. 返回最佳移动对象（{ board, actions, y }）
   *
   * @param {object} state - 游戏状态对象（Store.getState() 的返回值）
   * @param {string[][]} state.board - 棋盘二维数组（颜色字符串格式）
   * @param {object} state.curr - 当前活动方块对象（含 shape、color）
   * @param {number} state.cx - 当前方块的 X 坐标（列索引）
   * @param {number} state.cy - 当前方块的 Y 坐标（行索引）
   * @returns {object | null} 最佳移动对象 `{ board, actions, y }`，无法决策时返回 null
   */
  think(state) {
    // 根据当前难度等级读取配置
    const difficulty = this.getDifficultyConfig();
    const { lookahead, weights, beam } = difficulty;

    // 从真实游戏状态创建快照（深拷贝，隔离 AI 模拟）
    const snapshot = createSnapshot(state);

    // EASY / NORMAL / HARD 使用 selfPlay（前瞻搜索 + 束搜索剪枝）
    return selfPlay(snapshot, weights, lookahead, beam);
  }

  /**
   * ## 获取当前难度的完整配置
   *
   * 从 Store 读取当前选择的难度等级（easy/normal/hard/expert）， 映射到对应的 `AIDifficulty` 配置对象。
   *
   * @returns {object} 难度配置对象，包含 lookahead、noise、weights、delay、beam 等字段
   */
  getDifficultyConfig() {
    const { Game } = this;
    const difficulty = Game.Store.getDifficulty();

    // 难度等级 → 配置对象映射
    const map = {
      easy: AIDifficulty.EASY,
      normal: AIDifficulty.NORMAL,
      hard: AIDifficulty.HARD,
      expert: AIDifficulty.EXPERT,
    };

    // 未知难度降级为 NORMAL
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
    const { Game } = this;
    const uuid = Game.id;
    const events = AIEvents(uuid);

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
    const uuid = Game.id;
    const events = AIEvents(uuid);

    this.off(events.START, this._onStart);
    this.off(events.STOP, this._onStop);
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
