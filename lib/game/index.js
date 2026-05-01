import Sounds from '@/lib/audio/sounds.js';
import createGameStore from '@/lib/game/state/game-store.js';
// 核心流程控制逻辑
import begin from '@/lib/game/core/begin.js';
import start from '@/lib/game/core/start.js';
import tick from '@/lib/game/core/tick.js';
import restart from '@/lib/game/core/restart.js';
import togglePause from '@/lib/game/core/toggle-pause.js';
import over from '@/lib/game/core/over.js';
import getSpeed from '@/lib/game/core/get-speed.js';
import reset from '@/lib/game/core/reset.js';
// 游戏方块控制逻辑
import clearLines from '@/lib/game/logic/clear-lines.js';
import collision from '@/lib/game/logic/collision.js';
import drop from '@/lib/game/logic/drop.js';
import lock from '@/lib/game/logic/lock.js';
import move from '@/lib/game/logic/move.js';
import rotate from '@/lib/game/logic/rotate.js';
import spawn from '@/lib/game/logic/spawn.js';
// 通用功能
import getStorage from '@/lib/utils/get-storage.js';
import setStorage from '@/lib/utils/set-storage.js';

const Game = {
  // 游戏状态
  store: createGameStore(),

  // 核心流程控制逻辑
  begin,
  start,
  tick,
  restart,
  togglePause,
  over,
  getSpeed,
  reset,

  // 游戏方块控制逻辑
  clearLines,
  collision,
  drop,
  lock,
  move,
  rotate,
  spawn,

  selectLevel: (level) => {
    const { store } = Game;

    store.setLevel(level);
    Sounds.levelSelect();
  },

  loadHighScore: () => {
    const { store } = Game;
    const highScore = Number.parseInt(getStorage('tetris-high-score'), 10) || 0;

    store.setHighScore(highScore);
  },

  saveHighScore: (score) => {
    const { store } = Game;

    // 仅当当前得分超过历史最高分才执行保存
    if (score > store.getHighScore()) {
      // 更新游戏状态中的最高分
      store.setHighScore(score);

      // 保存到浏览器本地存储，持久化记录
      setStorage('tetris-high-score', store.toString());
    }
  },
};

export default Game;
