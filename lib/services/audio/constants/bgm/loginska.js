/**
 * ============================================================
 *
 * # 背景音乐：Loginska
 *
 * ============================================================
 *
 * 雅达利（Atari）版《俄罗斯方块》经典背景音乐， 以方波音色演奏，旋律沉稳而富有推进感。
 *
 * ## 曲式结构
 *
 * | 段落 | 风格         | 说明                   |
 * | :--- | :----------- | :--------------------- |
 * | A 段 | 沉稳推进     | 长音为主，节奏稳健     |
 * | B 段 | 上行高潮     | 音区逐步上移，情绪升温 |
 * | C 段 | 急促下行收束 | 音高快速下移，趋于收束 |
 *
 * ## 音乐参数
 *
 * | 参数     | 值     | 说明                          |
 * | :------- | :----- | :---------------------------- |
 * | duration | 180    | 每个音符的基准时长（ms）      |
 * | volume   | 0.11   | 音量（0-1），略低于其他曲目   |
 * | wave     | square | 波形（方波，经典 8-bit 音色） |
 *
 * @constant {object} Loginska
 */
const Loginska = {
  /** 音乐名称 */
  name: 'Loginska',

  /**
   * 旋律数据。
   *
   * 每个音符包含 freq（频率 Hz）和 dur（时长系数）。
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // A 段：沉稳推进
    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 880, dur: 0.6 },
    { freq: 784, dur: 1.2 },
    { freq: 784, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.6 },

    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 880, dur: 0.6 },

    // B 段：上行高潮
    { freq: 784, dur: 1.2 },
    { freq: 784, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 880, dur: 0.6 },
    { freq: 988, dur: 0.6 },
    { freq: 880, dur: 1.2 },
    { freq: 880, dur: 0.4 },
    { freq: 880, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 0.6 },

    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 784, dur: 0.6 },

    // C 段：急促下行收束
    { freq: 784, dur: 1.2 },
    { freq: 784, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 494, dur: 0.6 },

    { freq: 440, dur: 1.2 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 1.2 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.4 },
  ],

  /** 每个音符的基准时长（ms） */
  duration: 180,

  /** 音量（0-1），略低于其他曲目 */
  volume: 0.11,

  /** 波形类型：方波（经典 8-bit 音色） */
  wave: 'square',
};

export default Loginska;
