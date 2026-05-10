import EventBus from '@/lib/core/event-bus/index.js';
// Store 模块
import createGameStore from '@/lib/game/state/game-store.js';
// 核心流程控制逻辑
import begin from '@/lib/game/core/begin.js';
import start from '@/lib/game/core/start.js';
import restart from '@/lib/game/core/restart.js';
import togglePause from '@/lib/game/core/toggle-pause.js';
import over from '@/lib/game/core/over.js';
import reset from '@/lib/game/core/reset.js';
// 游戏方块控制逻辑
import clearLines from '@/lib/game/logic/clear-lines.js';
import collision from '@/lib/game/logic/collision.js';
import drop from '@/lib/game/logic/drop.js';
import findFullLines from '@/lib/game/logic/find-full-lines.js';
import lock from '@/lib/game/logic/lock.js';
import move from '@/lib/game/logic/move.js';
import rotate from '@/lib/game/logic/rotate.js';
import spawn from '@/lib/game/logic/spawn.js';
import tick from '@/lib/game/logic/tick.js';
// 规则功能函数
import getSpeed from '@/lib/game/rules/get-speed.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';
// 游戏功能函数
import getNextPiece from '@/lib/game/utils/get-next-piece.js';
import randomShape from '@/lib/game/utils/random-shape.js';
// 通用功能函数
import getStorage from '@/lib/utils/get-storage.js';
import setStorage from '@/lib/utils/set-storage.js';
import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';
// 扩展模块
import ReplayController from '@/lib/runtime/replay-controller.js';

const Game = {
  // 游戏状态
  store: createGameStore(),

  // 游戏的回放控制器实例
  Replay: new ReplayController(),

  // 核心流程控制逻辑
  begin,
  start,
  restart,
  togglePause,
  over,
  reset,

  // 游戏方块控制逻辑
  clearLines,
  collision,
  drop,
  findFullLines,
  lock,
  move,
  rotate,
  spawn,
  tick,

  // 游戏功能函数
  getNextPiece,
  randomShape,

  // 规则功能函数
  setBeginningState,
  getSpeed,

  // 指令功能函数
  applyClearLines,

  switchToDifficulty: () => {
    Game.store.setMode('difficulty');
  },

  switchToMainMenu: () => {
    Game.store.setMode('main-menu');
  },

  selectLevel: (level) => {
    Game.store.setLevel(level);
    EventBus.emit('audio:sounds:level:select');
  },

  selectDifficulty: (difficulty) => {
    Game.store.setDifficulty(difficulty);
    EventBus.emit('audio:sounds:difficulty:select');
  },

  loadHighScore: () => {
    const highScore = Number.parseInt(getStorage('tetris-high-score'), 10) || 0;
    Game.store.setHighScore(highScore);
  },

  saveHighScore: (score) => {
    const { store } = Game;

    // 仅当当前得分超过历史最高分才执行保存
    if (score > store.getHighScore()) {
      // 更新游戏状态中的最高分
      store.setHighScore(score);

      // 保存到浏览器本地存储，持久化记录
      setStorage('tetris-high-score', score.toString());
    }
  },

  subscribe: () => {
    EventBus.on('game:update:state', ({ stateHandler }) => {
      Game.store.setState(stateHandler);
    });

    EventBus.on('game:update:gamepad:connected', ({ connected }) => {
      Game.store.setGamepadConnected(connected);
    });

    EventBus.on('game:update:mode', ({ mode }) => {
      EventBus.emit('ui:update:mode', { mode });
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
      EventBus.emit('ui:update:hud', { state });
    });

    EventBus.on('game:select:level', ({ level }) => {
      Game.selectLevel(level);
      const state = Game.store.getState();
      EventBus.emit('ui:update:hud', { state });
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
      EventBus.emit('ui:update:mode', { mode: 'replay' });
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

export default Game;
