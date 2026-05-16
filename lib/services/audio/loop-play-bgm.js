import playTone from '@/lib/services/audio/play-tone.js';

/**
 * 调度器每次向前看的提前量（秒）。
 *
 * 调度器会提前将未来这段时间内的所有音符排入 Web Audio 时间线， 利用 AudioContext
 * 的高精度时钟保证节奏稳定，同时用较短地提前量降低延迟感。
 *
 * @constant {number}
 */
const SCHEDULE_AHEAD_TIME = 0.12;

/**
 * 调度器检查间隔（毫秒）。
 *
 * SetTimeout 的复发间隔。值越小调度越密集、越跟手，但 CPU 唤醒也更频繁。 25ms 是在精度与开销之间的常用折中。
 *
 * @constant {number}
 */
const LOOKAHEAD = 25;

/**
 * # 循环播放背景音乐（BGM）
 *
 * 基于 **预调度 + setTimeout 轮询** 的方式，按旋律数组顺序持续播放音符， 形成可无限循环的背景音乐。
 *
 * ## 工作原理
 *
 * 1. 维护一个虚拟指针 `currentNoteIndex` 指向当前音符，以及一个 "下一个音符应开始的时间" `nextNoteTime`（基于
 *    `AudioContext.currentTime`）。
 * 2. `scheduler()` 会检查 `nextNoteTime` 是否已经落入 `currentTime + SCHEDULE_AHEAD_TIME`
 *    的窗口内。
 * 3. 若已落入，则调用 `playTone()` 将该音符精确排入 Web Audio 时间线， 同时将 `nextNoteTime` 向后推进该音符的时长。
 * 4. 通过 `setTimeout` 定期（每 `LOOKAHEAD` ms）触发 `scheduler()`， 持续滚动向前，直至被外部通过
 *    `stopBGM()` 清除定时器。
 *
 * ## 设计特点
 *
 * - 时间精度：音符起点由 `AudioContext` 时钟控制，不受 setTimeout 抖动影响
 * - 简洁性：无需 Web Worker，单线程即可运作
 * - 易停易启：`AudioState.bgmTimer` 存放定时器 ID，外部可直接 clearTimeout
 * - 无缝循环：旋律末尾自动回绕至开头
 *
 * @example
 *   // 播放一首简单的三段旋律，循环
 *   loopPlayBGM(
 *     [
 *       { freq: 440, dur: 1.0 },
 *       { freq: 880, dur: 2.0 },
 *       { freq: 0, dur: 0.5 },
 *     ],
 *     {
 *       duration: 200,
 *       volume: 0.08,
 *       wave: 'sine',
 *       gate: 1,
 *     },
 *   );
 *
 * @function loopPlayBGM
 * @param {object} audio - Audio 对象实例
 * @param {object[]} melody - 音符数组
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
  const {
    duration = 110,
    volume = 0.05,
    wave = 'square',
    gate = 1,
    articulation = {},
  } = options;

  const { Scheduler, Context } = audio;

  if (duration <= 0 || !melody?.length) {
    return;
  }

  let currentNoteIndex = 0;
  let nextNoteTime = Context.currentTime;

  const scheduleNote = (note, time) => {
    const stepDur = note.dur * duration;

    if (note.freq > 0) {
      // 播放
      playTone(audio, note.freq, stepDur, {
        volume,
        wave,
        gate,
        articulation,
        startTime: time,
      });
    }
  };

  const scheduler = () => {
    const audioNow = Context.currentTime;
    const limit = audioNow + SCHEDULE_AHEAD_TIME;

    // 👉 必须推进 index，否则会无限重复同一音符
    while (nextNoteTime < limit) {
      const note = melody[currentNoteIndex];

      scheduleNote(note, nextNoteTime);

      const stepDur = note.dur * duration;

      nextNoteTime += stepDur / 1000;
      currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    }
  };

  audio.bgmSchedulerId = Scheduler.interval(scheduler, LOOKAHEAD);
};

export default loopPlayBGM;
