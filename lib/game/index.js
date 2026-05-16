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
import Keyboard from '@/lib/services/input/keyboard.js';
import GamepadController from '@/lib/services/input/gamepad-controller.js';
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

class Game extends Base {
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);

    this.initialize();
  }

  initialize() {
    const { Elements, Scheduler } = this;
    const Store = new GameStore({
      ...Elements.Main,
      GameState,
    });

    this.id = crypto.randomUUID();

    this.effect = null;

    this.Store = Store;
    this.Animations = new AnimationSystem({
      Game: this,
    });
    this.CommandQueue = new CommandQueue({
      Game: this,
    });
    this.UI = new UI({
      Game: this,
      Store,
      Elements,
    });
    this.Keyboard = new Keyboard({
      Game: this,
      Store,
    });
    this.Gamepad = new GamepadController({
      Game: this,
    });
    this.Replay = new ReplayController({
      Game: this,
      Store,
      // 以后快进做准备
      Scheduler,
    });
  }

  selectLevel(level) {
    this.Store.setLevel(level);
    this.emit('audio:resume:sound', { sound: 'LEVEL_CHANGED' });
  }

  switchToDifficulty() {
    this.Store.setMode('difficulty');
    this.emit('audio:resume:sound', { sound: 'SWITCH_SCENE' });
  }

  selectDifficulty(difficulty) {
    this.Store.setDifficulty(difficulty);
    this.emit('audio:resume:sound', { sound: 'DIFFICULTY_CHANGED' });
  }

  switchToMainMenu() {
    this.emit(`ui:${this.id}:update:mode`, { mode: 'main-menu' });
    this.Store.setMode('main-menu');
    this.emit('audio:resume:sound', { sound: 'SWITCH_SCENE' });
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

  startCountdown() {
    this.Animations.register(
      new CountdownAnimation({
        Scheduler: this.Scheduler,
        Game: this,
      }),
    );
  }

  startPaused() {
    this.effect = new PausedAnimation({
      Scheduler: this.Scheduler,
    });
    this.Animations.register(this.effect);
    this.effect.resume();
  }

  stopPaused() {
    if (!this.effect) {
      return;
    }

    // 终止动画
    this.effect.stop();

    // 清空引用
    this.effect = null;
  }

  startClearLines(linesToClear) {
    this.Animations.register(
      new ClearLinesAnimation({
        Game: this,
        lines: linesToClear,
      }),
    );
  }

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

  subscribe() {
    const uuid = this.id;

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

    /* ---------- 输入设备 ---------- */
    this.Keyboard.addEventListeners();
    this.Gamepad.addEventListeners();

    /* ---------- UI 渲染 ---------- */
    this.UI.subscribe();

    /* ---------- 操作回放 ---------- */
    this.Replay.subscribe();

    /* ---------- 动画系统 ---------- */
    this.Animations.subscribe();

    /* ---------- 操作回放 ---------- */
    this.CommandQueue.subscribe();
  }

  unsubscribe() {
    const uuid = this.id;

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

    /* ---------- 输入设备 ---------- */
    this.Keyboard.removeEventListeners();
    this.Gamepad.removeEventListeners();

    /* ---------- UI 渲染 ---------- */
    this.UI.unsubscribe();

    /* ---------- 操作回放 ---------- */
    this.Replay.unsubscribe();

    /* ---------- 动画系统 ---------- */
    this.Animations.unsubscribe();

    /* ---------- 操作回放 ---------- */
    this.CommandQueue.unsubscribe();
  }

  _onUpdateState = ({ stateHandler }) => {
    this.Store.setState(stateHandler);
  };

  _onUpdateMode = ({ mode }) => {
    this.emit(`ui:${this.id}:update:mode`, { mode });
    this.Store.setMode(mode);
  };

  _onUpdateLevel = ({ level }) => {
    this.Store.setLevel(level);
  };

  _onUpdateHud = () => {
    const state = this.Store.getState();
    this.emit(`ui:${this.id}:update:hud`, { state });
  };

  _onSaveHighScore = () => {
    this.saveHighScore(this.Store.getScore());
  };

  _onSelectLevel = ({ level }) => {
    const state = this.Store.getState();
    this.selectLevel(level);
    this.emit(`ui:${this.id}:update:hud`, { state });
  };

  _onSwitchToDifficulty = () => {
    this.emit(`ui:${this.id}:update:mode`, { mode: 'difficulty' });
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
    const { Store, Level } = this;
    const level = Store.getLevel();
    const maxLevel = Level.max;
    this.emit('audio:toggle:bgm', { level, maxLevel });
  };

  _onReplayPrepareBoard = () => {
    const { id, Store } = this;

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

    this.emit(`ui:${id}:update:mode`, { mode: 'replay' });

    // 进入游戏回放状态
    Store.setMode('replay');

    this.emit(`ui:${id}:update:hud`, { state: Store.getState() });

    // 开始回放
    this.emit(`replay:${id}:start:play`);

    // 开始绘制方块
    spawn(this);
  };

  _onUpdateGamepadConnected = ({ connected }) => {
    this.Store.setGamepadConnected(connected);
  };

  _onStartCountdown = () => {
    this.startCountdown();
  };

  _onStartPaused = () => {
    this.startPaused();
  };

  _onStopPaused = () => {
    this.stopPaused();
  };

  _onStartClearLines = ({ linesToClear }) => {
    this.startClearLines(linesToClear);
  };

  _onStartLevelUp = ({ level }) => {
    this.startLevelUp(level);
  };
}

export default Game;
