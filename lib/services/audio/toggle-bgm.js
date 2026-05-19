import playBGM from '@/lib/services/audio/play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';

/**
 * # 切换背景音乐（开启/关闭）
 *
 * 根据当前 BGM 状态进行反向操作：
 *
 * - 如果 BGM 未播放（`bgmSchedulerId === 0`），则开始播放
 * - 如果 BGM 正在播放，则停止播放
 *
 * @function toggleBGM
 * @param {object} audio - Audio 对象实例
 * @param {number} level - 当前游戏等级（用于选曲）
 * @returns {void}
 */
const toggleBGM = (audio, level) => {
  // bgmSchedulerId 为 0 表示当前未播放，开始播放
  if (audio.bgmSchedulerId === 0) {
    playBGM(audio, level);
  } else {
    // 正在播放中，停止播放
    stopBGM(audio);
  }
};

export default toggleBGM;
