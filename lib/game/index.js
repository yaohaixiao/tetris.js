import Base from '@/lib/core';

/* ---------- 事件日志 ---------- */
import {
  AudioEvents,
  AIEvents,
  GameEvents,
  UIEvents,
  ReplayEvents,
} from '@/lib/events/event-catalog.js';

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
 * 游戏的核心协调器，负责创建和管理所有子系统， 并通过事件驱动的方式协调各模块之间的交互。
 *
 * ## 核心职责
 *
 * - **模块组装**：在 `initialize()` 中创建所有子系统并注入依赖
 * - **流程协调**：监听游戏事件，调用对应的流程控制函数
 * - **操作代理**：提供 `move()`、`rotate()` 等简短的公共方法，委托给具体逻辑函数
 * - **生命周期管理**：管理 AI 的启动/停止、回放的录制/播放
 *
 * ## 依赖的子模块
 *
 * | 模块         | 说明         |
 * | ------------ | ------------ |
 * | Store        | 全局状态存储 |
 * | Animations   | 动画系统     |
 * | CommandQueue | 命令队列     |
 * | UI           | 界面渲染     |
 * | Keyboard     | 键盘输入     |
 * | Gamepad      | 手柄输入     |
 * | AI           | AI 控制器    |
 * | Replay       | 回放系统     |
 *
 * @class Game
 */
class Game extends Base {
  /**
   * ## 构造函数
   *
   * 接收依赖配置，调用 `initialize()` 创建所有子系统。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Elements - UI 元素配置
   * @param {object} options.Scheduler - 任务调度器实例
   * @param {boolean} [options.isAIPlayer] - 是否启用 AI 玩家（已弃用，改为从 Store 读取）
   */
  constructor(options) {
    super(options);

    this.initialize();
  }

  /**
   * ## 初始化所有子系统
   *
   * 创建 Store、Animations、UI、输入设备、AI、回放等模块， 并注入它们之间的依赖关系。
   *
   * @returns {void}
   */
  initialize() {
    const { Elements, Scheduler } = this;
    const Store = new GameStore({
      ...Elements.Main,
      GameState,
    });

    /**
     * ## 游戏实例唯一标识
     *
     * 用于构建命名空间事件名（如 `game:<id>:start`）
     *
     * @type {string}
     */
    this.id = crypto.randomUUID();

    /**
     * ## 当前暂停特效实例
     *
     * @type {PausedAnimation | null}
     */
    this.effect = null;

    /** @type {GameStore} 游戏状态存储 */
    this.Store = Store;

    /** @type {AnimationSystem} 动画系统 */
    this.Animations = new AnimationSystem({ Game: this });

    /** @type {CommandQueue} 命令队列 */
    this.CommandQueue = new CommandQueue({ Game: this });

    /** @type {UI} 界面渲染 */
    this.UI = new UI({ Game: this, Store, Elements });

    /** @type {KeyboardController} 键盘输入控制器 */
    this.Keyboard = new KeyboardController({ Game: this, Store });

    /** @type {GamepadController} 手柄输入控制器 */
    this.Gamepad = new GamepadController({ Game: this, Store });

    /** @type {AIController} AI 控制器 */
    this.AI = new AIController({
      Game: this,
      Store,
      Scheduler,
      Animations: this.Animations,
    });

    /** @type {ReplayController} 回放控制器 */
    this.Replay = new ReplayController({
      Game: this,
      Store,
      Scheduler,
    });
  }

  /**
   * ## 选择等级
   *
   * @param {number} level - 等级数值（1-10）
   * @returns {void}
   */
  selectLevel(level) {
    const events = AudioEvents();
    this.Store.setLevel(level);
    this.emit(events.PLAY_SOUND, { sound: 'LEVEL_CHANGED' });
  }

  /**
   * ## 切换到难度选择界面
   *
   * @returns {void}
   */
  switchToDifficulty() {
    const events = AudioEvents();
    this.Store.setMode('difficulty');
    this.emit(events.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  }

  /**
   * ## 选择难度
   *
   * @param {string} difficulty - 难度等级（easy / normal / hard / expert）
   * @returns {void}
   */
  selectDifficulty(difficulty) {
    const events = AudioEvents();
    this.Store.setDifficulty(difficulty);
    this.emit(events.PLAY_SOUND, { sound: 'DIFFICULTY_CHANGED' });
  }

  /**
   * ## 切换到主菜单
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

  /** @returns {void} */
  begin() {
    begin(this);
  }

  /** @returns {void} */
  start() {
    start(this);
  }

  /** @returns {void} */
  togglePause() {
    togglePause(this);
  }

  /** @returns {void} */
  reset() {
    reset(this);
  }

  /** @returns {void} */
  restart() {
    restart(this);
  }

  /** @returns {void} */
  over() {
    over(this);
  }

  // ==================== 方块操作代理方法 ====================

  /**
   * ## 移动当前方块
   *
   * @param {number} x - X 轴偏移
   * @param {number} y - Y 轴偏移
   * @returns {boolean} 是否移动成功
   */
  move(x, y) {
    return move(this, x, y);
  }

  /** @returns {void} */
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

  /** @returns {void} */
  drop() {
    drop(this);
  }

  // ==================== 游戏指令代理方法 ====================

  /** @returns {object} 消行后的更新数据 */
  applyClearLines() {
    return applyClearLines(this);
  }

  /**
   * ## 设置游戏初始状态
   *
   * @param {string} mode - 游戏模式
   * @param {number} [level=1] - 初始等级. Default is `1`
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

  /** @returns {void} */
  startCountdown() {
    const { Scheduler } = this;
    this.Animations.register(new CountdownAnimation({ Scheduler, Game: this }));
  }

  /** @returns {void} */
  startPaused() {
    const { Scheduler } = this;
    this.effect = new PausedAnimation({ Scheduler });
    this.Animations.register(this.effect);
    this.effect.resume();
  }

  /** @returns {void} */
  stopPaused() {
    if (!this.effect) {
      return;
    }
    this.effect.stop();
    this.effect = null;
  }

  /**
   * ## 开始消行特效
   *
   * @param {number[]} linesToClear - 待消除的行号数组
   * @returns {void}
   */
  startClearLines(linesToClear) {
    const { Scheduler } = this;
    this.Animations.register(
      new ClearLinesAnimation({ Game: this, lines: linesToClear, Scheduler }),
    );
  }

  /**
   * ## 开始升级特效
   *
   * @param {number} level - 新等级
   * @returns {void}
   */
  startLevelUp(level) {
    const { Scheduler } = this;
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
   * ## 订阅所有游戏事件
   *
   * 绑定核心流程、方块操作、动画特效、输入设备等所有事件。 同时触发各子模块的 subscribe。
   *
   * @returns {void}
   */
  subscribe() {
    const uuid = this.id;
    const events = GameEvents(uuid);

    /* ---------- 状态更新 ---------- */
    this.on(events.UPDATE_STATE, this._onUpdateState);
    this.on(events.UPDATE_MODE, this._onUpdateMode);
    this.on(events.UPDATE_LEVEL, this._onUpdateLevel);
    this.on(events.UPDATE_GAMEPAD_CONNECTED, this._onUpdateGamepadConnected);

    /* ---------- HUD 更新 ---------- */
    this.on(events.SWITCH_CONTROLLER, this._onSwitchController);
    this.on(events.UPDATE_HUD, this._onUpdateHud);
    this.on(events.SAVE_HIGH_SCORE, this._onSaveHighScore);

    /* ---------- 场景更新 ---------- */
    this.on(events.SELECT_LEVEL, this._onSelectLevel);
    this.on(events.SWITCH_TO_DIFFICULTY, this._onSwitchToDifficulty);
    this.on(events.SELECT_DIFFICULTY, this._onSelectDifficulty);
    this.on(events.SWITCH_TO_MAIN_MENU, this._onSwitchToMainMenu);

    /* ---------- 核心流程 ---------- */
    this.on(events.BEGIN, this._onGameBegin);
    this.on(events.START, this._onGameStart);
    this.on(events.TOGGLE_PAUSED, this._onTogglePaused);
    this.on(events.RESTART, this._onGameRestart);
    this.on(events.RESET, this._onGameReset);
    this.on(events.OVER, this._onGameOver);

    /* ---------- 方块操作 ---------- */
    this.on(events.BLOCK_MOVE, this._onBlockMove);
    this.on(events.BLOCK_ROTATE, this._onBlockRotate);
    this.on(events.BLOCK_DROP, this._onBlockDrop);
    this.on(events.BLOCK_TICK, this._onBlockTick);
    this.on(events.BLOCK_SPAWN, this._onBlockSpawn);

    /* ---------- 动画特效 ---------- */
    this.on(events.START_COUNTDOWN, this._onStartCountdown);
    this.on(events.START_PAUSED, this._onStartPaused);
    this.on(events.STOP_PAUSED, this._onStopPaused);
    this.on(events.START_CLEAR_LINES, this._onStartClearLines);
    this.on(events.START_LEVEL_UP, this._onStartLevelUp);

    /* ---------- 背景音乐 ---------- */
    this.on(events.TOGGLE_BGM, this._onToggleBGM);

    /* ---------- 游戏回放 ---------- */
    this.on(events.REPLAY_PREPARE, this._onReplayPrepare);

    /* ---------- 子模块订阅 ---------- */
    this.Keyboard.addEventListeners();
    this.Gamepad.addEventListeners();
    this.UI.subscribe();
    this.Replay.subscribe();
    this.Animations.subscribe();
    this.CommandQueue.subscribe();
    this.AI.subscribe();
  }

  /**
   * ## 取消订阅所有游戏事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const uuid = this.id;
    const events = GameEvents(uuid);

    /* ---------- 状态更新 ---------- */
    this.off(events.UPDATE_STATE, this._onUpdateState);
    this.off(events.UPDATE_MODE, this._onUpdateMode);
    this.off(events.UPDATE_LEVEL, this._onUpdateLevel);
    this.off(events.UPDATE_GAMEPAD_CONNECTED, this._onUpdateGamepadConnected);

    /* ---------- HUD 更新 ---------- */
    this.off(events.SWITCH_CONTROLLER, this._onSwitchController);
    this.off(events.UPDATE_HUD, this._onUpdateHud);
    this.off(events.SAVE_HIGH_SCORE, this._onSaveHighScore);

    /* ---------- 场景更新 ---------- */
    this.off(events.SELECT_LEVEL, this._onSelectLevel);
    this.off(events.SWITCH_TO_DIFFICULTY, this._onSwitchToDifficulty);
    this.off(events.SELECT_DIFFICULTY, this._onSelectDifficulty);
    this.off(events.SWITCH_TO_MAIN_MENU, this._onSwitchToMainMenu);

    /* ---------- 核心流程 ---------- */
    this.off(events.BEGIN, this._onGameBegin);
    this.off(events.START, this._onGameStart);
    this.off(events.TOGGLE_PAUSED, this._onTogglePaused);
    this.off(events.RESTART, this._onGameRestart);
    this.off(events.RESET, this._onGameReset);
    this.off(events.OVER, this._onGameOver);

    /* ---------- 方块操作 ---------- */
    this.off(events.BLOCK_MOVE, this._onBlockMove);
    this.off(events.BLOCK_ROTATE, this._onBlockRotate);
    this.off(events.BLOCK_DROP, this._onBlockDrop);
    this.off(events.BLOCK_TICK, this._onBlockTick);
    this.off(events.BLOCK_SPAWN, this._onBlockSpawn);

    /* ---------- 动画特效 ---------- */
    this.off(events.START_COUNTDOWN, this._onStartCountdown);
    this.off(events.START_PAUSED, this._onStartPaused);
    this.off(events.STOP_PAUSED, this._onStopPaused);
    this.off(events.START_CLEAR_LINES, this._onStartClearLines);
    this.off(events.START_LEVEL_UP, this._onStartLevelUp);

    /* ---------- 背景音乐 ---------- */
    this.off(events.TOGGLE_PAUSED, this._onToggleBGM);

    /* ---------- 游戏回放 ---------- */
    this.off(events.REPLAY_PREPARE, this._onReplayPrepare);

    /* ---------- 子模块取消订阅 ---------- */
    this.Keyboard.removeEventListeners();
    this.Gamepad.removeEventListeners();
    this.UI.unsubscribe();
    this.Replay.unsubscribe();
    this.Animations.unsubscribe();
    this.CommandQueue.unsubscribe();
    this.AI.unsubscribe();
  }

  // ==================== 事件处理器（私有） ====================

  /**
   * ## 切换控制者（human ↔ ai）
   *
   * @private
   * @returns {void}
   */
  _onSwitchController = () => {
    const { Store } = this;
    const uuid = this.id;
    const controller = Store.getController() === 'human' ? 'ai' : 'human';
    const AE = AIEvents(uuid);
    const UE = UIEvents(uuid);

    Store.setController(controller);

    if (controller === 'ai') {
      this.emit(AE.START);
    } else {
      this.emit(AE.STOP);
    }

    this.emit(UE.UPDATE_CONTROLLER, { controller });
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onUpdateState = (options) => {
    const { stateHandler } = options;
    this.Store.setState(stateHandler);
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onUpdateMode = (options) => {
    const { mode } = options;
    const events = UIEvents(this.id);
    this.emit(events.UPDATE_MODE, { mode });
    this.Store.setMode(mode);
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onUpdateLevel = (options) => {
    const { level } = options;
    this.Store.setLevel(level);
  };

  /** @private */
  _onUpdateHud = () => {
    const events = UIEvents(this.id);
    this.emit(events.UPDATE_HUD, { state: this.Store.getState() });
  };

  /** @private */
  _onSaveHighScore = () => {
    this.saveHighScore(this.Store.getScore());
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onSelectLevel = (options) => {
    const { level } = options;
    const events = UIEvents(this.id);
    this.selectLevel(level);
    this.emit(events.UPDATE_HUD, { state: this.Store.getState() });
  };

  /** @private */
  _onSwitchToDifficulty = () => {
    const events = UIEvents(this.id);
    this.emit(events.UPDATE_MODE, { mode: 'difficulty' });
    this.switchToDifficulty();
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onSelectDifficulty = (options) => {
    const { difficulty } = options;
    this.selectDifficulty(difficulty);
  };

  /** @private */
  _onSwitchToMainMenu = () => {
    this.switchToMainMenu();
  };

  /** @private */
  _onGameBegin = () => {
    this.begin();
  };

  /**
   * ## 游戏开始事件处理
   *
   * 进入倒计时阶段。如果当前是 AI 控制，发送 `ai:start` 事件。
   *
   * @private
   * @returns {void}
   */
  _onGameStart = () => {
    const events = AIEvents(this.id);
    this.start();

    if (this.Store.getController() === 'ai') {
      this.emit(events.START);
    }
  };

  /**
   * ## 暂停/继续切换事件处理
   *
   * 根据切换后的模式自动管理 AI 的启停。
   *
   * @private
   * @returns {void}
   */
  _onTogglePaused = () => {
    const uuid = this.id;
    const events = AIEvents(uuid);

    this.togglePause();

    if (this.Store.getController() === 'ai') {
      const { mode } = this.Store.getState();
      if (mode === 'paused') {
        this.emit(events.STOP);
      } else if (mode === 'playing') {
        this.emit(events.START);
      }
    }
  };

  /** @private */
  _onGameReset = () => {
    this.reset();
  };

  /** @private */
  _onGameRestart = () => {
    this.restart();
  };

  /** @private */
  _onGameOver = () => {
    this.over();
  };

  /** @private */
  _onBlockSpawn = () => {
    spawn(this);
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onBlockMove = (options) => {
    const { ox, oy } = options;
    this.move(ox, oy);
  };

  /** @private */
  _onBlockRotate = () => {
    this.rotate();
  };

  /** @private */
  _onBlockDrop = () => {
    this.drop();
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onBlockTick = (options) => {
    const { isBlocked } = options;
    this.tick(isBlocked);
  };

  /** @private */
  _onToggleBGM = () => {
    const { Store, Level } = this;
    const events = AudioEvents();
    this.emit(events.TOGGLE_BGM, {
      level: Store.getLevel(),
      maxLevel: Level.max,
    });
  };

  /**
   * ## 回放准备棋盘事件处理
   *
   * 重置棋盘为初始状态，设置回放模式，开始回放。
   *
   * @private
   * @returns {void}
   */
  _onReplayPrepare = () => {
    const { id, Store } = this;
    const UE = UIEvents(id);
    const RE = ReplayEvents(id);
    const GE = GameEvents(id);

    Store.resetBoard();
    Store.setState({
      board: Store.getBeginningBoard(),
      score: 0,
      lines: 0,
      level: 1,
    });

    this.emit(UE.UPDATE_MODE, { mode: 'replay' });
    Store.setMode('replay');
    this.emit(UE.UPDATE_HUD, { state: Store.getState() });
    this.emit(RE.START_PLAY);
    this.emit(GE.BLOCK_SPAWN);
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onUpdateGamepadConnected = (options) => {
    const { connected } = options;
    this.Store.setGamepadConnected(connected);
  };

  /** @private */
  _onStartCountdown = () => {
    this.startCountdown();
  };

  /** @private */
  _onStartPaused = () => {
    this.startPaused();
  };

  /** @private */
  _onStopPaused = () => {
    this.stopPaused();
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onStartClearLines = (options) => {
    const { linesToClear } = options;
    this.startClearLines(linesToClear);
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onStartLevelUp = (options) => {
    const { level } = options;
    this.startLevelUp(level);
  };
}

export default Game;
