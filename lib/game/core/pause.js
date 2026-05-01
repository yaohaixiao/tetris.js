import Game from '@/lib/game';
import Sounds from '@/lib/audio/sounds.js';
import stopBGM from '@/lib/audio/stop-bgm.js';
import { startPaused } from '@/lib/controllers/paused-controller.js';

/**
 * # 游戏暂停
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function pause
 * @returns {void}
 */
const pause = () => {
  const { store } = Game;
  const mode = store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode === 'game-over' || mode === 'main-menu' || mode !== 'playing') {
    return;
  }

  store.setMode('paused');
  stopBGM();
  Sounds.pause();
  startPaused();
};

export default pause;
