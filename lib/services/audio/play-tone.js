import isNumber from '@/lib/utils/types/is-number.js';

/**
 * ============================================================
 *
 * # 播放一个指定频率的音调
 *
 * ============================================================
 *
 * 基于 Web Audio API 创建 Oscillator 生成声音， 通过 GainNode 控制音量，播放一段固定时长的音频。
 *
 * ## 包络设计
 *
 * 采用 Attack-Decay（AD）包络模拟运音效果：
 *
 * - Attack 阶段：音量从 MIN_GAIN 线性冲到 volume 峰值
 * - Hold 阶段：保持在 volume × sustainRatio 处
 * - Decay 阶段：以指数曲线衰减到 MIN_GAIN
 * - Release 缓冲：osc.stop() 延迟 50ms 执行
 *
 * ## 音符时长控制
 *
 * 实际发声时长 = (dur / 1000) × gate 秒。 gate < 1 时人为制造音尾静音间隙，产生断奏效果。
 *
 * ## 常用场景
 *
 * - 游戏音效（落块、消行、旋转）
 * - UI feedback（点击提示音）
 * - 背景音乐单音符渲染
 *
 * ## 注意事项
 *
 * - AudioCtx 必须是已初始化的 AudioContext
 * - 在部分浏览器中需要用户交互后才能启动 audioCtx
 * - 函数结束后振荡器和增益节点通过 'ended' 事件自动释放
 *
 * ## 示例
 *
 * ```javascript
 * // 播放 440Hz、持续 200ms 的短音
 * playTone(audio, 440, 200, {
 *   volume: 0.1,
 *   wave: 'sine',
 *   gate: 1,
 * });
 *
 * // 播放短促方波音效（断奏）
 * playTone(audio, 880, 50, {
 *   volume: 0.12,
 *   wave: 'square',
 *   gate: 0.4,
 *   articulation: {
 *     attackTime: 0.001,
 *     releaseTime: 0.01,
 *     sustainRatio: 0.3,
 *   },
 * });
 * ```
 *
 * @function playTone
 * @param {object} audio - Audio 对象实例
 * @param {number} freq - 音频频率（Hz）
 * @param {number} dur - 播放时长（毫秒）
 * @param {object} [options] - 播放参数配置对象
 * @param {number} [options.volume=0.15] - 音量峰值（0~1）. Default is `0.15`
 * @param {string} [options.wave='square'] - 波形类型. Default is `'square'`
 * @param {number} [options.gate=1] - 音符时值占比（0~1）. Default is `1`
 * @param {object} [options.articulation] - 运音包络参数
 * @param {number} [options.articulation.attackTime=0.003] 起音时间（秒）. Default is
 *   `0.003`
 * @param {number} [options.articulation.releaseTime=0.02] 释音时间（秒）. Default is
 *   `0.02`
 * @param {number} [options.articulation.sustainRatio=0.9] 延音比. Default is `0.9`
 * @param {number} [options.startTime] - 开始时间（秒）
 * @returns {void}
 */
const playTone = (audio, freq, dur, options = {}) => {
  /*
   * ============================================================
   * 步骤 1：基础参数校验
   * ============================================================
   */
  if (!freq || dur <= 0) {
    return;
  }

  const { Context } = audio;

  /*
   * ============================================================
   * 步骤 2：解构播放参数并设置默认值
   * ============================================================
   */
  const {
    volume = 0.15,
    wave = 'square',
    gate = 1,
    articulation = {},
    startTime = Context.currentTime,
  } = options;

  /*
   * ============================================================
   * 步骤 3：创建音频节点
   * ============================================================
   */
  const osc = Context.createOscillator();
  const gain = Context.createGain();

  /*
   * ============================================================
   * 步骤 4：配置振荡器参数
   * ============================================================
   */
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, startTime);

  /*
   * ============================================================
   * 步骤 5：计算音符的实际发声时长
   * ============================================================
   */
  const step = dur / 1000;
  const noteLen = step * gate;

  /*
   * ============================================================
   * 步骤 6：解构运音包络参数
   * ============================================================
   */
  const {
    attackTime = 0.003,
    releaseTime = 0.02,
    sustainRatio = 0.9,
  } = articulation;

  /*
   * ============================================================
   * 步骤 7：计算包络的关键时间节点
   * ============================================================
   *
   * T0 → t1: Attack 阶段（线性上升）
   * t1 → t2: Hold 阶段（保持延音）
   * t2 → t3: Decay 阶段（指数衰减）
   * ============================================================
   */
  const t0 = startTime;
  const t1 = t0 + attackTime;
  const t2 = t0 + Math.max(noteLen - releaseTime, attackTime);
  const t3 = t0 + noteLen;

  /*
   * ============================================================
   * 步骤 8：定义增益常量并校验参数
   * ============================================================
   *
   * MIN_GAIN 不直接用 0：
   * 1. exponentialRampToValueAtTime 要求目标值 > 0
   * 2. 从 0 开始指数衰减会导致 NaN
   * 3. 人耳几乎听不到 -80dB 以下的声音
   * ============================================================
   */
  const MIN_GAIN = 0.0001;
  const safeVolume = isNumber(volume) && volume > 0 ? volume : 0.15;
  const safeSustainRatio =
    isNumber(sustainRatio) && sustainRatio > 0 ? sustainRatio : 0.9;

  if (!Number.isFinite(freq) || freq <= 0) {
    return;
  }

  /*
   * ============================================================
   * 步骤 9：设置增益包络（音量自动化）
   * ============================================================
   */
  gain.gain.setValueAtTime(MIN_GAIN, t0);

  // Attack 阶段：线性上升到峰值音量
  gain.gain.linearRampToValueAtTime(safeVolume, t1);

  // Hold 阶段：略微降低模拟自然衰减
  const sustainLevel = safeVolume * safeSustainRatio;

  if (!Number.isFinite(sustainLevel) || sustainLevel <= 0) {
    gain.gain.linearRampToValueAtTime(MIN_GAIN, t2);
  } else {
    gain.gain.linearRampToValueAtTime(sustainLevel, t2);
  }

  /*
   * ============================================================
   * 步骤 10：执行指数衰减（Decay 阶段）
   * ============================================================
   *
   * 指数衰减比线性衰减更接近真实乐器的自然衰减。
   * 失败时降级为线性衰减。
   * ============================================================
   */
  try {
    gain.gain.cancelScheduledValues(t2);

    const startGain = sustainLevel > 0 ? sustainLevel : MIN_GAIN;
    gain.gain.setValueAtTime(startGain, t2);

    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, t3);
  } catch {
    gain.gain.linearRampToValueAtTime(MIN_GAIN, t3);
  }

  /*
   * ============================================================
   * 步骤 11：连接音频节点链路
   * ============================================================
   *
   * Oscillator → Gain → Destination（扬声器）
   * ============================================================
   */
  osc.connect(gain);
  gain.connect(Context.destination);

  /*
   * ============================================================
   * 步骤 12：启动和停止振荡器
   * ============================================================
   *
   * 延迟 50ms 停止避免波形在非零位置被截断产生爆破音。
   * ============================================================
   */
  osc.start(t0);
  osc.stop(t3 + 0.05);

  /*
   * ============================================================
   * 步骤 13：自动清理资源（防止内存泄漏）
   * ============================================================
   */
  osc.addEventListener('ended', () => {
    osc.disconnect();
    gain.disconnect();
  });
};

export default playTone;
