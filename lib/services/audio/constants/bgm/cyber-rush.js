/**
 * ============================================================
 *
 * # 背景音乐：CyberRush
 *
 * ============================================================
 *
 * 赛博朋克高速节奏，锯齿波 + 短促断奏，营造紧张追逐感。 接近极限速度的关卡段，让玩家肾上腺素飙升。
 *
 * @constant {object} CyberRush
 */
const CyberRush = {
  /** 音乐名称 */
  name: 'CyberRush',

  /**
   * 旋律数据。
   *
   * 每个音符包含 freq（频率 Hz）和 dur（时长系数）。
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // 警报引子
    { freq: 440, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 587, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 587, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 659, dur: 0.5 },
    { freq: 0, dur: 0.5 },

    // 主动机（高速脉冲）
    { freq: 330, dur: 0.25 },
    { freq: 370, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 370, dur: 0.25 },
    { freq: 330, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 554, dur: 0.5 },
    { freq: 0, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 370, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 554, dur: 0.25 },
    { freq: 659, dur: 0.5 },

    // 加速段
    { freq: 440, dur: 0.125 },
    { freq: 494, dur: 0.125 },
    { freq: 554, dur: 0.125 },
    { freq: 587, dur: 0.125 },
    { freq: 659, dur: 0.25 },
    { freq: 587, dur: 0.25 },
    { freq: 554, dur: 0.125 },
    { freq: 494, dur: 0.125 },
    { freq: 440, dur: 0.125 },
    { freq: 554, dur: 0.125 },
    { freq: 659, dur: 0.25 },
    { freq: 740, dur: 0.25 },
    { freq: 659, dur: 0.25 },
    { freq: 554, dur: 0.25 },

    // 间奏（故障效果）
    { freq: 220, dur: 0.125 },
    { freq: 0, dur: 0.125 },
    { freq: 330, dur: 0.125 },
    { freq: 0, dur: 0.125 },
    { freq: 220, dur: 0.125 },
    { freq: 330, dur: 0.125 },
    { freq: 0, dur: 0.125 },
    { freq: 440, dur: 0.125 },
    { freq: 0, dur: 0.125 },
    { freq: 330, dur: 0.125 },
    { freq: 0, dur: 0.125 },
    { freq: 440, dur: 0.125 },
    { freq: 554, dur: 0.25 },
    { freq: 659, dur: 0.5 },

    // 冲刺高潮
    { freq: 659, dur: 0.25 },
    { freq: 740, dur: 0.25 },
    { freq: 784, dur: 0.25 },
    { freq: 880, dur: 0.25 },
    { freq: 988, dur: 0.5 },
    { freq: 880, dur: 0.25 },
    { freq: 784, dur: 0.25 },
    { freq: 740, dur: 0.25 },
    { freq: 659, dur: 0.25 },
    { freq: 784, dur: 0.25 },
    { freq: 880, dur: 0.25 },
    { freq: 988, dur: 0.5 },
    { freq: 1175, dur: 0.5 },
    { freq: 988, dur: 0.25 },
    { freq: 880, dur: 0.25 },

    // 回落
    { freq: 740, dur: 0.25 },
    { freq: 659, dur: 0.25 },
    { freq: 554, dur: 0.25 },
    { freq: 440, dur: 0.5 },
    { freq: 0, dur: 0.25 },
    { freq: 554, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 370, dur: 0.25 },
    { freq: 330, dur: 0.5 },

    // 循环衔接
    { freq: 330, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 587, dur: 0.5 },
    { freq: 0, dur: 0.5 },
    { freq: 440, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 0, dur: 0.25 },
    { freq: 659, dur: 0.5 },
    { freq: 0, dur: 1 },
  ],

  /** 每个音符的基准时长（ms） */
  duration: 120,

  /** 音量（0-1） */
  volume: 0.1,

  /** 波形类型：锯齿波 */
  wave: 'sawtooth',

  /** 连奏/断奏比例 */
  gate: 0.6,
};

export default CyberRush;
