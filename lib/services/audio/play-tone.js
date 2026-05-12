import AudioState from '@/lib/services/audio/state/audio-state.js';

/**
 * # 播放一个指定频率的音调（Tone）
 *
 * 基于 Web Audio API 创建一个 Oscillator（振荡器）来生成声音， 并通过 GainNode 控制音量，播放一段固定时长的音频。
 *
 * ## 包络设计
 *
 * 采用 Attack-Decay（AD）包络模拟运音效果：
 *
 * - **Attack 阶段**：音量从接近 0（0.0001）线性冲到 volume 峰值
 * - **Hold 阶段**：保持在 volume × sustainRatio 处，撑住音符主体
 * - **Decay 阶段**：以指数曲线衰减到接近 0（0.0001）
 * - **Release 缓冲**：osc.stop() 延迟 50ms 执行，确保波形在绝对静音后才被切断
 *
 * ## 音符时长控制
 *
 * 实际发声时长 = (dur / 1000) × gate 秒。 gate < 1 时人为制造音尾静音间隙，产生断奏（staccato）效果。
 *
 * ## 常用场景
 *
 * - 游戏音效（落块、消行、旋转）
 * - UI feedback（点击提示音）
 * - 背景音乐单音符渲染（配合调度器使用）
 *
 * ## 注意事项
 *
 * - AudioCtx 必须是已初始化的 AudioContext
 * - 在部分浏览器中需要用户交互后才能启动 audioCtx
 * - 函数结束后振荡器和增益节点会通过 'ended' 事件自动释放
 *
 * @example
 *   // 播放一个 440Hz、持续 200ms 的短音，使用正弦波、连奏
 *   playTone(440, 200, {
 *     volume: 0.1,
 *     wave: 'sine',
 *     gate: 1,
 *   });
 *
 * @example
 *   // 播放短促方波音效（断奏）
 *   playTone(880, 50, {
 *     volume: 0.12,
 *     wave: 'square',
 *     gate: 0.4,
 *     articulation: {
 *       attackTime: 0.001,
 *       releaseTime: 0.01,
 *       sustainRatio: 0.3,
 *     },
 *   });
 *
 * @function playTone
 * @param {number} freq - 音频频率（Hz），例如 440 = A4 标准音，游戏常用范围 100~2000
 * @param {number} dur - 播放时长（毫秒），例如 100 = 0.1 秒
 * @param {object} [options] - 播放参数
 * @returns {void}
 */
const playTone = (freq, dur, options = {}) => {
  // ---- 参数校验 ----
  if (!freq || dur <= 0) {
    return;
  }

  const { audioCtx } = AudioState;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {});
  }

  // ---- 解构播放参数（带默认值）----
  const {
    volume = 0.15, // 音量峰值
    wave = 'square', // 默认方波
    gate = 1, // 默认连奏，音符唱满时值
    articulation = {}, // 运音包络
    startTime = audioCtx.currentTime, // 默认立即开始
  } = options;

  // ---- 创建音频节点 ----
  const osc = audioCtx.createOscillator(); // 振荡器（音源）
  const gain = audioCtx.createGain(); // 增益节点（音量控制）

  // ---- 设置振荡器参数 ----
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, startTime);

  // ---- 计算实际发声时长 ----
  const step = dur / 1000; // 标称时长（秒）
  const noteLen = step * gate; // 实际发声时长 = 标称时长 × 发音占比

  // ---- 解构运音包络参数（带默认值）----
  const {
    attackTime = 0.003, // 起音时间，3ms 快速起音
    releaseTime = 0.02, // 释音时间，20ms 平滑收尾
    sustainRatio = 0.9, // 延音比，保持 90% 峰值音量进入衰减段
  } = articulation;

  // ---- 计算包络时间节点 ----
  const t0 = startTime; // 音符起始
  const t1 = t0 + attackTime; // Attack 结束（到达峰值）
  const t2 = t0 + Math.max(noteLen - releaseTime, attackTime); // Hold 结束（开始衰减）
  const t3 = t0 + noteLen; // 音符结束（归零）

  /* ---- 包络曲线 ---- */
  // t0: 设为接近 0，避免指数衰减从纯 0 开始时产生 NaN
  gain.gain.setValueAtTime(0.0001, t0);

  // t0 → t1: 线性冲到峰值音量
  gain.gain.linearRampToValueAtTime(volume, t1);

  // t2 时刻: 保持在 volume × sustainRatio，撑住音符主体
  gain.gain.linearRampToValueAtTime(volume * sustainRatio, t2);

  // t2 → t3: 指数衰减到接近 0
  gain.gain.exponentialRampToValueAtTime(0.0001, t3);

  /* ---- 连接音频节点链路 ---- */
  // 振荡器 → 增益节点 → 音频输出
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  // ---- 启动和停止振荡器 ----
  osc.start(t0);
  // 在包络完全归零后再延后 50ms 停止，防止波形被生硬切断产生"噗噗"声
  osc.stop(t3 + 0.05);

  // ---- 播放结束后自动释放资源 ----
  osc.addEventListener('ended', () => {
    osc.disconnect();
    gain.disconnect();
  });
};

export default playTone;
