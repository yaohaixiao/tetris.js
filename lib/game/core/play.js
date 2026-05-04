import Game from '@/lib/game';
import Audio from '@/lib/services/audio';
import Effects from '@/lib/services/effects';

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
  if (mode !== 'paused') {
    return false;
  }

  // 执行继续游戏逻辑
  Effects.stopPaused();
  store.setMode('playing');
  Audio.Sounds.resume();
  Audio.playBGM();
};

export default play;
