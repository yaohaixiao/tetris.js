import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';
import spawn from '@/lib/game/logic/spawn.js';

const GameRuntime = {
  subscribe: () => {
    EventBus.on('game:update:state', ({ stateHandler }) => {
      Game.store.setState(stateHandler);
    });

    EventBus.on('game:update:gamepad:connected', ({ connected }) => {
      Game.store.setGamepadConnected(connected);
    });

    EventBus.on('game:update:mode', ({ mode }) => {
      Game.store.setMode(mode);
    });

    EventBus.on('game:update:level', ({ level }) => {
      Game.store.setLevel(level);
    });

    EventBus.on('game:save:high:score', () => {
      Game.saveHighScore(Game.store.getScore());
    });

    EventBus.on('game:update:hud', () => {
      const state = Game.store.getState();
      console.log('game:update:hud');
      EventBus.emit('ui:update:hud', { state });
    });

    EventBus.on('game:select:level', ({ level }) => {
      Game.selectLevel(level);
    });

    EventBus.on('game:switch:difficulty', () => {
      Game.switchToDifficulty();
    });

    EventBus.on('game:select:difficulty', ({ difficulty }) => {
      Game.selectDifficulty(difficulty);
    });

    EventBus.on('game:switch:to:main:menu', () => {
      Game.switchToMainMenu();
    });

    EventBus.on('game:begin', () => {
      Game.begin();
    });

    EventBus.on('game:start', () => {
      Game.start();
    });

    EventBus.on('game:toggle:pause', () => {
      Game.togglePause();
    });

    EventBus.on('game:reset', () => {
      Game.reset();
    });

    EventBus.on('game:restart', () => {
      Game.restart();
    });

    EventBus.on('game:over', () => {
      Game.over();
    });

    EventBus.on('game:move', ({ ox, oy }) => {
      Game.move(ox, oy);
    });

    EventBus.on('game:rotate', () => {
      Game.rotate();
    });

    EventBus.on('game:drop', () => {
      Game.drop();
    });

    EventBus.on('game:tick', ({ isBlocked }) => {
      Game.tick(isBlocked);
    });

    EventBus.on('game:toggle:bgm', () => {
      const level = Game.store.getLevel();
      EventBus.emit('audio:toggle:bgm', { level });
    });

    EventBus.on('game:replay:prepare:board', () => {
      const { store } = Game;

      // 重置游戏场地
      store.resetBoard();
      // 重置 HUD 信息和游戏开始时的难度设定
      store.setState({
        // 绘制游戏开始难度设定产生的方块信息
        board: store.getBeginningBoard(),
        score: 0,
        lines: 0,
        level: 1,
      });
      // 进入游戏回放状态
      store.setMode('replay');

      EventBus.emit('ui:update:hud', { state: store.getState() });

      // 开始回放
      EventBus.emit('replay:start:play');

      // 开始绘制方块
      spawn();
    });
  },
};

export default GameRuntime;
