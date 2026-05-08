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
import randomShape from '@/lib/game/utils/random-shape.js';
// 通用功能函数
import getStorage from '@/lib/utils/get-storage.js';
import setStorage from '@/lib/utils/set-storage.js';
import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';

const Game = {
  // 游戏状态
  store: createGameStore(),

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
  setBeginningState,
  randomShape,

  // 规则功能函数
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
};

export default Game;
