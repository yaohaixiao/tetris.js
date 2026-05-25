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
import TouchController from '@/lib/services/input/touch-controller.js';
// ReplayController 模块
import ReplayController from '@/lib/runtime/replay-controller.js';

/* ---------- 动画特效模块 ---------- */
import CountdownAnimation from '@/lib/services/animations/countdown-animation.js';
import PausedAnimation from '@/lib/services/animations/paused-animation.js';
import ClearLinesAnimation from '@/lib/services/animations/clear-lines-animation.js';
import ClearScoreAnimation from '@/lib/services/animations/clear-score-animation.js';
import LevelUpAnimation from '@/lib/services/animations/level-up-animation.js';
import LandingFlashAnimation from '@/lib/services/animations/landing-flash-animation.js';

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
 * 游戏的核心协调器，负责创建和管理所有子系统， 并通过事件驱动的方式协调各模块之间的交互。
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
 * | Router       | 事件路由器   | 管理所有事件的订阅和分发   |
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
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## 初始化所有子系统
   *
   * 创建 Store、Animations、UI、输入设备、AI、回放等模块， 并注入它们之间的依赖关系。
   * 这是整个游戏系统的"组装工厂"，将所有模块组合成一个完整的游戏实例。
   *
   * ### 初始化顺序
   *
   * 1. 创建 Store（状态存储）— 最基础的模块，其他模块依赖它
   * 2. 设置游戏 ID — 用于事件命名空间隔离
   * 3. 创建 Animations（动画系统）— 依赖 Game 实例
   * 4. 创建 AI（AI 控制器）— 依赖 Store、Scheduler、Animations
   * 5. 创建 CommandQueue（命令队列）— 依赖 Game 实例
   * 6. 创建 UI（界面渲染）— 依赖 Store、Elements
   * 7. 创建输入设备（键盘、手柄）— 依赖 Game、Store
   * 8. 创建 Replay（回放系统）— 依赖 Game、Store、Scheduler
   * 9. 创建 Router（事件路由器）— 依赖所有子系统
   *
   * @returns {void}
   */
  initialize() {
    const { Elements, Scheduler } = this;
    const { Controls } = Elements;

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

    /** @type {GameStore} 游戏状态存储 — 管理所有游戏状态数据 */
    this.Store = Store;

    /** @type {AnimationSystem} 动画系统 — 管理特效动画的生命周期 */
    this.Animations = new AnimationSystem({ Game: this });

    /** @type {CommandQueue} 命令队列 — 处理和分发玩家操作命令 */
    this.CommandQueue = new CommandQueue({ Game: this });

    /** @type {AIController} AI 控制器 — AI 玩家的决策和执行逻辑 */
    this.AI = new AIController({
      Game: this,
      Store,
      Scheduler,
      Animations: this.Animations,
    });

    /** @type {UI} 界面渲染 — 负责游戏画面的绘制和更新 */
    this.UI = new UI({ Game: this, Store, Elements });

    /** @type {KeyboardController} 键盘输入控制器 — 处理键盘按键输入 */
    this.Keyboard = new KeyboardController({ Game: this, Store });

    /** @type {GamepadController} 手柄输入控制器 — 处理游戏手柄输入 */
    this.Gamepad = new GamepadController({ Game: this, Store });

    /** @type {TouchController} 按钮输入控制器 — 处理游戏按钮输入 */
    this.Touch = new TouchController({ Game: this, Store, Controls });

    /** @type {ReplayController} 回放控制器 — 录制和回放游戏过程 */
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

  // ==================== 场景控制 ====================

  /**
   * ## 选择等级
   *
   * 设置游戏等级，等级越高方块下落速度越快。 等级变更时会播放音效反馈。
   *
   * @param {number} level - 等级数值
   * @returns {void}
   */
  selectLevel(level) {
    const AE = AudioEvents();
    this.Store.setLevel(level);
    this.emit(AE.PLAY_SOUND, { sound: 'LEVEL_CHANGED' });
  }

  /**
   * ## 切换到难度选择界面
   *
   * 将游戏模式切换为难度选择界面，并播放场景切换音效。
   *
   * @returns {void}
   */
  switchToDifficulty() {
    const AE = AudioEvents();
    this.Store.setMode('difficulty');
    this.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  }

  /**
   * ## 选择难度
   *
   * 设置游戏难度等级，难度影响初始棋盘和 AI 行为等。
   *
   * @param {string} difficulty - 难度等级（`easy` / `normal` / `hard` / `expert`）
   * @returns {void}
   */
  selectDifficulty(difficulty) {
    const AE = AudioEvents();
    this.Store.setDifficulty(difficulty);
    this.emit(AE.PLAY_SOUND, { sound: 'DIFFICULTY_CHANGED' });
  }

  /**
   * ## 切换到主菜单
   *
   * 将游戏模式切换回主菜单界面。
   *
   * @returns {void}
   */
  switchToMainMenu() {
    const AE = AudioEvents();
    const UE = UIEvents(this.id);
    this.emit(UE.UPDATE_MODE, { mode: 'main-menu' });
    this.Store.setMode('main-menu');
    this.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  }

  // ==================== 存档管理 ====================

  /**
   * ## 加载最高分
   *
   * 从 localStorage 读取历史最高分并写入 Store。
   *
   * @returns {void}
   */
  loadHighScore() {
    const highScore = Number.parseInt(getStorage('tetris-high-score'), 10) || 0;
    this.Store.setHighScore(highScore);
  }

  /**
   * ## 保存最高分
   *
   * 仅当当前得分超过历史最高分时才执行保存。
   *
   * @param {number} score - 当前得分
   * @returns {void}
   */
  saveHighScore(score) {
    const { Store } = this;

    if (score > Store.getHighScore()) {
      Store.setHighScore(score);
      setStorage('tetris-high-score', score.toString());
    }
  }

  // ==================== 核心流程代理方法 ====================

  /**
   * ## 开始游戏准备
   *
   * @returns {void}
   */
  begin() {
    begin(this);
  }

  /**
   * ## 启动游戏（进入倒计时）
   *
   * @returns {void}
   */
  start() {
    start(this);
  }

  /**
   * ## 切换暂停状态
   *
   * @returns {void}
   */
  togglePause() {
    togglePause(this);
  }

  /**
   * ## 重置游戏
   *
   * @returns {void}
   */
  reset() {
    reset(this);
  }

  /**
   * ## 重新开始游戏
   *
   * @returns {void}
   */
  restart() {
    restart(this);
  }

  /**
   * ## 游戏结束
   *
   * @returns {void}
   */
  over() {
    over(this);
  }

  /**
   * ## 生成新方块
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
   * @param {number} x - X 轴偏移（负数左移，正数右移）
   * @param {number} y - Y 轴偏移（负数上移，正数下移）
   * @returns {boolean} 是否移动成功
   */
  move(x, y) {
    return move(this, x, y);
  }

  /**
   * ## 旋转当前方块
   *
   * @returns {void}
   */
  rotate() {
    rotate(this);
  }

  /**
   * ## 游戏逻辑帧
   *
   * @param {boolean} isBlocked - 是否被动画阻塞
   * @returns {void}
   */
  tick(isBlocked) {
    tick(this, isBlocked);
  }

  /**
   * ## 方块快速落底（硬降）
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
   * @returns {object} 消行后的更新数据
   */
  applyClearLines() {
    return applyClearLines(this);
  }

  /**
   * ## 设置游戏初始状态
   *
   * @param {string} mode - 游戏模式
   * @param {number} [level=1] - 初始等级。默认值为 `1`. Default is `1`
   * @returns {void}
   */
  setBeginningState(mode, level = 1) {
    setBeginningState(this, mode, level);
  }

  /**
   * ## 获取当前等级的下落速度
   *
   * @returns {number} 下落间隔（毫秒）
   */
  getSpeed() {
    return getSpeed(this);
  }

  // ==================== 动画特效控制 ====================

  /**
   * ## 开始倒计时动画
   *
   * @returns {void}
   */
  startCountdown() {
    const { Scheduler } = this;
    this.Animations.register(new CountdownAnimation({ Scheduler, Game: this }));
  }

  /**
   * ## 开始暂停动画
   *
   * @returns {void}
   */
  startPaused() {
    const { Scheduler } = this;
    this.effect = new PausedAnimation({ Scheduler });
    this.Animations.register(this.effect);
    this.effect.resume();
  }

  /**
   * ## 停止暂停动画
   *
   * @returns {void}
   */
  stopPaused() {
    if (!this.effect) return;
    this.effect.stop();
    this.effect = null;
  }

  /**
   * ## 开始消行闪烁动画
   *
   * @param {number[]} linesToClear - 待消除的行号数组
   * @returns {void}
   */
  startClearLines(linesToClear) {
    const { Scheduler, Store } = this;
    this.Animations.register(
      new ClearLinesAnimation({
        Game: this,
        Store,
        Scheduler,
        lines: linesToClear,
      }),
    );
  }

  /**
   * ## 开始消除得分动画
   *
   * @param {object} scoreData - 得分数据
   * @param {number} scoreData.score - 本次消除得分
   * @param {number[]} scoreData.lines - 消除的行号数组
   * @returns {void}
   */
  startClearScore(scoreData) {
    const { Scheduler } = this;
    this.Animations.register(
      new ClearScoreAnimation({
        Game: this,
        scoreData,
        Scheduler,
      }),
    );
  }

  /**
   * ## 开始升级烟花动画
   *
   * @param {number} level - 新等级
   * @returns {void}
   */
  startLevelUp(level) {
    const { Scheduler, UI } = this;
    this.Animations.register(
      new LevelUpAnimation({
        Game: this,
        UI,
        level,
        Scheduler,
      }),
    );
  }

  /**
   * ## 开始落地高亮动画
   *
   * @param {object} piece - 刚落地的方块信息
   * @param {number[][]} piece.shape - 方块形状矩阵
   * @param {number} piece.cx - 方块 X 坐标
   * @param {number} piece.cy - 方块 Y 坐标
   * @returns {void}
   */
  startLandingFlash(piece) {
    const { Scheduler } = this;
    this.Animations.register(
      new LandingFlashAnimation({
        Game: this,
        piece,
        Scheduler,
      }),
    );
  }

  // ==================== 事件订阅 / 取消订阅 ====================

  /**
   * ## 添加输入设备事件监听
   *
   * 启动键盘和手柄的输入事件监听。
   *
   * @returns {void}
   */
  addEventListeners() {
    this.Keyboard.addEventListeners();
    this.Gamepad.addEventListeners();
    this.Touch.addEventsListeners();
  }

  /**
   * ## 移除输入设备事件监听
   *
   * 停止键盘和手柄的输入事件监听。
   *
   * @returns {void}
   */
  removeEventListeners() {
    this.Keyboard.removeEventListeners();
    this.Gamepad.removeEventListeners();
    this.Touch.removeEventListeners();
  }

  /**
   * ## 订阅所有游戏事件
   *
   * 绑定核心流程、方块操作、动画特效、输入设备等所有事件。 同时触发各子模块的 subscribe 方法。
   *
   * @returns {void}
   */
  subscribe() {
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
    this.Router.unsubscribe();
  }
}

export default Game;
