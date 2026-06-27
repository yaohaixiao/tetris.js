import isNumber from '@/lib/utils/types/is-number.js';

/**
 * # 播放一个指定频率的音调（Tone）
 *
 * 基于 Web Audio API 创建一个 Oscillator（振荡器）来生成声音， 并通过 GainNode 控制音量，播放一段固定时长的音频。
 *
 * ## 包络设计
 *
 * 采用 Attack-Decay（AD）包络模拟运音效果：
 *
 * - **Attack 阶段**：音量从接近 0（MIN_GAIN）线性冲到 volume 峰值
 * - **Hold 阶段**：保持在 volume × sustainRatio 处，撑住音符主体
 * - **Decay 阶段**：以指数曲线衰减到接近 0（MIN_GAIN）
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
 * @param {object} audio - Audio 对象实例，需包含 Context 属性（AudioContext 实例）
 * @param {number} freq - 音频频率（Hz），例如 440 = A4 标准音，游戏常用范围 100~2000
 * @param {number} dur - 播放时长（毫秒），例如 100 = 0.1 秒
 * @param {object} [options] - 播放参数配置对象
 * @param {number} [options.volume=0.15] - 音量峰值（0~1），建议 0.1~0.3 避免爆音. Default is
 *   `0.15`
 * @param {string} [options.wave='square'] - 波形类型：'sine' | 'square' | 'sawtooth'
 *   | 'triangle' | 'custom'. Default is `'square'`
 * @param {number} [options.gate=1] - 音符时值占比（0~1），< 1 产生断奏效果. Default is `1`
 * @param {object} [options.articulation] - 运音包络参数
 * @param {number} [options.articulation.attackTime=0.003] - 起音时间（秒），3ms 快速起音.
 *   Default is `0.003`
 * @param {number} [options.articulation.releaseTime=0.02] - 释音时间（秒），20ms 平滑收尾.
 *   Default is `0.02`
 * @param {number} [options.articulation.sustainRatio=0.9] - 延音比，保持 90%
 *   峰值音量进入衰减段. Default is `0.9`
 * @param {number} [options.startTime] - 开始时间（秒），默认为 Context.currentTime
 * @returns {void}
 */
const playTone = (audio, freq, dur, options = {}) => {
  /* ========== 第一步：基础参数校验 ========== */

  /** 频率必须存在且为正数，时长必须大于 0 如果参数无效则静默退出，避免创建无效的音频节点 */
  if (!freq || dur <= 0) {
    return;
  }

  // 从 audio 对象中解构出 AudioContext 实例
  const { Context } = audio;

  /* ========== 第二步：解构播放参数并设置默认值 ========== */

  const {
    volume = 0.15, // 音量峰值，默认 15%
    wave = 'square', // 波形类型，默认方波（音色较硬，适合游戏音效）
    gate = 1, // 时值占比，1 = 连奏（音符唱满）
    articulation = {}, // 运音包络参数，详见下方解构
    startTime = Context.currentTime, // 开始时间，默认立即播放
  } = options;

  /* ========== 第三步：创建音频节点 ========== */

  /** OscillatorNode（振荡器节点） 负责生成原始波形信号，是声音的"音源" */
  const osc = Context.createOscillator();

  /** GainNode（增益节点） 控制音量大小，相当于"音量旋钮" */
  const gain = Context.createGain();

  /* ========== 第四步：配置振荡器参数 ========== */

  // 设置波形类型（决定音色）
  osc.type = wave;

  /** 在指定时间点设置频率值 setValueAtTime 是精确时间调度方法，确保频率在正确的时间点生效 */
  osc.frequency.setValueAtTime(freq, startTime);

  /* ========== 第五步：计算音符的实际发声时长 ========== */

  /**
   * Step: 将毫秒转换为秒 noteLen: 实际发声时长 = 标称时长 × 门限比例
   *
   * 例如：dur=200ms, gate=0.5 → 实际发声 100ms，后 100ms 为静音间隙 这种断奏效果在快节奏音乐中能增加清晰度
   */
  const step = dur / 1000; // 标称时长（秒）
  const noteLen = step * gate; // 实际发声时长（秒）

  /* ========== 第六步：解构运音包络参数 ========== */

  const {
    attackTime = 0.003, // 起音时间：从触发到达到峰值的时间（秒）
    releaseTime = 0.02, // 释音时间：从开始衰减到归零的时间（秒）
    sustainRatio = 0.9, // 延音比：峰值音量在 hold 阶段的保持比例
  } = articulation;

  /* ========== 第七步：计算包络的关键时间节点 ========== */

  /**
   * 包络时间轴：
   *
   * T0 t1 t2 t3 |─────────|───────────────|───────────────| Start Attack 结束
   * Hold 结束 音符结束 (0) (峰值) (延音) (归零)
   *
   * T0 → t1: Attack 阶段（线性上升） t1 → t2: Hold 阶段（保持延音） t2 → t3: Decay 阶段（指数衰减）
   */

  const t0 = startTime; // 音符起始时间
  const t1 = t0 + attackTime; // Attack 结束时间
  const t2 = t0 + Math.max(noteLen - releaseTime, attackTime); // 开始衰减时间
  const t3 = t0 + noteLen; // 音符结束时间（归零）

  /* ========== 第八步：定义增益常量并校验参数 ========== */

  /**
   * MIN_GAIN: 最小增益值（接近 0 但不为 0）
   *
   * 为什么不直接用 0？
   *
   * 1. ExponentialRampToValueAtTime 要求目标值 > 0
   * 2. 从 0 开始指数衰减会导致 NaN（数学上 log(0) 无定义）
   * 3. 人耳几乎听不到 -80dB 以下的声音（MIN_GAIN ≈ -100dB）
   *
   * 使用数字分隔符（_）提高可读性：一眼看出是 5 个零加 1
   */
  const MIN_GAIN = 0.0001;

  /** 安全音量值：确保 volume 是有效的正数 使用 isNumber 工具函数 + Number.isFinite 双重校验 */
  const safeVolume = isNumber(volume) && volume > 0 ? volume : 0.15;

  /**
   * 安全延音比：确保 sustainRatio 是有效的正数 注意：这里误用了 isNumber(volume)，应该是
   * isNumber(sustainRatio)
   */
  const safeSustainRatio =
    isNumber(sustainRatio) && sustainRatio > 0 ? sustainRatio : 0.9;

  /** 再次验证频率是否有效（虽然开头已经校验过，但二次确认更安全） 防止传入 Infinity 或 NaN 导致 Web Audio API 报错 */
  if (!Number.isFinite(freq) || freq <= 0) {
    return;
  }

  /* ========== 第九步：设置增益包络（音量自动化） ========== */

  /** 在起始时间点将增益设置为 MIN_GAIN 这个值足够小，人耳听不到，但避免了从 0 开始的数学问题 */
  gain.gain.setValueAtTime(MIN_GAIN, t0);

  /**
   * Attack 阶段：从 MIN_GAIN 线性上升到峰值音量 linearRampToValueAtTime 会在指定时间内平滑过渡到目标值
   * 线性插值适合 Attack 阶段，能产生自然的音头冲击感
   */
  gain.gain.linearRampToValueAtTime(safeVolume, t1);

  /**
   * 计算延音电平值 例如：volume=0.15, sustainRatio=0.9 → sustainLevel=0.135 意味着在 Hold
   * 阶段音量略微降低，模拟真实乐器的自然衰减
   */
  const sustainLevel = safeVolume * safeSustainRatio;

  /** 在 t2 时刻到达延音电平 检查 sustainLevel 是否有效，无效则回退到 MIN_GAIN */
  if (!Number.isFinite(sustainLevel) || sustainLevel <= 0) {
    gain.gain.linearRampToValueAtTime(MIN_GAIN, t2);
  } else {
    gain.gain.linearRampToValueAtTime(sustainLevel, t2);
  }

  /* ========== 第十步：执行指数衰减（Decay 阶段） ========== */

  /**
   * 为什么用指数衰减？ 真实乐器的自然衰减呈指数曲线，比线性衰减更自然
   *
   * 为什么可能失败？
   *
   * 1. 起始值或目标值为 0 或负数
   * 2. 起始值和目标值符号不同
   * 3. 时间参数无效（如 t3 <= t2）
   *
   * 解决方案：
   *
   * 1. CancelScheduledValues 清除之前的调度，避免冲突
   * 2. 显式 setValueAtTime 确保起始值正确
   * 3. Try-catch 捕获异常，降级为线性衰减
   */
  try {
    /** 取消 t2 时间点之后的所有已调度事件 防止之前的 ramp 事件干扰新的指数衰减 */
    gain.gain.cancelScheduledValues(t2);

    /** 在 t2 时间点显式设置增益值 确保指数衰减的起始值是明确的 */
    const startGain = sustainLevel > 0 ? sustainLevel : MIN_GAIN;
    gain.gain.setValueAtTime(startGain, t2);

    /** 执行指数衰减到 MIN_GAIN 这是最自然的音量衰减方式 */
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, t3);
  } catch {
    /**
     * 降级方案：如果指数衰减失败，使用线性衰减 线性衰减虽然不那么自然，但能保证不报错
     *
     * 可能失败的情况：
     *
     * - 浏览器不支持（极罕见）
     * - 起始值/目标值不合规（虽然我们已经做了校验）
     */
    gain.gain.linearRampToValueAtTime(MIN_GAIN, t3);
  }

  /* ========== 第十一步：连接音频节点链路 ========== */

  /**
   * 音频信号流： Oscillator (音源) → Gain (音量控制) → Destination (扬声器)
   *
   * 必须按这个顺序连接，否则听不到声音
   */
  osc.connect(gain);
  gain.connect(Context.destination);

  /* ========== 第十二步：启动和停止振荡器 ========== */

  /** 在 t0 时刻开始发声 start() 可以精确调度，不传参则立即开始 */
  osc.start(t0);

  /**
   * 在包络完全归零后延迟 50ms 停止振荡器
   *
   * 为什么要延迟？
   *
   * 1. 避免波形在非零位置被截断，产生"噗噗"的爆破音
   * 2. 给指数衰减足够的时间到达 MIN_GAIN
   * 3. 50ms 的缓冲足以让增益值低到人耳听不见
   *
   * 此时振荡器虽然还在运行，但增益已接近 0，所以听不到声音
   */
  osc.stop(t3 + 0.05);

  /* ========== 第十三步：自动清理资源（防止内存泄漏） ========== */

  /**
   * 当振荡器停止后，触发 'ended' 事件 在此事件中断开所有音频节点的连接，释放资源
   *
   * 如果不做清理，随着播放次数增加，会积累大量无用节点 导致内存泄漏和性能下降
   */
  osc.addEventListener('ended', () => {
    /** Disconnect() 将节点从音频链路中移除 移除后节点不再处理音频信号，可以被垃圾回收 */
    osc.disconnect();
    gain.disconnect();
  });
};

export default playTone;
