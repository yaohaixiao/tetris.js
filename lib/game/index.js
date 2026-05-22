import Base from '@/lib/core';

/* ---------- 事件路由 ---------- */
import GameRouter from '@/lib/events/router/game-router.js';

/* ---------- 事件日志 ---------- */
import { AudioEvents, UIEvents } from '@/lib/events/event-catalog.js';

/* ---------- 子模块 ---------- */
// GameState 模块
import GameState from '@/lib/state/game-state.js';
// Store 模块
import GameStore from '../state/game-store.js';
// CommandQueue 模块
import CommandQueue from '@/lib/core/command/command-queue.js';
// AnimationSystem 模块
import AnimationSystem from '@/lib/runtime/animation-system.js';
// UI 模块
import UI from '@/lib/services/ui';
// Input 模块
import KeyboardController from '../services/input/keyboard-controller.js';
import GamepadController from '@/lib/services/input/gamepad-controller.js';
import AIController from '@/lib/ai/ai-controller.js';
// ReplayController 模块
import ReplayController from '@/lib/runtime/replay-controller.js';

/* ---------- 动画特效模块 ---------- */
import CountdownAnimation from '@/lib/services/animations/countdown-animation.js';
import PausedAnimation from '@/lib/services/animations/paused-animation.js';
import ClearLinesAnimation from '@/lib/services/animations/clear-lines-animation.js';
import LevelUpAnimation from '@/lib/services/animations/level-up-animation.js';

/* ---------- 核心流程控制逻辑功能函数 ---------- */
import begin from '@/lib/game/core/begin.js';
import start from '@/lib/game/core/start.js';
import togglePause from '@/lib/game/core/toggle-pause.js';
import reset from '@/lib/game/core/reset.js';
import restart from '@/lib/game/core/restart.js';
import over from '@/lib/game/core/over.js';

/* ---------- 游戏方块控制逻辑功能函数 ---------- */
import move from '@/lib/game/logic/move.js';
import rotate from '@/lib/game/logic/rotate.js';
import tick from '@/lib/game/logic/tick.js';
import drop from '@/lib/game/logic/drop.js';
import spawn from '@/lib/game/logic/spawn.js';

/* ---------- 游戏指令功能函数 ---------- */
import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';

/* ---------- 游戏规则功能函数 ---------- */
import getSpeed from '@/lib/game/rules/get-speed.js';

/* ---------- 通用功能函数 ---------- */
import getStorage from '@/lib/utils/get-storage.js';
import setStorage from '@/lib/utils/set-storage.js';

/**
 * # Game（游戏主控类）
 *
 * 游戏的核心协调器，负责创建和管理所有子系统，并通过事件驱动的方式协调各模块之间的交互。
 *
 * ## 核心职责
 *
 * - **模块组装**：在 `initialize()` 中创建所有子系统并注入依赖
 * - **流程协调**：监听游戏事件，调用对应的流程控制函数
 * - **操作代理**：提供 `move()`、`rotate()` 等简短的公共方法，委托给具体逻辑函数
 * - **生命周期管理**：管理 AI 的启动/停止、回放的录制/播放
 *
 * ## 架构设计
 *
 * Game 类采用**依赖注入**和**组合模式**，将所有具体功能委托给专门的子模块：
 *
 * - 状态管理委托给 `GameStore`
 * - 动画系统委托给 `AnimationSystem`
 * - 输入处理委托给 `KeyboardController` 和 `GamepadController`
 * - AI 逻辑委托给 `AIController`
 * - 回放功能委托给 `ReplayController`
 *
 * ## 依赖的子模块
 *
 * | 模块         | 说明         | 主要职责                   |
 * | ------------ | ------------ | -------------------------- |
 * | Store        | 全局状态存储 | 管理游戏状态、分数、等级等 |
 * | Animations   | 动画系统     | 管理所有游戏特效动画       |
 * | CommandQueue | 命令队列     | 处理和分发玩家操作命令     |
 * | UI           | 界面渲染     | 负责游戏画面的绘制和更新   |
 * | Keyboard     | 键盘输入     | 处理键盘按键输入           |
 * | Gamepad      | 手柄输入     | 处理游戏手柄输入           |
 * | AI           | AI 控制器    | AI 玩家的决策和执行        |
 * | Replay       | 回放系统     | 录制和回放游戏过程         |
 *
 * @augments Base
 * @class Game
 */
class Game extends Base {
  /**
   * ## 构造函数
   *
   * 接收依赖配置，调用 `initialize()` 创建所有子系统。 构造函数本身不进行复杂初始化，所有子系统的创建都在 `initialize()`
   * 中完成。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Elements - UI 元素配置，包含 Canvas 等 DOM 元素引用
   * @param {object} options.Scheduler - 任务调度器实例，用于管理游戏循环和定时任务
   * @param {boolean} [options.isAIPlayer] - 是否启用 AI 玩家（已弃用，改为从 Store 读取）
   */
  constructor(options) {
    super(options);

    // 初始化所有子系统和依赖
    this.initialize();
  }

  /**
   * ## 初始化所有子系统
   *
   * 创建 Store、Animations、UI、输入设备、AI、回放等模块，并注入它们之间的依赖关系。
   * 这是整个游戏系统的"组装工厂"，将所有模块组合成一个完整的游戏实例。
   *
   * ### 初始化顺序
   *
   * 1. 创建 Store（状态存储）- 最基础的模块，其他模块依赖它
   * 2. 设置游戏 ID - 用于事件命名空间隔离
   * 3. 创建 Animations（动画系统）- 依赖 Game 实例
   * 4. 创建 AI（AI 控制器）- 依赖 Store、Scheduler、Animations
   * 5. 创建 CommandQueue（命令队列）- 依赖 Game 实例
   * 6. 创建 UI（界面渲染）- 依赖 Store、Elements
   * 7. 创建输入设备（键盘、手柄）- 依赖 Game、Store
   * 8. 创建 Replay（回放系统）- 依赖 Game、Store、Scheduler
   * 9. 创建 Router（事件路由器）- 依赖所有子系统
   *
   * @returns {void}
   */
  initialize() {
    const { Elements, Scheduler } = this;

    // 创建全局状态存储，注入游戏状态定义
    const Store = new GameStore({
      ...Elements.Main,
      GameState,
    });

    /**
     * ## 游戏实例唯一标识
     *
     * 使用 UUID 作为游戏实例的唯一标识符。 用于构建命名空间事件名（如 `game:<id>:start`）， 支持多实例并存时的事件隔离。
     *
     * @type {string}
     */
    this.id = crypto.randomUUID();

    /**
     * ## 当前暂停特效实例
     *
     * 存储当前正在播放的暂停动画特效实例。 用于控制暂停特效的播放和停止。
     *
     * @type {PausedAnimation | null}
     */
    this.effect = null;

    /** @type {GameStore} 游戏状态存储 - 管理所有游戏状态数据 */
    this.Store = Store;

    /** @type {AnimationSystem} 动画系统 - 管理特效动画的生命周期 */
    this.Animations = new AnimationSystem({ Game: this });

    /** @type {AIController} AI 控制器 - AI 玩家的决策和执行逻辑 */
    this.AI = new AIController({
      Game: this,
      Store,
      Scheduler,
      Animations: this.Animations,
    });

    /** @type {CommandQueue} 命令队列 - 处理和分发玩家操作命令 */
    this.CommandQueue = new CommandQueue({ Game: this });

    /** @type {UI} 界面渲染 - 负责游戏画面的绘制和更新 */
    this.UI = new UI({ Game: this, Store, Elements });

    /** @type {KeyboardController} 键盘输入控制器 - 处理键盘按键输入 */
    this.Keyboard = new KeyboardController({ Game: this, Store });

    /** @type {GamepadController} 手柄输入控制器 - 处理游戏手柄输入 */
    this.Gamepad = new GamepadController({ Game: this, Store });

    /** @type {ReplayController} 回放控制器 - 录制和回放游戏过程 */
    this.Replay = new ReplayController({
      Game: this,
      Store,
      Scheduler,
    });

    /**
     * ## 事件路由器
     *
     * 负责监听所有游戏事件并分发到对应的处理方法。 实现了事件处理与业务逻辑的分离。
     *
     * @type {GameRouter}
     */
    this.Router = new GameRouter({
      Animations: this.Animations,
      AI: this.AI,
      CommandQueue: this.CommandQueue,
      Game: this,
      Replay: this.Replay,
      Store,
      UI: this.UI,
    });
  }

  /**
   * ## 选择等级
   *
   * 设置游戏等级（1-10），等级越高方块下落速度越快。 等级变更时会播放音效反馈。
   *
   * @param {number} level - 等级数值（1-10）
   * @returns {void}
   */
  selectLevel(level) {
    const events = AudioEvents();
    // 更新 Store 中的等级
    this.Store.setLevel(level);
    // 播放等级变更音效
    this.emit(events.PLAY_SOUND, { sound: 'LEVEL_CHANGED' });
  }

  /**
   * ## 切换到难度选择界面
   *
   * 将游戏模式切换为难度选择界面，并播放场景切换音效。 用户可以在该界面选择游戏难度。
   *
   * @returns {void}
   */
  switchToDifficulty() {
    const events = AudioEvents();
    // 设置游戏模式为难度选择
    this.Store.setMode('difficulty');
    // 播放场景切换音效
    this.emit(events.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  }

  /**
   * ## 选择难度
   *
   * 设置游戏难度等级，难度影响得分倍率和 AI 行为等。 难度变更时会播放音效反馈。
   *
   * @param {string} difficulty - 难度等级
   *
   *   - `easy`: 简单模式
   *   - `normal`: 普通模式
   *   - `hard`: 困难模式
   *   - `expert`: 专家模式
   *
   * @returns {void}
   */
  selectDifficulty(difficulty) {
    const events = AudioEvents();
    // 更新 Store 中的难度设置
    this.Store.setDifficulty(difficulty);
    // 播放难度变更音效
    this.emit(events.PLAY_SOUND, { sound: 'DIFFICULTY_CHANGED' });
  }

  /**
   * ## 切换到主菜单
   *
   * 将游戏模式切换回主菜单界面。 同时更新 Store 中的模式并触发 UI 更新事件。
   *
   * @returns {void}
   */
  switchToMainMenu() {
    const AE = AudioEvents();
    const UE = UIEvents(this.id);
    // 触发 UI 更新事件
    this.emit(UE.UPDATE_MODE, { mode: 'main-menu' });
    // 更新 Store 中的模式
    this.Store.setMode('main-menu');
    // 播放场景切换音效
    this.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  }

  /**
   * ## 加载最高分
   *
   * 从 localStorage 读取历史最高分并写入 Store。 如果 localStorage 中没有数据，则初始化为 0。
   *
   * @returns {void}
   */
  loadHighScore() {
    // 从本地存储读取最高分，无效值默认为 0
    const highScore = Number.parseInt(getStorage('tetris-high-score'), 10) || 0;
    // 更新 Store 中的最高分
    this.Store.setHighScore(highScore);
  }

  /**
   * ## 保存最高分
   *
   * 仅当当前得分超过历史最高分时才执行保存。 同时更新内存中的 Store 和持久化的 localStorage。
   *
   * @param {number} score - 当前得分
   * @returns {void}
   */
  saveHighScore(score) {
    const { Store } = this;

    // 只在超过历史最高分时保存
    if (score > Store.getHighScore()) {
      // 更新内存中的最高分
      Store.setHighScore(score);
      // 持久化到本地存储
      setStorage('tetris-high-score', score.toString());
    }
  }

  /*
   * ==================== 核心流程代理方法 ====================
   *
   * 以下方法是对核心流程控制函数的简单代理
   * 实际逻辑实现在独立的函数模块中，便于测试和维护
   */

  /**
   * ## 开始游戏准备
   *
   * 执行游戏开始前的准备工作，如重置状态、初始化数据等。
   *
   * @returns {void}
   */
  begin() {
    begin(this);
  }

  /**
   * ## 启动游戏
   *
   * 正式启动游戏循环，开始游戏进程。
   *
   * @returns {void}
   */
  start() {
    start(this);
  }

  /**
   * ## 切换暂停状态
   *
   * 在游戏进行中暂停或继续游戏。
   *
   * @returns {void}
   */
  togglePause() {
    togglePause(this);
  }

  /**
   * ## 重置游戏
   *
   * 重置所有游戏状态，清空分数、等级等数据。
   *
   * @returns {void}
   */
  reset() {
    reset(this);
  }

  /**
   * ## 重新开始游戏
   *
   * 完全重新开始一局新的游戏。
   *
   * @returns {void}
   */
  restart() {
    restart(this);
  }

  /**
   * ## 游戏结束
   *
   * 处理游戏结束逻辑，如显示分数、保存最高分等。
   *
   * @returns {void}
   */
  over() {
    over(this);
  }

  /**
   * ## 生成新方块
   *
   * 生成下一个方块并放置在游戏区域顶部。
   *
   * @returns {void}
   */
  spawn() {
    spawn(this);
  }

  // ==================== 方块操作代理方法 ====================

  /**
   * ## 移动当前方块
   *
   * 尝试将当前活动方块移动指定的偏移量。
   *
   * @param {number} x - X 轴偏移（列数），负数向左，正数向右
   * @param {number} y - Y 轴偏移（行数），负数向上，正数向下
   * @returns {boolean} 是否移动成功（true: 移动成功，false: 移动受阻）
   */
  move(x, y) {
    return move(this, x, y);
  }

  /**
   * ## 旋转当前方块
   *
   * 尝试旋转当前活动方块。
   *
   * @returns {void}
   */
  rotate() {
    rotate(this);
  }

  /**
   * ## 游戏逻辑帧
   *
   * 执行一帧的游戏逻辑更新（通常是方块自然下落）。
   *
   * @param {boolean} isBlocked - 是否被动画阻塞（如果为 true，跳过此帧更新）
   * @returns {void}
   */
  tick(isBlocked) {
    tick(this, isBlocked);
  }

  /**
   * ## 方块快速落底
   *
   * 将当前方块直接落底，放置在可放置的最低位置。
   *
   * @returns {void}
   */
  drop() {
    drop(this);
  }

  // ==================== 游戏指令代理方法 ====================

  /**
   * ## 执行消行逻辑
   *
   * 检查并消除所有填满的行，更新分数并返回更新数据。
   *
   * @returns {object} 消行后的更新数据，包含消除的行数、新分数等信息
   */
  applyClearLines() {
    return applyClearLines(this);
  }

  /**
   * ## 设置游戏初始状态
   *
   * 配置游戏开始时的初始模式、等级等参数。
   *
   * @param {string} mode - 游戏模式（如 'playing', 'replay' 等）
   * @param {number} [level=1] - 初始等级，默认为 1. Default is `1`
   * @returns {void}
   */
  setBeginningState(mode, level = 1) {
    setBeginningState(this, mode, level);
  }

  /**
   * ## 获取当前等级的下落速度
   *
   * 根据当前等级计算方块的自动下落间隔时间。
   *
   * @returns {number} 下落间隔（毫秒），数值越小速度越快
   */
  getSpeed() {
    return getSpeed(this);
  }

  // ==================== 动画特效控制 ====================

  /**
   * ## 开始倒计时动画
   *
   * 注册并播放游戏开始前的倒计时特效（3, 2, 1, Go!）。
   *
   * @returns {void}
   */
  startCountdown() {
    const { Scheduler } = this;
    // 注册倒计时动画到动画系统
    this.Animations.register(new CountdownAnimation({ Scheduler, Game: this }));
  }

  /**
   * ## 开始暂停动画
   *
   * 注册并播放游戏暂停时的半透明遮罩和提示文字特效。
   *
   * @returns {void}
   */
  startPaused() {
    const { Scheduler } = this;
    // 创建暂停动画实例并保存引用
    this.effect = new PausedAnimation({ Scheduler });
    // 注册到动画系统
    this.Animations.register(this.effect);
    // 开始播放动画
    this.effect.resume();
  }

  /**
   * ## 停止暂停动画
   *
   * 停止并移除当前的暂停动画特效。
   *
   * @returns {void}
   */
  stopPaused() {
    // 没有暂停特效时直接返回
    if (!this.effect) {
      return;
    }
    // 停止动画播放
    this.effect.stop();
    // 清空引用
    this.effect = null;
  }

  /**
   * ## 开始消行特效
   *
   * 注册并播放消除行的特效动画（行闪烁、消失、分数飘出等）。
   *
   * @param {number[]} linesToClear - 待消除的行号数组（从底部开始的行索引）
   * @returns {void}
   */
  startClearLines(linesToClear) {
    const { Scheduler } = this;
    // 注册消行动画到动画系统
    this.Animations.register(
      new ClearLinesAnimation({ Game: this, lines: linesToClear, Scheduler }),
    );
  }

  /**
   * ## 开始升级特效
   *
   * 注册并播放等级提升时的庆祝特效（文字提示、闪光效果等）。
   *
   * @param {number} level - 新等级数值
   * @returns {void}
   */
  startLevelUp(level) {
    const { Scheduler } = this;
    // 注册升级动画到动画系统
    this.Animations.register(
      new LevelUpAnimation({
        Game: this,
        UI: this.UI,
        level,
        Scheduler,
      }),
    );
  }

  // ==================== 事件订阅 / 取消订阅 ====================

  /**
   * ## 添加输入设备事件监听
   *
   * 启动键盘和手柄的输入事件监听。 此方法应仅在游戏需要接收输入时调用。
   *
   * @returns {void}
   */
  addEventListeners() {
    // 启动键盘监听
    this.Keyboard.addEventListeners();
    // 启动手柄监听
    this.Gamepad.addEventListeners();
  }

  /**
   * ## 移除输入设备事件监听
   *
   * 停止键盘和手柄的输入事件监听。 在游戏销毁或不需要输入时调用，避免内存泄漏。
   *
   * @returns {void}
   */
  removeEventListeners() {
    // 停止键盘监听
    this.Keyboard.removeEventListeners();
    // 停止手柄监听
    this.Gamepad.removeEventListeners();
  }

  /**
   * ## 订阅所有游戏事件
   *
   * 绑定核心流程、方块操作、动画特效、输入设备等所有事件。 同时触发各子模块的 subscribe 方法。
   *
   * 这是游戏启动的必要步骤，确保所有模块都能响应事件。
   *
   * @returns {void}
   */
  subscribe() {
    // 委托给事件路由器处理所有订阅逻辑
    this.Router.subscribe();
  }

  /**
   * ## 取消订阅所有游戏事件
   *
   * 移除所有事件监听器。 在游戏销毁或需要完全停止时调用。
   *
   * @returns {void}
   */
  unsubscribe() {
    // 委托给事件路由器处理所有取消订阅逻辑
    this.Router.unsubscribe();
  }
}

export default Game;
