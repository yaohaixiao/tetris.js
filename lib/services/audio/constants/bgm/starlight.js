/**
 * ============================================================
 *
 * # 背景音乐：Starlight
 *
 * ============================================================
 *
 * 星空氛围，正弦波长音 + 高音区闪烁感。 三角波营造温暖、广袤的太空感。
 *
 * @constant {object} Starlight
 */
const Starlight = {
  /** 音乐名称 */
  name: 'Starlight',

  /**
   * 旋律数据。
   *
   * 每个音符包含 freq（频率 Hz）和 dur（时长系数）。
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // 引子（深空低吟）
    { freq: 330, dur: 2 },
    { freq: 0, dur: 1 },
    { freq: 440, dur: 3 },
    { freq: 0, dur: 1 },
    { freq: 392, dur: 2 },
    { freq: 330, dur: 2 },

    // 星星闪烁
    { freq: 523, dur: 0.5 },
    { freq: 0, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 0, dur: 0.5 },
    { freq: 784, dur: 1 },
    { freq: 659, dur: 0.5 },
    { freq: 523, dur: 0.5 },
    { freq: 440, dur: 1 },
    { freq: 0, dur: 0.5 },
    { freq: 587, dur: 0.5 },
    { freq: 698, dur: 0.5 },
    { freq: 784, dur: 0.5 },
    { freq: 880, dur: 1.5 },

    // 星座巡游
    { freq: 784, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 988, dur: 1 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.5 },
    { freq: 698, dur: 1 },
    { freq: 587, dur: 0.5 },
    { freq: 523, dur: 0.5 },
    { freq: 440, dur: 1.5 },
    { freq: 0, dur: 0.5 },

    // 银河漩涡
    { freq: 659, dur: 0.25 },
    { freq: 698, dur: 0.25 },
    { freq: 784, dur: 0.25 },
    { freq: 880, dur: 0.25 },
    { freq: 988, dur: 0.25 },
    { freq: 1109, dur: 0.25 },
    { freq: 1175, dur: 0.25 },
    { freq: 1319, dur: 0.25 },
    { freq: 1175, dur: 0.5 },
    { freq: 988, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 1 },
    { freq: 0, dur: 0.5 },

    // 归航
    { freq: 698, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 587, dur: 0.5 },
    { freq: 523, dur: 1 },
    { freq: 440, dur: 0.5 },
    { freq: 392, dur: 0.5 },
    { freq: 330, dur: 1.5 },
    { freq: 0, dur: 0.5 },
    { freq: 440, dur: 1 },
    { freq: 523, dur: 1 },
    { freq: 440, dur: 1.5 },

    // 循环点（重回深空）
    { freq: 330, dur: 2 },
    { freq: 0, dur: 1 },
    { freq: 392, dur: 1.5 },
    { freq: 330, dur: 1 },
    { freq: 0, dur: 0.5 },
    { freq: 330, dur: 2 },
  ],

  /** 每个音符的基准时长（ms） */
  duration: 180,

  /** 音量（0-1） */
  volume: 0.1,

  /** 波形类型：正弦波 */
  wave: 'sine',

  /** 连奏/断奏比例 */
  gate: 1,
};

export default Starlight;
