import playBGM from '@/lib/services/audio/play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';

/**
 * # 切换背景音乐（开启/关闭）
 *
 * 反转 BGM 启用状态，播放切换音效，并根据状态播放或停止 BGM
 *
 * @function toggleBGM
 * @param {object} audio - Audio 对象实例
 * @param {number} level - 当前等级
 * @returns {void}
 */
const toggleBGM = (audio, level) => {
  // 根据新状态决定播放或停止背景音乐
  if (audio.bgmSchedulerId === 0) {
    playBGM(audio, level);
  } else {
    stopBGM(audio);
  }
};

export default toggleBGM;
