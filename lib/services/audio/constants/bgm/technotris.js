/**
 * ============================================================
 *
 * # 背景音乐：Technotris
 *
 * ============================================================
 *
 * BPS 版《俄罗斯方块》背景音乐， 以方波音色演奏，带有明显的电子舞曲风格和重复节奏感。
 *
 * ## 曲式结构
 *
 * | 段落         | 风格     | 说明                       |
 * | :----------- | :------- | :------------------------- |
 * | Intro        | 电子重复 | 短促音符重复，建立节奏基础 |
 * | 主旋律 A     | 经典旋律 | 稳定的 8 分音符推进        |
 * | 电子重复变体 | 音区上移 | 主题变奏，音高提升         |
 * | 上行推进     | 音阶爬升 | 逐步上行的音阶式旋律       |
 * | 高潮         | 最高音区 | 音域到达最高点             |
 * | Break        | 回落     | 音高下移，节奏放松         |
 * | Drop         | 密集打击 | 短促音符密集交替           |
 * | Ending       | 收束     | 音阶下行至最低音           |
 *
 * ## 音乐参数
 *
 * | 参数     | 值     | 说明                     |
 * | :------- | :----- | :----------------------- |
 * | duration | 180    | 每个音符的基准时长（ms） |
 * | volume   | 0.13   | 音量（0-1）              |
 * | wave     | square | 波形（方波，电子音色）   |
 *
 * @constant {object} Technotris
 */
const Technotris = {
  /** 音乐名称 */
  name: 'Technotris',

  /**
   * 旋律数据。
   *
   * 每个音符包含 freq（频率 Hz）和 dur（时长系数）。
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // Intro（电子重复）
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 494, dur: 0.6 },
    { freq: 494, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 494, dur: 0.6 },
    { freq: 494, dur: 0.6 },

    // 主旋律 A
    { freq: 659, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 440, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 1.2 },

    // 电子重复变体
    { freq: 523, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 784, dur: 0.6 },
    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 0.6 },

    // 上行推进
    { freq: 659, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 880, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 880, dur: 0.8 },
    { freq: 988, dur: 0.8 },
    { freq: 880, dur: 0.8 },
    { freq: 784, dur: 1.2 },

    // 高潮
    { freq: 784, dur: 0.8 },
    { freq: 880, dur: 0.8 },
    { freq: 988, dur: 0.8 },
    { freq: 1175, dur: 1.2 },
    { freq: 988, dur: 0.8 },
    { freq: 880, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 784, dur: 0.6 },
    { freq: 784, dur: 0.6 },
    { freq: 880, dur: 0.6 },
    { freq: 880, dur: 0.6 },

    // Break
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },

    // Drop
    { freq: 784, dur: 0.6 },
    { freq: 784, dur: 0.6 },
    { freq: 880, dur: 0.6 },
    { freq: 880, dur: 0.6 },
    { freq: 988, dur: 0.6 },
    { freq: 988, dur: 0.6 },
    { freq: 880, dur: 0.6 },
    { freq: 880, dur: 0.6 },
    { freq: 784, dur: 0.6 },
    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 523, dur: 0.6 },

    // Ending
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 440, dur: 1.6 },
  ],

  /** 每个音符的基准时长（ms） */
  duration: 180,

  /** 音量（0-1） */
  volume: 0.13,

  /** 波形类型：方波（电子音色） */
  wave: 'square',
};

export default Technotris;
