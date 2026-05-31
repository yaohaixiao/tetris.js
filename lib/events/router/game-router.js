import Base from '@/lib/core';
import {
  AudioEvents,
  AIEvents,
  GameEvents,
  UIEvents,
  ReplayEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # GameRouter（游戏事件路由器）
 *
 * 负责监听所有 `game:*` 命名空间的事件， 并将它们路由到 `Game` 实例的对应方法或 Store 操作。
 * 同时管理所有子模块（AI、Animations、CommandQueue、Replay、UI）的订阅和取消订阅。
 *
 * ## 架构定位
 *
 *     EventBus → GameRouter（本模块）→ Game 方法 / Store 操作
 *       → 子模块 subscribe / unsubscribe
 *       → 跨领域事件转发（AI / UI / Audio / Replay）
 *
 * - **纯路由层**：不包含任何业务逻辑，只做事件到方法的映射
 * - **子模块管理**：统一管理所有子模块的生命周期（subscribe / unsubscribe）
 * - **跨领域协调**：在需要时转发事件到其他领域（如 AI 启停、UI 更新、音频控制）
 *
 * ## 职责边界
 *
 * | 组件       | 职责                |
 * | ---------- | ------------------- |
 * | GameRouter | 事件监听 → 方法调用 |
 * | Game       | 业务逻辑执行        |
 * | Store      | 状态管理            |
 *
 * ## 事件路由表
 *
 * | 事件                 | 处理方法                | 说明                   |
 * | -------------------- | ----------------------- | ---------------------- |
 * | UPDATE_STATE         | `_onUpdateState`        | 更新 Store 状态        |
 * | UPDATE_MODE          | `_onUpdateMode`         | 更新游戏模式 + UI 通知 |
 * | UPDATE_LEVEL         | `_onUpdateLevel`        | 更新等级               |
 * | SWITCH_CONTROLLER    | `_onSwitchController`   | human ↔ ai 切换        |
 * | UPDATE_HUD           | `_onUpdateHud`          | 刷新 HUD 显示          |
 * | SAVE_HIGH_SCORE      | `_onSaveHighScore`      | 保存最高分             |
 * | SELECT_LEVEL         | `_onSelectLevel`        | 选择等级               |
 * | SWITCH_TO_DIFFICULTY | `_onSwitchToDifficulty` | 切换到难度选择         |
 * | SELECT_DIFFICULTY    | `_onSelectDifficulty`   | 选择难度               |
 * | SWITCH_TO_MAIN_MENU  | `_onSwitchToMainMenu`   | 切换到主菜单           |
 * | BEGIN                | `_onGameBegin`          | 开始游戏流程           |
 * | START                | `_onGameStart`          | 进入倒计时             |
 * | TOGGLE_PAUSED        | `_onTogglePaused`       | 暂停/继续              |
 * | RESTART              | `_onGameRestart`        | 重新开始               |
 * | RESET                | `_onGameReset`          | 重置游戏               |
 * | OVER                 | `_onGameOver`           | 游戏结束               |
 * | GEG_GHOST_POSITION   | `_onGetGhostPosition`   | 获取 ghost 定位        |
 * | BLOCK_MOVE           | `_onBlockMove`          | 移动方块               |
 * | BLOCK_ROTATE         | `_onBlockRotate`        | 旋转方块               |
 * | BLOCK_DROP           | `_onBlockDrop`          | 硬降方块               |
 * | BLOCK_TICK           | `_onBlockTick`          | 游戏逻辑帧             |
 * | BLOCK_SPAWN          | `_onBlockSpawn`         | 生成新方块             |
 * | BLOCK_HOLD           | `_onBlockHold`          | 缓存方块               |
 * | START_COUNTDOWN      | `_onStartCountdown`     | 倒计时动画             |
 * | START_PAUSED         | `_onStartPaused`        | 暂停动画               |
 * | STOP_PAUSED          | `_onStopPaused`         | 停止暂停动画           |
 * | START_CLEAR_LINES    | `_onStartClearLines`    | 消行动画               |
 * | START_CLEAR_SCORE    | `_onStartClearScore`    | 消除得分动画           |
 * | START_LEVEL_UP       | `_onStartLevelUp`       | 升级动画               |
 * | START_LANDING_FLASH  | `_onStartLandingFlash`  | 落地高亮动画           |
 * | TOGGLE_BGM           | `_onToggleBGM`          | 背景音乐切换           |
 * | REPLAY_PREPARE       | `_onReplayPrepare`      | 回放准备               |
 *
 * @augments Base
 * @class GameRouter
 */
class GameRouter extends Base {
  /**
   * ## 构造函数
   *
   * 依赖由父类 `Base` 通过 `inject()` 注入。 Router 需要的依赖包括 Game、Store、各子模块等。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## 订阅所有游戏事件
   *
   * 绑定核心流程、方块操作、动画特效等所有 `game:*` 事件。 同时触发各子模块的 subscribe。
   *
   * @returns {void}
   */
  subscribe() {
    const { Animations, AI, CommandQueue, Game, Replay, UI } = this;
    const events = GameEvents(Game.id);

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

    /* ---------- 获取 ghost 定位 ---------- */
    this.on(events.GET_GHOST_POSITION, this._onGetGhostPosition);

    /* ---------- 方块操作 ---------- */
    this.on(events.BLOCK_MOVE, this._onBlockMove);
    this.on(events.BLOCK_ROTATE, this._onBlockRotate);
    this.on(events.BLOCK_DROP, this._onBlockDrop);
    this.on(events.BLOCK_TICK, this._onBlockTick);
    this.on(events.BLOCK_SPAWN, this._onBlockSpawn);
    this.on(events.BLOCK_HOLD, this._onBlockHold);

    /* ---------- 动画特效 ---------- */
    this.on(events.START_COUNTDOWN, this._onStartCountdown);
    this.on(events.START_PAUSED, this._onStartPaused);
    this.on(events.STOP_PAUSED, this._onStopPaused);
    this.on(events.START_CLEAR_LINES, this._onStartClearLines);
    this.on(events.START_CLEAR_SCORE, this._onStartClearScore);
    this.on(events.START_LEVEL_UP, this._onStartLevelUp);
    this.on(events.START_LANDING_FLASH, this._onStartLandingFlash);

    /* ---------- 背景音乐 ---------- */
    this.on(events.TOGGLE_BGM, this._onToggleBGM);

    /* ---------- 游戏回放 ---------- */
    this.on(events.REPLAY_PREPARE, this._onReplayPrepare);

    /* ---------- 子模块订阅 ---------- */
    AI.subscribe();
    Animations.subscribe();
    CommandQueue.subscribe();
    Replay.subscribe();
    UI.subscribe();
  }

  /**
   * ## 取消订阅所有游戏事件
   *
   * 同时触发各子模块的 unsubscribe。
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Animations, AI, CommandQueue, Game, Replay, UI } = this;
    const events = GameEvents(Game.id);

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

    /* ---------- 获取 ghost 定位 ---------- */
    this.off(events.GET_GHOST_POSITION, this._onGetGhostPosition);

    /* ---------- 方块操作 ---------- */
    this.off(events.BLOCK_MOVE, this._onBlockMove);
    this.off(events.BLOCK_ROTATE, this._onBlockRotate);
    this.off(events.BLOCK_DROP, this._onBlockDrop);
    this.off(events.BLOCK_TICK, this._onBlockTick);
    this.off(events.BLOCK_SPAWN, this._onBlockSpawn);
    this.off(events.BLOCK_SPAWN, this._onBlockHold);

    /* ---------- 动画特效 ---------- */
    this.off(events.START_COUNTDOWN, this._onStartCountdown);
    this.off(events.START_PAUSED, this._onStartPaused);
    this.off(events.STOP_PAUSED, this._onStopPaused);
    this.off(events.START_CLEAR_LINES, this._onStartClearLines);
    this.off(events.START_CLEAR_SCORE, this._onStartClearScore);
    this.off(events.START_LEVEL_UP, this._onStartLevelUp);
    this.off(events.START_LANDING_FLASH, this._onStartLandingFlash);

    /* ---------- 背景音乐 ---------- */
    this.off(events.TOGGLE_BGM, this._onToggleBGM);

    /* ---------- 游戏回放 ---------- */
    this.off(events.REPLAY_PREPARE, this._onReplayPrepare);

    /* ---------- 子模块取消订阅 ---------- */
    AI.unsubscribe();
    Animations.unsubscribe();
    CommandQueue.unsubscribe();
    Replay.unsubscribe();
    UI.unsubscribe();
  }

  // ==================== 事件处理器（私有） ====================

  /**
   * ## 切换控制者（human ↔ ai）
   *
   * 读取当前控制者身份，取反后更新 Store， 并发送相应的 AI 启停事件和 UI 更新事件。
   *
   * @private
   * @returns {void}
   */
  _onSwitchController = () => {
    const { Store, Game } = this;
    const uuid = Game.id;
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
   * ## 更新 Store 状态
   *
   * @private
   * @param {object} options - 参数对象
   * @param {Function} options.stateHandler - 状态更新函数
   * @returns {void}
   */
  _onUpdateState = (options) => {
    const { Store } = this;
    const { stateHandler } = options;
    Store.setState(stateHandler);
  };

  /**
   * ## 更新游戏模式
   *
   * 同时通知 UI 层更新 mode 显示。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {string} options.mode - 游戏模式
   * @returns {void}
   */
  _onUpdateMode = (options) => {
    const { Store, Game } = this;
    const { mode } = options;
    const events = UIEvents(Game.id);
    this.emit(events.UPDATE_MODE, { mode });
    Store.setMode(mode);
  };

  /**
   * ## 更新等级
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.level - 等级值
   * @returns {void}
   */
  _onUpdateLevel = (options) => {
    const { Store } = this;
    const { level } = options;
    Store.setLevel(level);
  };

  /**
   * ## 刷新 HUD 显示
   *
   * 读取当前 Store 状态，通知 UI 层更新分数、等级、行数等。
   *
   * @private
   * @returns {void}
   */
  _onUpdateHud = () => {
    const { Store, Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.UPDATE_HUD, { state: Store.getState() });
  };

  /**
   * ## 保存最高分
   *
   * 将当前分数与历史最高分比较，如果更高则持久化存储。
   *
   * @private
   * @returns {void}
   */
  _onSaveHighScore = () => {
    const { Store, Game } = this;
    Game.saveHighScore(Store.getScore());
  };

  /**
   * ## 选择等级
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.level - 等级值
   * @returns {void}
   */
  _onSelectLevel = (options) => {
    const { Store, Game } = this;
    const { level } = options;
    const events = UIEvents(Game.id);
    Game.selectLevel(level);
    this.emit(events.UPDATE_HUD, { state: Store.getState() });
  };

  /**
   * ## 切换到难度选择界面
   *
   * @private
   * @returns {void}
   */
  _onSwitchToDifficulty = () => {
    const { Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.UPDATE_MODE, { mode: 'difficulty' });
    Game.switchToDifficulty();
  };

  /**
   * ## 选择难度
   *
   * @private
   * @param {object} options - 参数对象
   * @param {string} options.difficulty - 难度等级（easy / normal / hard / expert）
   * @returns {void}
   */
  _onSelectDifficulty = (options) => {
    const { Game } = this;
    const { difficulty } = options;
    Game.selectDifficulty(difficulty);
  };

  /**
   * ## 切换到主菜单
   *
   * @private
   * @returns {void}
   */
  _onSwitchToMainMenu = () => {
    const { Game } = this;
    Game.switchToMainMenu();
  };

  /**
   * ## 开始游戏流程
   *
   * 从主菜单/难度选择进入游戏， 初始化棋盘、生成方块、播放音效和背景音乐。
   *
   * @private
   * @returns {void}
   */
  _onGameBegin = () => {
    const { Game } = this;
    Game.begin();
  };

  /**
   * ## 进入倒计时
   *
   * 从等级选择界面进入 3-2-1 倒计时。 如果当前是 AI 控制，发送 AI 启动事件。
   *
   * @private
   * @returns {void}
   */
  _onGameStart = () => {
    const { Store, Game } = this;
    const events = AIEvents(Game.id);

    Game.start();

    if (Store.getController() === 'ai') {
      this.emit(events.START);
    }
  };

  /**
   * ## 暂停/继续切换
   *
   * 根据切换后的模式自动管理 AI 的启停。
   *
   * @private
   * @returns {void}
   */
  _onTogglePaused = () => {
    const { Store, Game } = this;
    const events = AIEvents(Game.id);

    Game.togglePause();

    if (Store.getController() === 'ai') {
      const { mode } = Store.getState();

      if (mode === 'paused') {
        this.emit(events.STOP);
      } else if (mode === 'playing') {
        this.emit(events.START);
      }
    }
  };

  /**
   * ## 重置游戏
   *
   * @private
   * @returns {void}
   */
  _onGameReset = () => {
    const { Game } = this;
    Game.reset();
  };

  /**
   * ## 重新开始游戏
   *
   * @private
   * @returns {void}
   */
  _onGameRestart = () => {
    const { Game } = this;
    Game.restart();
  };

  /**
   * ## 游戏结束
   *
   * @private
   * @returns {void}
   */
  _onGameOver = () => {
    const { Game } = this;
    Game.over();
  };

  /**
   * ## 获取 Ghost 定位
   *
   * @private
   * @param {object} payload - 参数对象
   * @returns {void}
   */
  _onGetGhostPosition = (payload) => {
    const { Game } = this;
    Game.getGhostPosition(payload);
  };

  /**
   * ## 生成新方块
   *
   * @private
   * @returns {void}
   */
  _onBlockSpawn = () => {
    const { Game } = this;
    Game.spawn();
  };

  /**
   * ## 缓存方块
   *
   * @private
   * @returns {void}
   */
  _onBlockHold = () => {
    const { Game } = this;
    Game.hold();
  };

  /**
   * ## 移动方块
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.ox - X 轴偏移（负值左移，正值右移）
   * @param {number} options.oy - Y 轴偏移（正值下移）
   * @returns {void}
   */
  _onBlockMove = (options) => {
    const { Game } = this;
    const { ox, oy } = options;
    Game.move(ox, oy);
  };

  /**
   * ## 旋转方块
   *
   * @private
   * @returns {void}
   */
  _onBlockRotate = () => {
    const { Game } = this;
    Game.rotate();
  };

  /**
   * ## 硬降方块
   *
   * 将方块瞬间落到底部。
   *
   * @private
   * @returns {void}
   */
  _onBlockDrop = () => {
    const { Game } = this;
    Game.drop();
  };

  /**
   * ## 游戏逻辑帧
   *
   * 处理自动下落、锁定、消行等逻辑。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {boolean} options.isBlocked - 是否被动画阻塞
   * @returns {void}
   */
  _onBlockTick = (options) => {
    const { Game } = this;
    const { isBlocked } = options;
    Game.tick(isBlocked);
  };

  /**
   * ## 背景音乐切换
   *
   * @private
   * @returns {void}
   */
  _onToggleBGM = () => {
    const { Store } = this;
    const events = AudioEvents();
    this.emit(events.TOGGLE_BGM, {
      level: Store.getLevel(),
    });
  };

  /**
   * ## 回放准备棋盘
   *
   * 重置棋盘为初始状态，设置回放模式，开始回放。
   *
   * @private
   * @returns {void}
   */
  _onReplayPrepare = () => {
    const { Store, Game } = this;
    const uuid = Game.id;
    const UE = UIEvents(uuid);
    const RE = ReplayEvents(uuid);
    const GE = GameEvents(uuid);

    Store.resetBoard();
    Store.setState({
      board: Store.getBeginningBoard(),
      score: 0,
      lines: 0,
      level: 1,
      next: null,
      hold: null,
    });

    this.emit(UE.UPDATE_MODE, { mode: 'replay' });
    this.emit(UE.CLEAR_NEXT_PIECE);
    this.emit(UE.CLEAR_HOLD_PIECE);
    Store.setMode('replay');
    this.emit(UE.UPDATE_HUD, { state: Store.getState() });
    this.emit(RE.START_PLAY);
    this.emit(GE.BLOCK_SPAWN);
  };

  /**
   * ## 更新手柄连接状态
   *
   * @private
   * @param {object} options - 参数对象
   * @param {boolean} options.connected - 是否已连接
   * @returns {void}
   */
  _onUpdateGamepadConnected = (options) => {
    const { Store } = this;
    const { connected } = options;
    Store.setGamepadConnected(connected);
  };

  /**
   * ## 开始倒计时动画
   *
   * @private
   * @returns {void}
   */
  _onStartCountdown = () => {
    const { Game } = this;
    Game.startCountdown();
  };

  /**
   * ## 开始暂停动画
   *
   * @private
   * @returns {void}
   */
  _onStartPaused = () => {
    const { Game } = this;
    Game.startPaused();
  };

  /**
   * ## 停止暂停动画
   *
   * @private
   * @returns {void}
   */
  _onStopPaused = () => {
    const { Game } = this;
    Game.stopPaused();
  };

  /**
   * ## 开始消行动画
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number[]} options.linesToClear - 待消除的行号数组
   * @returns {void}
   */
  _onStartClearLines = (options) => {
    const { Game } = this;
    const { linesToClear } = options;
    Game.startClearLines(linesToClear);
  };

  /**
   * ## 开始消除得分动画
   *
   * 在消除行的位置显示上浮渐隐的得分数字。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.score - 本次消除得分
   * @param {number[]} options.lines - 消除的行号数组
   * @returns {void}
   */
  _onStartClearScore = (options) => {
    const { Game } = this;
    Game.startClearScore(options);
  };

  /**
   * ## 开始升级动画
   *
   * 播放烟花粒子特效庆祝升级。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.level - 新等级
   * @returns {void}
   */
  _onStartLevelUp = (options) => {
    const { Game } = this;
    const { level } = options;
    Game.startLevelUp(level);
  };

  /**
   * ## 开始落地高亮动画
   *
   * 方块落地的瞬间在落地格子上显示半透明白色闪烁。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {object} options.piece - 刚落地的方块信息
   * @param {number[][]} options.piece.shape - 方块形状矩阵
   * @param {number} options.piece.cx - 方块 X 坐标
   * @param {number} options.piece.cy - 方块 Y 坐标
   * @returns {void}
   */
  _onStartLandingFlash = (options) => {
    const { Game } = this;
    const { piece } = options;
    Game.startLandingFlash(piece);
  };
}

export default GameRouter;
