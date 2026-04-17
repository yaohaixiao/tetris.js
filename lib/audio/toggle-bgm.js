import AudioState from '../state/audio-state.js';
import Sounds from './sounds.js';
import playBGM from './play-bgm.js';
import stopBGM from './stop-bgm.js';
import getGameStateMode from '../state/get-game-state-mode.js';

/**
 * # 切换背景音乐（开启/关闭）
 *
 * 反转 BGM 启用状态，播放切换音效，并根据状态播放或停止 BGM
 *
 * @function toggleBGM
 * @returns {void}
 */
const toggleBGM = () => {
  let { bgmEnabled } = AudioState;
  const mode = getGameStateMode();

  if (mode === 'main-menu' || mode === 'paused' || mode === 'game-over') {
    return;
  }

  // 反转背景音乐的启用状态
  bgmEnabled = !bgmEnabled;
  // 播放切换提示音
  Sounds.bgmToggle();

  // 根据新状态决定播放或停止背景音乐
  if (bgmEnabled) {
    playBGM();
  } else {
    stopBGM();
  }
};

export default toggleBGM;
