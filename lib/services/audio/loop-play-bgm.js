import AudioState from '@/lib/services/audio/state/audio-state.js';
import playTone from '@/lib/services/audio/play-tone.js';

const GATES = {
  sine: 0.85,
  square: 0.96,
  triangle: 0.93,
};

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
 * @param {object[]} melody - 音符频率数组（melody）
 * @param {number} [baseDur=110] - 短音符. Default is `110`
 * @param {number} [vol=0.05] - 低音量. Default is `0.05`
 * @param {object} [wave='square'] - 默认波形. Default is `'square'`
 */
const loopPlayBGM = (i, melody, baseDur = 110, vol = 0.05, wave = 'square') => {
  if (i >= melody.length) {
    i = 0;
  }

  const note = melody[i];
  const { freq, dur } = note;
  const gate = GATES[wave];
  const duration = dur * baseDur;
  const playDur = duration * gate;

  if (freq > 0) {
    playTone(freq, playDur, vol, wave);
  }

  AudioState.bgmTimer = setTimeout(() => {
    loopPlayBGM(i + 1, melody, baseDur, vol, wave);
  }, duration);
};

export default loopPlayBGM;
