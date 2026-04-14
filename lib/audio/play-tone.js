const audioCtx = new AudioContext();

/**
 * # 音频振荡器波形类型（等同于原生 OscillatorType）
 *
 * @typedef {'sine' | 'square' | 'triangle' | 'sawtooth'} OscillatorType
 */

/**
 * # 播放电子音调（用于游戏音效）
 *
 * 创建振荡器生成指定频率、时长、音量和波形的音频
 *
 * @function playTone
 * @param {number} freq - 音调频率（赫兹 Hz）
 * @param {number} dur - 持续时间（毫秒 ms）
 * @param {number} [vol=0.1] - 音量大小，默认 0.1. Default is `0.1`
 * @param {OscillatorType} [wave='square'] - 波形类型，默认 square（方波，适合复古游戏）. Default
 *   is `'square'`
 * @returns {void}
 */
const playTone = (freq, dur, vol = 0.1, wave = 'square') => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.value = vol;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  // 到达指定时长后停止发声
  setTimeout(() => {
    osc.stop();
  }, dur);
};

export default playTone;
