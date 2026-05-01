import AudioState from '@/lib/audio/state/audio-state.js';
import Sounds from '@/lib/audio/sounds.js';
import playBGM from '@/lib/audio/play-bgm.js';
import stopBGM from '@/lib/audio/stop-bgm.js';

/**
 * # 切换背景音乐（开启/关闭）
 *
 * 反转 BGM 启用状态，播放切换音效，并根据状态播放或停止 BGM
 *
 * @function toggleBGM
 * @param {number} level - 当前等级
 * @returns {void}
 */
const toggleBGM = (level) => {
  // 反转背景音乐的启用状态
  AudioState.bgmEnabled = !AudioState.bgmEnabled;
  // 播放切换提示音
  Sounds.bgmToggle();

  // 根据新状态决定播放或停止背景音乐
  if (AudioState.bgmEnabled) {
    playBGM(level);
  } else {
    stopBGM();
  }
};

export default toggleBGM;
