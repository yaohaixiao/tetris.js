import Base from '@/lib/core';

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
    this.Store.setLevel(level);
    this.emit('audio:resume:sound', { sound: 'LEVEL_CHANGED' });
  }

  /**
   * ## 切换到难度选择界面
   *
   * @returns {void}
   */
  switchToDifficulty() {
    this.Store.setMode('difficulty');
    this.emit('audio:resume:sound', { sound: 'SWITCH_SCENE' });
  }

  /**
   * ## 选择难度
   *
   * @param {string} difficulty - 难度等级（easy / normal / hard / expert）
   * @returns {void}
   */
  selectDifficulty(difficulty) {
    this.Store.setDifficulty(difficulty);
    this.emit('audio:resume:sound', { sound: 'DIFFICULTY_CHANGED' });
  }

  /**
   * ## 切换到主菜单
   *
   * @returns {void}
   */
  switchToMainMenu() {
    this.emit(`ui:${this.id}:update:mode`, { mode: 'main-menu' });
    this.Store.setMode('main-menu');
    this.emit('audio:resume:sound', { sound: 'SWITCH_SCENE' });
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
    this.Animations.register(
      new CountdownAnimation({ Scheduler: this.Scheduler, Game: this }),
    );
  }

  /** @returns {void} */
  startPaused() {
    this.effect = new PausedAnimation({ Scheduler: this.Scheduler });
    this.Animations.register(this.effect);
    this.effect.resume();
  }

  /** @returns {void} */
  stopPaused() {
    if (!this.effect) return;
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
    this.Animations.register(
      new ClearLinesAnimation({ Game: this, lines: linesToClear }),
    );
  }

  /**
   * ## 开始升级特效
   *
   * @param {number} level - 新等级
   * @returns {void}
   */
  startLevelUp(level) {
    this.Animations.register(
      new LevelUpAnimation({
        Scheduler: this.Scheduler,
        Game: this,
        UI: this.UI,
        level,
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

    /* ---------- 切换游戏控制者 ---------- */
    this.on(`game:${uuid}:swtich:controller`, this._onSwitchController);

    /* ---------- 状态更新 ---------- */
    this.on(`game:${uuid}:update:state`, this._onUpdateState);
    this.on(`game:${uuid}:update:mode`, this._onUpdateMode);
    this.on(`game:${uuid}:update:level`, this._onUpdateLevel);
    this.on(
      `game:${uuid}:update:gamepad:connected`,
      this._onUpdateGamepadConnected,
    );

    /* ---------- 渲染状态更新 ---------- */
    this.on(`game:${uuid}:update:hud`, this._onUpdateHud);
    this.on(`game:${uuid}:save:high:score`, this._onSaveHighScore);
    this.on(`game:${uuid}:select:level`, this._onSelectLevel);
    this.on(`game:${uuid}:switch:difficulty`, this._onSwitchToDifficulty);
    this.on(`game:${uuid}:select:difficulty`, this._onSelectDifficulty);
    this.on(`game:${uuid}:switch:to:main:menu`, this._onSwitchToMainMenu);

    /* ---------- 回放状态更新 ---------- */
    this.on(`game:${uuid}:replay:prepare:board`, this._onReplayPrepareBoard);

    /* ---------- 核心流程 ---------- */
    this.on(`game:${uuid}:begin`, this._onGameBegin);
    this.on(`game:${uuid}:start`, this._onGameStart);
    this.on(`game:${uuid}:toggle:paused`, this._onTogglePaused);
    this.on(`game:${uuid}:restart`, this._onGameRestart);
    this.on(`game:${uuid}:reset`, this._onGameReset);
    this.on(`game:${uuid}:over`, this._onGameOver);

    /* ---------- 方块操作 ---------- */
    this.on(`game:${uuid}:block:move`, this._onBlockMove);
    this.on(`game:${uuid}:block:rotate`, this._onBlockRotate);
    this.on(`game:${uuid}:block:drop`, this._onBlockDrop);
    this.on(`game:${uuid}:block:tick`, this._onBlockTick);

    /* ---------- 背景音乐 ---------- */
    this.on(`game:${uuid}:toggle:bgm`, this._onToggleBGM);

    /* ---------- 动画特效 ---------- */
    this.on(`game:${uuid}:start:countdown`, this._onStartCountdown);
    this.on(`game:${uuid}:start:paused`, this._onStartPaused);
    this.on(`game:${uuid}:stop:paused`, this._onStopPaused);
    this.on(`game:${uuid}:start:clear:lines`, this._onStartClearLines);
    this.on(`game:${uuid}:start:level:up`, this._onStartLevelUp);

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

    /* ---------- 切换游戏控制者 ---------- */
    this.off(`game:${uuid}:swtich:controller`, this._onSwitchController);

    /* ---------- 状态更新 ---------- */
    this.off(`game:${uuid}:update:state`, this._onUpdateState);
    this.off(`game:${uuid}:update:mode`, this._onUpdateMode);
    this.off(`game:${uuid}:update:level`, this._onUpdateLevel);
    this.off(
      `game:${uuid}:update:gamepad:connected`,
      this._onUpdateGamepadConnected,
    );

    /* ---------- 渲染状态更新 ---------- */
    this.off(`game:${uuid}:update:hud`, this._onUpdateHud);
    this.off(`game:${uuid}:save:high:score`, this._onSaveHighScore);
    this.off(`game:${uuid}:select:level`, this._onSelectLevel);
    this.off(`game:${uuid}:switch:difficulty`, this._onSwitchToDifficulty);
    this.off(`game:${uuid}:select:difficulty`, this._onSelectDifficulty);
    this.off(`game:${uuid}:switch:to:main:menu`, this._onSwitchToMainMenu);

    /* ---------- 回放状态更新 ---------- */
    this.off(`game:${uuid}:replay:prepare:board`, this._onReplayPrepareBoard);

    /* ---------- 核心流程 ---------- */
    this.off(`game:${uuid}:begin`, this._onGameBegin);
    this.off(`game:${uuid}:start`, this._onGameStart);
    this.off(`game:${uuid}:toggle:paused`, this._onTogglePaused);
    this.off(`game:${uuid}:reset`, this._onGameReset);
    this.off(`game:${uuid}:restart`, this._onGameRestart);
    this.off(`game:${uuid}:over`, this._onGameOver);

    /* ---------- 方块操作 ---------- */
    this.off(`game:${uuid}:block:move`, this._onBlockMove);
    this.off(`game:${uuid}:block:rotate`, this._onBlockRotate);
    this.off(`game:${uuid}:block:drop`, this._onBlockDrop);
    this.off(`game:${uuid}:block:tick`, this._onBlockTick);

    /* ---------- 背景音乐 ---------- */
    this.off(`game:${uuid}:toggle:bgm`, this._onToggleBGM);

    /* ---------- 动画特效 ---------- */
    this.off(`game:${uuid}:start:countdown`, this._onStartCountdown);
    this.off(`game:${uuid}:start:paused`, this._onStartPaused);
    this.off(`game:${uuid}:stop:paused`, this._onStopPaused);
    this.off(`game:${uuid}:start:clear:lines`, this._onStartClearLines);
    this.off(`game:${uuid}:start:level:up`, this._onStartLevelUp);

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

    Store.setController(controller);

    if (controller === 'ai') {
      this.emit(`ai:${uuid}:start`);
    } else {
      this.emit(`ai:${uuid}:stop`);
    }

    this.emit(`ui:${uuid}:update:controller`, { controller });
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
    this.emit(`ui:${this.id}:update:mode`, { mode });
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
    this.emit(`ui:${this.id}:update:hud`, { state: this.Store.getState() });
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
    this.selectLevel(level);
    this.emit(`ui:${this.id}:update:hud`, { state: this.Store.getState() });
  };

  /** @private */
  _onSwitchToDifficulty = () => {
    this.emit(`ui:${this.id}:update:mode`, { mode: 'difficulty' });
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
    this.start();

    if (this.Store.getController() === 'ai') {
      this.emit(`ai:${this.id}:start`);
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
    this.togglePause();

    if (this.Store.getController() === 'ai') {
      const { mode } = this.Store.getState();
      if (mode === 'paused') {
        this.emit(`ai:${uuid}:stop`);
      } else if (mode === 'playing') {
        this.emit(`ai:${uuid}:start`);
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
    this.emit('audio:toggle:bgm', {
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
  _onReplayPrepareBoard = () => {
    const { id, Store } = this;

    Store.resetBoard();
    Store.setState({
      board: Store.getBeginningBoard(),
      score: 0,
      lines: 0,
      level: 1,
    });

    this.emit(`ui:${id}:update:mode`, { mode: 'replay' });
    Store.setMode('replay');
    this.emit(`ui:${id}:update:hud`, { state: Store.getState() });
    this.emit(`replay:${id}:start:play`);
    spawn(this);
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
