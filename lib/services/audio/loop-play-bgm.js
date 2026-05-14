import Engine from '@/lib/engine';
import Audio from '@/lib/services/audio';
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
const loopPlayBGM = (melody, options = {}) => {
  //  解构播放参数（带默认值）
  const {
    duration = 110, // 基准时长：dur 为 1.0 时对应 110ms
    volume = 0.05, // 主音量
    wave = 'square', // 默认方波，富有颗粒感
    gate = 1, // 默认连奏，不产生间隙
    articulation = {}, // 运音包络，playTone 内部会再次指定默认值
  } = options;

  const { Scheduler } = Engine;

  // 防御非法 duration
  if (duration <= 0) {
    return;
  }

  /** 当前播放到的音符索引（0 起始） */
  let currentNoteIndex = 0;

  /** 下一个音符应在 AudioContext 时间线上的起始时间（秒）。 初始化为当前时间，使第一个音符立刻被调度。 */
  let nextNoteTime = Audio.Context.currentTime;

  /**
   * ## 内部函数：调度单个音符
   *
   * 将一个音符排入 Web Audio 时间线，并更新 nextNoteTime。
   *
   * @param {object} note - 当前音符对象
   * @param {number} note.freq - 频率（Hz），0 为休止
   * @param {number} note.dur - 时长系数
   * @param {number} time - 音符应在 AudioContext 时间线上的起始时间（秒）
   */
  const scheduleNote = (note, time) => {
    const { freq, dur } = note;

    // 将抽象时长系数转换为实际毫秒值
    const stepDur = dur * duration;

    if (freq > 0) {
      Scheduler.delayAt(() => {
        playTone(note.freq, stepDur, {
          volume,
          wave,
          gate,
          articulation,
          startTime: time,
        });
      }, time);
    }

    // 移动旋律指针，触底回绕实现循环
    nextNoteTime += stepDur / 1000;
  };

  /**
   * ## 内部函数：调度器主循环
   *
   * 定时检查并排入未来 SCHEDULE_AHEAD_TIME 时间窗内的所有音符。
   *
   * 特点：
   *
   * - 一次性排入多个音符（while 循环），减少 setTimeout 调用次数
   * - 到达旋律末尾时 currentNoteIndex 归零，实现无缝循环
   */
  const scheduler = () => {
    // 将起始时间已进入提前窗口的所有音符依次排入
    while (nextNoteTime < Audio.Context.currentTime + SCHEDULE_AHEAD_TIME) {
      // 取出当前音符
      const note = melody[currentNoteIndex];

      scheduleNote(note, nextNoteTime);

      currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    }
  };

  // 定时再次检查，形成持续的"轮询-调度"循环
  Audio.bgmSchedulerId = Scheduler.interval(scheduler, LOOKAHEAD);
};

export default loopPlayBGM;
