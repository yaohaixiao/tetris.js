/**
 * ============================================================
 *
 * # 背景音乐：Korobeiniki（货郎）
 *
 * ============================================================
 *
 * GB 版《俄罗斯方块》最经典、最广为人知的背景音乐， 改编自俄罗斯民谣《货郎》（Korobeiniki）。
 * 以方波音色演奏，节奏明快，是俄罗斯方块的标志性旋律。
 *
 * ## 曲式结构
 *
 * | 段落  | 风格      | 说明                  |
 * | :---- | :-------- | :-------------------- |
 * | A 段  | 经典开头  | 标志性旋律，节奏稳健  |
 * | A' 段 | 变体      | 音区上移，稍作变化    |
 * | B 段  | 推进      | 音域扩大，情绪推进    |
 * | C 段  | 高潮      | 最高音区，气势最强    |
 * | D 段  | 变化      | 节奏加密，变化再现    |
 * | E 段  | 回落      | 音高下移，趋于平稳    |
 * | F 段  | 再现+收束 | 主题再现，渐慢收尾    |
 * | 结尾  | 循环点    | 衔接回 A 段，循环播放 |
 *
 * ## 音乐参数
 *
 * | 参数     | 值     | 说明                          |
 * | :------- | :----- | :---------------------------- |
 * | duration | 140    | 每个音符的基准时长（ms）      |
 * | volume   | 0.12   | 音量（0-1）                   |
 * | wave     | square | 波形（方波，经典 8-bit 音色） |
 *
 * @constant {object} Korobeiniki
 */
const Korobeiniki = {
  /** 音乐名称 */
  name: 'Korobeiniki',

  /**
   * 旋律数据。
   *
   * 每个音符包含 freq（频率 Hz）和 dur（时长系数）。
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // A 段（经典开头）
    { freq: 659, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 440, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },
    { freq: 659, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 1.2 },

    // A' 段（变体）
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 784, dur: 1.2 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 1.2 },

    // B 段（推进）
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 784, dur: 1.2 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 784, dur: 1.2 },
    { freq: 880, dur: 1.2 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 1.2 },

    // C 段（高潮）
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 784, dur: 1.2 },
    { freq: 880, dur: 1.2 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 1.2 },

    // D 段（变化）
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 784, dur: 1.2 },
    { freq: 880, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },
    { freq: 659, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 1.2 },

    // E 段（回落）
    { freq: 440, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 1.2 },
    { freq: 587, dur: 1.2 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 440, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },
    { freq: 659, dur: 1.2 },

    // F 段（再现+收束）
    { freq: 659, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 880, dur: 1.2 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 1.2 },

    // 结尾（循环点）
    { freq: 523, dur: 1.2 },
    { freq: 494, dur: 0.8 },
    { freq: 440, dur: 1.6 },
  ],

  /** 每个音符的基准时长（ms） */
  duration: 140,

  /** 音量（0-1） */
  volume: 0.12,

  /** 波形类型：方波（经典 8-bit 音色） */
  wave: 'square',
};

export default Korobeiniki;
