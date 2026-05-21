import Base from '@/lib/core';
import {
  AudioEvents,
  AIEvents,
  GameEvents,
  UIEvents,
  ReplayEvents,
} from '@/lib/events/event-catalog.js';

class GameRouter extends Base {
  constructor(options) {
    super(options);
  }

  /**
   * ## 订阅所有游戏事件
   *
   * 绑定核心流程、方块操作、动画特效、输入设备等所有事件。 同时触发各子模块的 subscribe。
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
    AI.subscribe();
    Animations.subscribe();
    CommandQueue.subscribe();
    Replay.subscribe();
    UI.subscribe();
  }

  /**
   * ## 取消订阅所有游戏事件
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
   * @private
   * @param {object} options - 参数对象
   */
  _onUpdateState = (options) => {
    const { Store } = this;
    const { stateHandler } = options;
    Store.setState(stateHandler);
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onUpdateMode = (options) => {
    const { Store, Game } = this;
    const { mode } = options;
    const events = UIEvents(Game.id);
    this.emit(events.UPDATE_MODE, { mode });
    Store.setMode(mode);
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onUpdateLevel = (options) => {
    const { Store } = this;
    const { level } = options;
    Store.setLevel(level);
  };

  /** @private */
  _onUpdateHud = () => {
    const { Store, Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.UPDATE_HUD, { state: Store.getState() });
  };

  /** @private */
  _onSaveHighScore = () => {
    const { Store, Game } = this;
    Game.saveHighScore(Store.getScore());
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onSelectLevel = (options) => {
    const { Store, Game } = this;
    const { level } = options;
    const events = UIEvents(Game.id);
    Game.selectLevel(level);
    this.emit(events.UPDATE_HUD, { state: Store.getState() });
  };

  /** @private */
  _onSwitchToDifficulty = () => {
    const { Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.UPDATE_MODE, { mode: 'difficulty' });
    Game.switchToDifficulty();
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onSelectDifficulty = (options) => {
    const { Game } = this;
    const { difficulty } = options;
    Game.selectDifficulty(difficulty);
  };

  /** @private */
  _onSwitchToMainMenu = () => {
    const { Game } = this;
    Game.switchToMainMenu();
  };

  /** @private */
  _onGameBegin = () => {
    const { Game } = this;
    Game.begin();
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
    const { Store, Game } = this;
    const events = AIEvents(Game.id);

    Game.start();

    if (Store.getController() === 'ai') {
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

  /** @private */
  _onGameReset = () => {
    const { Game } = this;
    Game.reset();
  };

  /** @private */
  _onGameRestart = () => {
    const { Game } = this;
    Game.restart();
  };

  /** @private */
  _onGameOver = () => {
    const { Game } = this;
    Game.over();
  };

  /** @private */
  _onBlockSpawn = () => {
    const { Game } = this;
    Game.spawn();
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onBlockMove = (options) => {
    const { Game } = this;
    const { ox, oy } = options;
    Game.move(ox, oy);
  };

  /** @private */
  _onBlockRotate = () => {
    const { Game } = this;
    Game.rotate();
  };

  /** @private */
  _onBlockDrop = () => {
    const { Game } = this;
    Game.drop();
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onBlockTick = (options) => {
    const { Game } = this;
    const { isBlocked } = options;
    Game.tick(isBlocked);
  };

  /** @private */
  _onToggleBGM = () => {
    const { Store } = this;
    const events = AudioEvents();
    this.emit(events.TOGGLE_BGM, {
      level: Store.getLevel(),
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
    const { Store } = this;
    const { connected } = options;
    Store.setGamepadConnected(connected);
  };

  /** @private */
  _onStartCountdown = () => {
    const { Game } = this;
    Game.startCountdown();
  };

  /** @private */
  _onStartPaused = () => {
    const { Game } = this;
    Game.startPaused();
  };

  /** @private */
  _onStopPaused = () => {
    const { Game } = this;
    Game.stopPaused();
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onStartClearLines = (options) => {
    const { Game } = this;
    const { linesToClear } = options;
    Game.startClearLines(linesToClear);
  };

  /**
   * @private
   * @param {object} options - 参数对象
   */
  _onStartLevelUp = (options) => {
    const { Game } = this;
    const { level } = options;
    Game.startLevelUp(level);
  };
}

export default GameRouter;
