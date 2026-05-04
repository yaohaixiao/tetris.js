import Game from '@/lib/game';
import Audio from '@/lib/services/audio';
import Effects from '@/lib/services/effects';

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
  if (mode !== 'playing') {
    return;
  }

  store.setMode('paused');
  Audio.stopBGM();
  Audio.Sounds.pause();
  Effects.startPaused();
};

export default pause;
