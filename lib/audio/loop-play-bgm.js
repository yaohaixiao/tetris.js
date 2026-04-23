import AudioState from '@/lib/audio/state/audio-state.js';
import playTone from '@/lib/audio/play-tone.js';

/**
 * # 循环播放背景音乐（BGM）
 *
 * 通过递归 + setTimeout 的方式，按音符数组顺序不断播放音符， 形成简单的背景旋律循环。
 *
 * 特点：
 *
 * - 非精确音频调度（基于 setTimeout）
 * - 简单易用，适合轻量游戏 BGM
 * - 可通过 AudioState.bgmTimer 控制停止
 *
 * @param {number} i - 当前播放的音符索引
 * @param {number[]} m - 音符频率数组（melody）
 * @param {number} [dur=110] - 短音符. Default is `110`
 * @param {number} [vol=0.05] - 低音量. Default is `0.05`
 */
const loopPlayBGM = (i, m, dur = 110, vol = 0.05) => {
  // 1. 循环边界处理
  if (i >= m.length) {
    // 回到开头，实现无限循环
    i = 0;
  }

  /**
   * 2. 播放当前音符
   *
   * Freq = m[i] duration = 110ms（短音符） volume = 0.05（低音量，避免干扰游戏音效）
   */
  playTone(m[i], dur * 0.8, vol);

  // 3. 调度下一个音符
  AudioState.bgmTimer = setTimeout(() => {
    loopPlayBGM(i + 1, m, dur, vol);
  }, dur);
};

export default loopPlayBGM;
