import playTone from '@/lib/services/audio/play-tone.js';

/**
 * ## 调度器每次向前看的提前量（秒）
 *
 * 调度器会提前将未来这段时间内的所有音符排入 Web Audio 时间线， 利用 AudioContext 的高精度时钟保证节奏稳定，
 * 同时用较短的提前量降低延迟感。
 *
 * @constant {number}
 */
const SCHEDULE_AHEAD_TIME = 0.12;

/**
 * ## 调度器检查间隔（毫秒）
 *
 * Scheduler.interval 的复发间隔。值越小调度越密集、越跟手， 但 CPU 唤醒也更频繁。25ms 是在精度与开销之间的常用折中。
 *
 * @constant {number}
 */
const LOOKAHEAD = 25;

/**
 * # 循环播放背景音乐（BGM）
 *
 * 基于 **预调度 + Scheduler.interval 轮询** 的方式， 按旋律数组顺序持续播放音符，形成可无限循环的背景音乐。
 *
 * ## 工作原理
 *
 * 1. 维护一个虚拟指针 `currentNoteIndex` 指向当前音符， 以及一个"下一个音符应开始的时间" `nextNoteTime`（基于
 *    `AudioContext.currentTime`）。
 * 2. `scheduler()` 会检查 `nextNoteTime` 是否已经落入 `currentTime + SCHEDULE_AHEAD_TIME`
 *    的窗口内。
 * 3. 若已落入，则调用 `playTone()` 将该音符精确排入 Web Audio 时间线， 同时将 `nextNoteTime` 向后推进该音符的时长。
 * 4. 通过 `Scheduler.interval` 定期（每 `LOOKAHEAD` ms）触发 `scheduler()`， 持续滚动向前，直至被外部通过
 *    `stopBGM()` 清除。
 *
 * ## 设计特点
 *
 * - **时间精度**：音符起点由 `AudioContext` 时钟控制，不受 interval 抖动影响
 * - **简洁性**：无需 Web Worker，单线程即可运作
 * - **易停易启**：通过 `audio.bgmSchedulerId` 存放 interval ID，外部可直接取消
 * - **无缝循环**：旋律末尾自动回绕至开头（`% melody.length`）
 *
 * @example
 *   // 播放一首简单的旋律，循环
 *   loopPlayBGM(
 *     audio,
 *     [
 *       { freq: 440, dur: 1.0 },
 *       { freq: 880, dur: 2.0 },
 *       { freq: 0, dur: 0.5 }, // 休止符
 *     ],
 *     {
 *       duration: 200,
 *       volume: 0.08,
 *       wave: 'square',
 *       gate: 0.6,
 *     },
 *   );
 *
 * @function loopPlayBGM
 * @param {object} audio - Audio 对象实例（含 Scheduler 和 Context）
 * @param {{ freq: number; dur: number }[]} melody - 音符数组
 * @param {number} melody[].freq - 频率（Hz），`0` 表示休止符
 * @param {number} melody[].dur - 时长系数，实际时长 = dur × duration（毫秒）
 * @param {object} [options] - 播放选项
 * @param {number} [options.duration=110] - 基准时长（ms），一个 dur 单位对应的毫秒数. Default is
 *   `110`
 * @param {number} [options.volume=0.05] - 音量（0-1）. Default is `0.05`
 * @param {string} [options.wave='square'] - 波形类型（'sine' | 'square' | 'triangle'
 *   | 'sawtooth'）. Default is `'square'`
 * @param {number} [options.gate=1] - 发音占比（0-1），1 为连奏，小于 1 产生断奏间隙. Default is
 *   `1`
 * @param {object} [options.articulation={}] - 运音包络参数. Default is `{}`
 * @param {number} [options.articulation.attackTime=0.003] - 起音时间（秒）. Default is
 *   `0.003`
 * @param {number} [options.articulation.releaseTime=0.02] - 释音时间（秒）. Default is
 *   `0.02`
 * @param {number} [options.articulation.sustainRatio=0.9] - 延音比（0-1）. Default
 *   is `0.9`
 * @returns {void}
 */
const loopPlayBGM = (audio, melody, options = {}) => {
  // 解构播放选项
  const {
    duration = 110,
    volume = 0.05,
    wave = 'square',
    gate = 1,
    articulation = {},
  } = options;

  const { Scheduler, Context } = audio;

  // 无效参数保护
  if (duration <= 0 || !melody?.length) {
    return;
  }

  /** ## 当前播放到的音符索引 */
  let currentNoteIndex = 0;

  /** ## 下一个音符应开始的时间（基于 AudioContext 时钟） */
  let nextNoteTime = Context.currentTime;

  /**
   * ## 调度单个音符
   *
   * 将指定音符排入 Web Audio 时间线在精确时刻播放。
   *
   * @param {object} note - 音符对象
   * @param {number} note.freq - 频率（Hz）
   * @param {number} note.dur - 时长系数
   * @param {number} time - 开始播放的时间（基于 AudioContext.currentTime）
   */
  const scheduleNote = (note, time) => {
    // 计算实际时长（毫秒）
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
   * ## 调度器
   *
   * 定期被 Scheduler.interval 调用，持续将未来的音符排入时间线。 这是 BGM 循环播放的核心驱动逻辑。
   */
  const scheduler = () => {
    const audioNow = Context.currentTime;
    // 调度窗口上限：当前时间 + 提前量
    const limit = audioNow + SCHEDULE_AHEAD_TIME;

    // 将所有落入窗口内的音符排入时间线
    while (nextNoteTime < limit) {
      const note = melody[currentNoteIndex];

      // 调度当前音符
      scheduleNote(note, nextNoteTime);

      // 计算该音符的实际时长（秒）
      const stepDur = note.dur * duration;

      // 推进下一个音符的播放时间
      nextNoteTime += stepDur / 1000;

      // 推进索引，到达末尾时回绕至开头（循环播放）
      currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    }
  };

  // 使用 Scheduler.interval 启动调度器，每 LOOKAHEAD ms 检查一次
  audio.bgmSchedulerId = Scheduler.interval(scheduler, LOOKAHEAD);
};

export default loopPlayBGM;
