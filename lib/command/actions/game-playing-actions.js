import move from '@/lib/game/logic/move.js';
import rotate from '@/lib/game/logic/rotate.js';
import drop from '@/lib/game/logic/drop.js';
import restartGame from '@/lib/game/core/restart-game.js';
import gameOver from '@/lib/game/core/game-over.js';
import togglePause from '@/lib/game/core/toggle-pause.js';
import toggleBGM from '@/lib/audio/toggle-bgm.js';

// 游戏操控映射
const GAME_PLAYING_ACTIONS = {
  MOVE_LEFT: (_, engine) => {
    move(-1, 0, engine.state);
  },
  MOVE_RIGHT: (_, engine) => {
    move(1, 0, engine.state);
  },
  MOVE_DOWN: (_, engine) => {
    move(0, 1, engine.state);
  },
  DROP: (_, engine) => {
    drop(engine.state);
  },
  ROTATE: (_, engine) => {
    rotate(engine.state);
  },
  // R: 重新开始游戏
  RESTART: (_, engine) => {
    restartGame(engine.state);
  },
  // Q: 强制结束游戏
  QUIT: () => {
    gameOver();
  },
  // P: 暂停/继续游戏
  TOGGLE_PAUSE: () => {
    togglePause();
  },
  // M: 切换背景音乐
  TOGGLE_MUSIC: () => {
    toggleBGM();
  },
};

export default GAME_PLAYING_ACTIONS;
