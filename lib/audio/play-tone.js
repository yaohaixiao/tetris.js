const audioCtx = new AudioContext();

/**
 * # 音频振荡器波形类型（等同于原生 OscillatorType）
 *
 * @typedef {'sine' | 'square' | 'triangle' | 'sawtooth'} OscillatorType
 */

/**
 * # 播放一个指定频率的音调（Tone）
 *
 * 基于 Web Audio API 创建一个 Oscillator（振荡器）来生成声音， 并通过 GainNode 控制音量，播放一段固定时长的音频。
 *
 * 常用于：
 *
 * - 游戏音效（落块、消行、旋转）
 * - UI feedback（点击提示音）
 *
 * 注意：
 *
 * - AudioCtx 必须是已初始化的 AudioContext
 * - 在部分浏览器中需要用户交互后才能启动 audioCtx
 *
 * @function playTone
 * @param {number} freq - 音频频率（Hz）
 *
 *   - 例如：440 = A4 标准音
 *   - 游戏常用范围：100 ~ 2000
 *
 * @param {number} dur - 播放时长（毫秒 ms）
 *
 *   - 例如：100 = 0.1 秒
 *
 * @param {number} [vol=0.1] - 音量（0.0 ~ 1.0）
 *
 *   - 默认 0.1 避免爆音 Default is `0.1`
 *
 * @param {OscillatorType} [wave='square'] - 波形类型
 *
 *   - 'sine' : 纯音（柔和）
 *   - 'square' : 方波（游戏常用，比较“电子感”）
 *   - 'triangle': 三角波（中等柔和）
 *   - 'sawtooth': 锯齿波（刺耳感强） Default is `'square'`
 *
 * @returns {void}
 */
const playTone = (freq, dur, vol = 0.1, wave = 'square') => {
  // 1. 创建音频振荡器（音源）
  const osc = audioCtx.createOscillator();
  // 2. 创建音量控制节点
  const gain = audioCtx.createGain();

  // 3. 设置振荡器参数
  osc.type = wave; // 设置波形类型（决定音色）
  // 设置频率（音高）
  osc.frequency.value = freq;

  const now = audioCtx.currentTime;
  const durationInSeconds = dur / 1000;

  // 给音符加个“打击包络” (Attack-Decay)
  gain.gain.setValueAtTime(0, now);
  // 0.01秒内迅速冲到最高音量（打击感）
  gain.gain.linearRampToValueAtTime(vol, now + 0.01);
  // 在音符结束前迅速衰减到0（断奏感）
  gain.gain.exponentialRampToValueAtTime(0.0001, durationInSeconds);

  // 4. 设置音量
  gain.gain.value = vol;

  // 5. 连接音频节点：osc -> gain -> speaker(output)
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  // 6. 开始播放声音
  osc.start();
  // 7. 定时停止（控制音符长度）
  osc.stop(now + durationInSeconds);
  // 自动释放内存
  osc.addEventListener('ended', () => {
    osc.disconnect();
    gain.disconnect();
  });
};

export default playTone;
