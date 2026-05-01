import Engine from '@/lib/engine';
import Game from '@/lib/game';
import Sounds from '@/lib/audio/sounds.js';
import playBGM from '@/lib/audio/play-bgm.js';
import { stopPaused } from '@/lib/controllers/paused-controller.js';

/**
 * # 游戏继续
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function play
 * @returns {boolean | undefined} 无效状态时返回 false
 */
const play = () => {
  const { store } = Game;
  const mode = store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode === 'game-over' || mode === 'main-menu' || mode !== 'paused') {
    return false;
  }

  // 执行继续游戏逻辑
  stopPaused();
  store.setMode('playing');
  Sounds.resume();
  playBGM();
  Engine.restart();
};

export default play;
