/**
 * # 背景音乐：FrozenPeaks
 *
 * 空灵冰峰风格，正弦波营造寒冷孤高的氛围。 长音为主，高音区泛音营造空间感。
 *
 * @constant {object} FrozenPeaks
 */
const FrozenPeaks = {
  name: 'FrozenPeaks',

  melody: [
    // ===== 引子（高远冰峰）=====
    { freq: 880, dur: 2 },
    { freq: 0, dur: 0.5 },
    { freq: 784, dur: 1.5 },
    { freq: 0, dur: 0.5 },
    { freq: 988, dur: 2 },
    { freq: 0, dur: 0.5 },
    { freq: 880, dur: 1 },
    { freq: 784, dur: 0.5 },
    { freq: 698, dur: 1 },

    // ===== 主动机（雪花飘落）=====
    { freq: 659, dur: 0.75 },
    { freq: 698, dur: 0.25 },
    { freq: 784, dur: 1 },
    { freq: 698, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 587, dur: 0.5 },
    { freq: 523, dur: 1 },
    { freq: 0, dur: 0.25 },
    { freq: 587, dur: 0.25 },
    { freq: 659, dur: 0.75 },
    { freq: 698, dur: 0.25 },
    { freq: 784, dur: 1 },

    // ===== 上行探索 =====
    { freq: 784, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 988, dur: 1 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.5 },
    { freq: 988, dur: 0.5 },
    { freq: 1175, dur: 1.5 },
    { freq: 0, dur: 0.5 },
    { freq: 988, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.5 },
    { freq: 698, dur: 1 },

    // ===== 暴风雪（密集音符）=====
    { freq: 659, dur: 0.25 },
    { freq: 698, dur: 0.25 },
    { freq: 784, dur: 0.25 },
    { freq: 880, dur: 0.25 },
    { freq: 988, dur: 0.25 },
    { freq: 880, dur: 0.25 },
    { freq: 784, dur: 0.25 },
    { freq: 698, dur: 0.25 },
    { freq: 784, dur: 0.5 },
    { freq: 988, dur: 0.5 },
    { freq: 1175, dur: 1 },
    { freq: 0, dur: 0.25 },
    { freq: 1175, dur: 0.25 },
    { freq: 988, dur: 0.5 },
    { freq: 880, dur: 1 },

    // ===== 平静（风雪渐歇）=====
    { freq: 784, dur: 1.5 },
    { freq: 0, dur: 0.5 },
    { freq: 698, dur: 1 },
    { freq: 659, dur: 1 },
    { freq: 587, dur: 1.5 },
    { freq: 523, dur: 1 },
    { freq: 587, dur: 0.5 },
    { freq: 659, dur: 1 },
    { freq: 0, dur: 0.5 },

    // ===== 循环点（冰峰再现）=====
    { freq: 880, dur: 1.5 },
    { freq: 0, dur: 0.5 },
    { freq: 784, dur: 1 },
    { freq: 698, dur: 0.5 },
    { freq: 587, dur: 0.5 },
    { freq: 523, dur: 2 },
  ],

  duration: 200,
  volume: 0.11,
  wave: 'sine',
  gate: 1,
};

export default FrozenPeaks;
