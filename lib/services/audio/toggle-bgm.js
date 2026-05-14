import Audio from '@/lib/services/audio';
import playBGM from '@/lib/services/audio/play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';

/**
 * # 切换背景音乐（开启/关闭）
 *
 * 反转 BGM 启用状态，播放切换音效，并根据状态播放或停止 BGM
 *
 * @function toggleBGM
 * @param {number} level - 当前等级
 * @param {number} [maxLevel=99] - 游戏配置的最高等级. Default is `99`
 * @returns {void}
 */
const toggleBGM = (level, maxLevel = 99) => {
  // 根据新状态决定播放或停止背景音乐
  if (Audio.bgmSchedulerId === 0) {
    playBGM(level, maxLevel);
  } else {
    stopBGM();
  }
};

export default toggleBGM;
