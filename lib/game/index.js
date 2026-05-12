import Base from '@/lib/core/index.js';
/* ---------- 子模块 ---------- */
// GameState 模块
import GameState from '@/lib/state/game-state.js';
// Store 模块
import GameStore from '../state/game-store.js';
// UI 模块
import UI from '@/lib/services/ui';
// Effects 模块
import startCountdown from '@/lib/game/effects/countdown.js';
import { startPaused, stopPaused } from '@/lib/game/effects/paused.js';
import startClearLines from '@/lib/game/effects/clear-lines.js';
import startLevelUp from '@/lib/game/effects/level-up.js';
// Input 模块
import Keyboard from '@/lib/services/input/keyboard.js';
import GamepadController from '@/lib/services/input/gamepad-controller.js';
// ReplayController 模块
import ReplayController from '@/lib/runtime/replay-controller.js';
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

class Game extends Base {
  constructor(options) {
    super();

    this.initialize(options);
  }

  initialize(options) {
    const { Elements } = options;
    const Store = new GameStore({
      ...Elements.Main,
      GameState,
    });

    this.options = options;

    this.Store = Store;
    this.UI = new UI({
      Store,
      Elements,
    });
    this.Keyboard = new Keyboard({
      Store: this.Store,
      Game: this,
      UI: this.UI,
    });
    this.Gamepad = new GamepadController({
      Game: this,
    });
    this.Replay = new ReplayController({
      Game: this,
      Store: this.Store,
      UI: this.UI,
    });
  }

  selectLevel(level) {
    this.Store.setLevel(level);
    this.emit('audio:play:sound', { sound: 'LEVEL_CHANGED' });
  }

  switchToDifficulty() {
    this.Store.setMode('difficulty');
    this.emit('audio:play:sound', { sound: 'SWITCH_SCENE' });
  }

  selectDifficulty(difficulty) {
    this.Store.setDifficulty(difficulty);
    this.emit('audio:play:sound', { sound: 'DIFFICULTY_CHANGED' });
  }

  switchToMainMenu() {
    this.emit('ui:update:mode', { mode: 'main-menu' });
    this.Store.setMode('main-menu');
    this.emit('audio:play:sound', { sound: 'SWITCH_SCENE' });
  }

  loadHighScore() {
    const highScore = Number.parseInt(getStorage('tetris-high-score'), 10) || 0;
    this.Store.setHighScore(highScore);
  }

  saveHighScore(score) {
    const { Store } = this;

    // 仅当当前得分超过历史最高分才执行保存
    if (score > Store.getHighScore()) {
      // 更新游戏状态中的最高分
      Store.setHighScore(score);

      // 保存到浏览器本地存储，持久化记录
      setStorage('tetris-high-score', score.toString());
    }
  }

  begin() {
    begin(this);
  }

  start() {
    start(this);
  }

  togglePause() {
    togglePause(this);
  }

  reset() {
    reset(this);
  }

  restart() {
    restart(this);
  }

  over() {
    over(this);
  }

  move(x, y) {
    move(this, x, y);
  }

  rotate() {
    rotate(this);
  }

  tick(isBlocked) {
    tick(this, isBlocked);
  }

  drop() {
    drop(this);
  }

  applyClearLines() {
    applyClearLines(this);
  }

  setBeginningState(mode, level = 1) {
    setBeginningState(this, mode, level);
  }

  getSpeed() {
    return getSpeed(this);
  }

  subscribe() {
    /* ---------- 状态更新 ---------- */
    this.on('game:update:state', this._onUpdateState);
    this.on('game:update:mode', this._onUpdateMode);
    this.on('game:update:level', this._onUpdateLevel);
    this.on('game:update:gamepad:connected', this._onUpdateGamepadConnected);

    /* ---------- 渲染状态更新 ---------- */
    this.on('game:update:hud', this._onUpdateHud);
    this.on('game:save:high:score', this._onSaveHighScore);
    this.on('game:select:level', this._onSelectLevel);
    this.on('game:switch:difficulty', this._onSwitchToDifficulty);
    this.on('game:select:difficulty', this._onSelectDifficulty);
    this.on('game:switch:to:main:menu', this._onSwitchToMainMenu);

    /* ---------- 回放状态更新 ---------- */
    this.on('game:replay:prepare:board', this._onReplayPrepareBoard);

    /* ---------- 核心流程 ---------- */
    this.on('game:begin', this._onGameBegin);
    this.on('game:start', this._onGameStart);
    this.on('game:toggle:paused', this._onTogglePaused);
    this.on('game:reset', this._onGameReset);
    this.on('game:restart', this._onGameRestart);
    this.on('game:over', this._onGameOver);

    /* ---------- 方块操作 ---------- */
    this.on('game:block:move', this._onBlockMove);
    this.on('game:block:rotate', this._onBlockRotate);
    this.on('game:block:drop', this._onBlockDrop);
    this.on('game:block:tick', this._onBlockTick);

    /* ---------- 背景音乐 ---------- */
    this.on('game:toggle:bgm', this._onToggleBGM);

    /* ---------- 动画特效 ---------- */
    this.on('game:start:countdown', this._onStartCountdown);
    this.on('game:start:paused', this._onStartPaused);
    this.on('game:stop:paused', this._onStopPaused);
    this.on('game:start:clear:lines', this._onStartClearLines);
    this.on('game:start:level:up', this._onStartLevelUp);

    /* ---------- 输入设备 ---------- */
    this.Keyboard.addEventListeners();
    this.Gamepad.addEventListeners();

    /* ---------- UI 渲染 ---------- */
    this.UI.subscribe();

    /* ---------- 操作回放 ---------- */
    this.Replay.subscribe();
  }

  unsubscribe() {
    /* ---------- 状态管理 ---------- */
    this.off('game:update:state', this._onUpdateState);
    this.off('game:update:mode', this._onUpdateMode);
    this.off('game:update:level', this._onUpdateLevel);
    this.off('game:update:gamepad:connected', this._onUpdateGamepadConnected);

    /* ---------- UI 渲染状态更新 ---------- */
    this.off('game:update:hud', this._onUpdateHud);
    this.off('game:save:high:score', this._onSaveHighScore);
    this.off('game:select:level', this._onSelectLevel);
    this.off('game:switch:difficulty', this._onSwitchToDifficulty);
    this.off('game:select:difficulty', this._onSelectDifficulty);
    this.off('game:switch:to:main:menu', this._onSwitchToMainMenu);

    /* ---------- 操作回放状态更新 ---------- */
    this.off('game:replay:prepare:board', this._onReplayPrepareBoard);

    /* ---------- 核心流程 ---------- */
    this.off('game:begin', this._onGameBegin);
    this.off('game:start', this._onGameStart);
    this.off('game:toggle:pause', this._onTogglePaused);
    this.off('game:reset', this._onGameReset);
    this.off('game:restart', this._onGameRestart);
    this.off('game:over', this._onGameOver);

    /* ---------- 方块操作 ---------- */
    this.off('game:block:move', this._onBlockMove);
    this.off('game:block:rotate', this._onBlockRotate);
    this.off('game:block:drop', this._onBlockDrop);
    this.off('game:block:tick', this._onBlockTick);

    /* ---------- 背景音乐 ---------- */
    this.off('game:toggle:bgm', this._onToggleBGM);

    /* ---------- 动画特效 ---------- */
    this.off('game:start:countdown', this._onStartCountdown);
    this.off('game:start:paused', this._onStartPaused);
    this.off('game:stop:paused', this._onStopPaused);
    this.off('game:start:clear:lines', this._onStartClearLines);
    this.off('game:start:level:up', this._onStartLevelUp);

    /* ---------- 输入设备 ---------- */
    this.Keyboard.removeEventListeners();
    this.Gamepad.removeEventListeners();

    /* ---------- UI 渲染 ---------- */
    this.UI.unsubscribe();

    /* ---------- 操作回放 ---------- */
    this.Replay.unsubscribe();
  }

  _onUpdateState = ({ stateHandler }) => {
    this.Store.setState(stateHandler);
  };

  _onUpdateMode = ({ mode }) => {
    this.emit('ui:update:mode', { mode });
    this.Store.setMode(mode);
  };

  _onUpdateLevel = ({ level }) => {
    this.Store.setLevel(level);
  };

  _onUpdateHud = () => {
    const state = this.Store.getState();
    this.emit('ui:update:hud', { state });
  };

  _onSaveHighScore = () => {
    this.saveHighScore(this.Store.getScore());
  };

  _onSelectLevel = ({ level }) => {
    const state = this.Store.getState();
    this.selectLevel(level);
    this.emit('ui:update:hud', { state });
  };

  _onSwitchToDifficulty = () => {
    this.emit('ui:update:mode', { mode: 'difficulty' });
    this.switchToDifficulty();
  };

  _onSelectDifficulty = ({ difficulty }) => {
    this.selectDifficulty(difficulty);
  };

  _onSwitchToMainMenu = () => {
    this.switchToMainMenu();
  };

  _onGameBegin = () => {
    this.begin();
  };

  _onGameStart = () => {
    this.start();
  };

  _onTogglePaused = () => {
    this.togglePause();
  };

  _onGameReset = () => {
    this.reset();
  };

  _onGameRestart = () => {
    this.restart();
  };

  _onGameOver = () => {
    this.over();
  };

  _onBlockMove = ({ ox, oy }) => {
    this.move(ox, oy);
  };

  _onBlockRotate = () => {
    this.rotate();
  };

  _onBlockDrop = () => {
    this.drop();
  };

  _onBlockTick = ({ isBlocked }) => {
    this.tick(isBlocked);
  };

  _onToggleBGM = () => {
    const level = this.Store.getLevel();
    const maxLevel = this.options.Level.max;
    this.emit('audio:toggle:bgm', { level, maxLevel });
  };

  _onReplayPrepareBoard = () => {
    const { Store } = this;

    // 重置游戏场地
    Store.resetBoard();
    // 重置 HUD 信息和游戏开始时的难度设定
    Store.setState({
      // 绘制游戏开始难度设定产生的方块信息
      board: Store.getBeginningBoard(),
      score: 0,
      lines: 0,
      level: 1,
    });

    this.emit('ui:update:mode', { mode: 'replay' });

    // 进入游戏回放状态
    Store.setMode('replay');

    this.emit('ui:update:hud', { state: Store.getState() });

    // 开始回放
    this.emit('replay:start:play');

    // 开始绘制方块
    spawn(this);
  };

  _onUpdateGamepadConnected = ({ connected }) => {
    this.Store.setGamepadConnected(connected);
  };

  _onStartCountdown = () => {
    startCountdown({
      Game: this,
      UI: this.UI,
    });
  };

  _onStartPaused = () => {
    startPaused();
  };

  _onStopPaused = () => {
    stopPaused();
  };

  _onStartClearLines = ({ linesToClear }) => {
    startClearLines({
      Game: this,
      UI: this.UI,
      lines: linesToClear,
    });
  };

  _onStartLevelUp = ({ level }) => {
    startLevelUp({
      Game: this,
      UI: this.UI,
      maxLevel: this.options.Level.max,
      level,
    });
  };
}

export default Game;
