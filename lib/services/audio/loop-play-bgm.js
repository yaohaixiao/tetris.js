import playTone from '@/lib/services/audio/play-tone.js';

/**
 * 调度器每次向前看的提前量（秒）。
 *
 * 利用 AudioContext 的高精度时钟保证节奏稳定， 同时用较短的提前量降低延迟感。
 *
 * @constant {number}
 */
const SCHEDULE_AHEAD_TIME = 0.12;

/**
 * 调度器检查间隔（毫秒）。
 *
 * 值越小调度越密集、越跟手， 但 CPU 唤醒也更频繁。 25ms 是在精度与开销之间的常用折中。
 *
 * @constant {number}
 */
const LOOKAHEAD = 25;

/**
 * ============================================================
 *
 * # 循环播放背景音乐
 *
 * ============================================================
 *
 * 基于预调度 + Scheduler.interval 轮询的方式， 按旋律数组顺序持续播放音符，形成可无限循环的背景音乐。
 *
 * ## 工作原理
 *
 * 1. 维护虚拟指针 currentNoteIndex 指向当前音符
 * 2. Scheduler() 检查 nextNoteTime 是否落入调度窗口
 * 3. 若已落入，调用 playTone() 将音符排入时间线
 * 4. 定期触发 scheduler() 持续滚动向前
 * 5. 旋律末尾自动回绕至开头，实现无缝循环
 *
 * ## 设计特点
 *
 * - 时间精度：音符起点由 AudioContext 时钟控制
 * - 简洁性：无需 Web Worker，单线程即可运作
 * - 易停易启：通过 bgmSchedulerId 存放 interval ID
 * - 无缝循环：旋律末尾自动回绕至开头
 *
 * ## 示例
 *
 * ```javascript
 * loopPlayBGM(
 *   audio,
 *   [
 *     { freq: 440, dur: 1.0 },
 *     { freq: 880, dur: 2.0 },
 *     { freq: 0, dur: 0.5 }, // 休止符
 *   ],
 *   {
 *     duration: 200,
 *     volume: 0.08,
 *     wave: 'square',
 *     gate: 0.6,
 *   },
 * );
 * ```
 *
 * @function loopPlayBGM
 * @param {object} audio - Audio 对象实例
 * @param {{ freq: number; dur: number }[]} melody - 音符数组
 * @param {number} melody[].freq - 频率（Hz），0 表示休止符
 * @param {number} melody[].dur - 时长系数
 * @param {object} [options] - 播放选项
 * @param {number} [options.duration=110] - 基准时长（ms）. Default is `110`
 * @param {number} [options.volume=0.05] - 音量（0-1）. Default is `0.05`
 * @param {string} [options.wave='square'] - 波形类型. Default is `'square'`
 * @param {number} [options.gate=1] - 发音占比（0-1）. Default is `1`
 * @param {object} [options.articulation={}] - 运音包络参数. Default is `{}`
 * @returns {void}
 */
const loopPlayBGM = (audio, melody, options = {}) => {
  const {
    duration = 110,
    volume = 0.05,
    wave = 'square',
    gate = 1,
    articulation = {},
  } = options;

  // 无效参数保护
  if (duration <= 0 || !melody?.length) {
    return;
  }

  const { Scheduler, Context } = audio;

  // 确保 AudioContext 处于运行状态
  if (Context.state === 'suspended') {
    Context.resume();
  }

  // 当前播放到的音符索引
  let currentNoteIndex = 0;

  // 下一个音符应开始的时间（基于 AudioContext 时钟）
  let nextNoteTime = Context.currentTime;

  /**
   * 调度单个音符。
   *
   * 将指定音符排入 Web Audio 时间线在精确时刻播放。
   *
   * @param {object} note - 音符对象
   * @param {number} note.freq - 频率（Hz）
   * @param {number} note.dur - 时长系数
   * @param {number} time - 开始播放的时间
   */
  const scheduleNote = (note, time) => {
    const stepDur = note.dur * duration;

    // 频率大于 0 才播放（0 为休止符）
    if (note.freq > 0) {
      playTone(audio, note.freq, stepDur, {
        volume,
        wave,
        gate,
        articulation,
        startTime: time,
      });
    }
  };

  /**
   * 调度器。
   *
   * 定期被 Scheduler.interval 调用， 持续将未来的音符排入时间线。
   */
  const scheduler = () => {
    const audioNow = Context.currentTime;

    // 调度窗口上限：当前时间 + 提前量
    const limit = audioNow + SCHEDULE_AHEAD_TIME;

    // 将所有落入窗口内的音符排入时间线
    while (nextNoteTime < limit) {
      const note = melody[currentNoteIndex];

      scheduleNote(note, nextNoteTime);

      // 推进下一个音符的播放时间
      const stepDur = note.dur * duration;
      nextNoteTime += stepDur / 1000;

      // 推进索引，到达末尾时回绕至开头（循环播放）
      currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    }
  };

  // 使用 Scheduler.interval 启动调度器，每 LOOKAHEAD ms 检查一次
  audio.bgmSchedulerId = Scheduler.interval(scheduler, LOOKAHEAD);
};

export default loopPlayBGM;
