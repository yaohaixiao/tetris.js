import AudioState from '@/lib/audio/state/audio-state.js';
import playTone from '@/lib/audio/play-tone.js';

/**
 * # 背景音乐 BGM 自动循环播放
 *
 * 递归遍历音符数组，循环播放背景音乐旋律
 *
 * @function loopPlayBGM
 * @param {number} i - 当前播放的音符索引
 * @param {number[]} m - 音符频率数组
 * @returns {void}
 */
const loopPlayBGM = (i, m) => {
  // 如果索引超出音符长度，重置为 0，实现循环播放
  if (i >= m.length) {
    i = 0;
  }

  // 播放当前音符（低音量，BGM 背景音）
  playTone(m[i], 110, 0.05);

  // 延迟后播放下一个音符，形成连续 BGM 旋律
  AudioState.bgmTimer = setTimeout(() => {
    loopPlayBGM(i + 1, m);
  }, 130);
};

export default loopPlayBGM;
