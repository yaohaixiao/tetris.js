/**
 * ============================================================
 *
 * # 背景音乐：FrozenPeaks
 *
 * ============================================================
 *
 * 空灵冰峰风格，正弦波营造寒冷孤高的氛围。 长音为主，高音区泛音营造空间感。
 *
 * @constant {object} FrozenPeaks
 */
const FrozenPeaks = {
  /** 音乐名称 */
  name: 'FrozenPeaks',

  /**
   * 旋律数据。
   *
   * 每个音符包含 freq（频率 Hz）和 dur（时长系数）。
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // 引子（高远冰峰）
    { freq: 880, dur: 2 },
    { freq: 0, dur: 0.5 },
    { freq: 784, dur: 1.5 },
    { freq: 0, dur: 0.5 },
    { freq: 988, dur: 2 },
    { freq: 0, dur: 0.5 },
    { freq: 880, dur: 1 },
    { freq: 784, dur: 0.5 },
    { freq: 698, dur: 1 },

    // 主动机（雪花飘落）
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

    // 上行探索
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

    // 暴风雪（密集音符）
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

    // 平静（风雪渐歇）
    { freq: 784, dur: 1.5 },
    { freq: 0, dur: 0.5 },
    { freq: 698, dur: 1 },
    { freq: 659, dur: 1 },
    { freq: 587, dur: 1.5 },
    { freq: 523, dur: 1 },
    { freq: 587, dur: 0.5 },
    { freq: 659, dur: 1 },
    { freq: 0, dur: 0.5 },

    // 循环点（冰峰再现）
    { freq: 880, dur: 1.5 },
    { freq: 0, dur: 0.5 },
    { freq: 784, dur: 1 },
    { freq: 698, dur: 0.5 },
    { freq: 587, dur: 0.5 },
    { freq: 523, dur: 2 },
  ],

  /** 每个音符的基准时长（ms） */
  duration: 200,

  /** 音量（0-1） */
  volume: 0.11,

  /** 波形类型：正弦波 */
  wave: 'sine',

  /** 连奏/断奏比例 */
  gate: 1,
};

export default FrozenPeaks;
