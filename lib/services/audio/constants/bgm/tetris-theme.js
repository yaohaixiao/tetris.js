/**
 * # 背景音乐：TetrisTheme（货郎 - Game Boy 版）
 *
 * Game Boy 版《俄罗斯方块》最经典的背景音乐， 改编自俄罗斯民谣《货郎》（Korobeiniki），
 * 以方波音色配合经典的长-短-短节奏型，是电子游戏音乐史上的标志性旋律。
 *
 * ## 曲式结构
 *
 * | 段落  | 风格                 | 说明                   |
 * | ----- | -------------------- | ---------------------- |
 * | A 段  | 经典律动（长-短-短） | 标志性旋律，节奏稳健   |
 * | A' 段 | 高音区               | 主题移高演奏，情绪升温 |
 * | B 段  | 下行区               | 音阶下行，变化发展     |
 * | 结尾  | 收束                 | 主题再现，渐慢收尾     |
 *
 * ## 音乐参数
 *
 * | 参数     | 值     | 说明                          |
 * | -------- | ------ | ----------------------------- |
 * | duration | 220    | 每个音符的基准时长（ms）      |
 * | volume   | 0.08   | 音量（0-1）                   |
 * | wave     | square | 波形（方波，经典 8-bit 音色） |
 * | gate     | 0.6    | 连奏/断奏比例，明显断奏颗粒感 |
 *
 * @constant {object} TetrisTheme
 */
const TetrisTheme = {
  /** ## 音乐名称 */
  name: 'TetrisTheme',

  /**
   * ## 旋律数据
   *
   * 每个音符包含：
   *
   * - `freq`：频率（Hz）
   * - `dur`：时长系数（乘以 duration 得到实际时长）
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // ===== A 段：经典律动（长-短-短）=====
    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 494, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 494, dur: 0.6 },

    { freq: 440, dur: 1.2 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 0.6 },

    { freq: 494, dur: 1.2 },
    { freq: 494, dur: 0.4 },
    { freq: 494, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 1.2 },

    { freq: 523, dur: 1.2 },
    { freq: 523, dur: 0.4 },
    { freq: 523, dur: 0.4 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 1.2 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.4 },

    // ===== A' 段：高音区 =====
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 880, dur: 0.6 },
    { freq: 880, dur: 1.2 },
    { freq: 880, dur: 0.4 },
    { freq: 880, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 0.6 },

    { freq: 523, dur: 1.2 },
    { freq: 523, dur: 0.4 },
    { freq: 523, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 784, dur: 0.6 },
    { freq: 784, dur: 1.2 },
    { freq: 784, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.6 },

    { freq: 494, dur: 1.2 },
    { freq: 494, dur: 0.4 },
    { freq: 494, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 1.2 },

    { freq: 523, dur: 1.2 },
    { freq: 523, dur: 0.4 },
    { freq: 523, dur: 0.4 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 1.2 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.4 },

    // ===== B 段：下行区 =====
    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 494, dur: 0.6 },
    { freq: 494, dur: 0.6 },

    { freq: 523, dur: 1.2 },
    { freq: 523, dur: 0.4 },
    { freq: 523, dur: 0.4 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 0.6 },
    { freq: 415, dur: 1.2 },
    { freq: 415, dur: 0.4 },
    { freq: 415, dur: 0.4 },

    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 494, dur: 0.6 },
    { freq: 494, dur: 0.6 },

    { freq: 523, dur: 1.2 },
    { freq: 523, dur: 0.4 },
    { freq: 523, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 880, dur: 1.2 },
    { freq: 880, dur: 0.4 },
    { freq: 880, dur: 0.4 },

    // ===== 结尾收束 =====
    { freq: 784, dur: 1.2 },
    { freq: 784, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 523, dur: 1.2 },

    { freq: 494, dur: 1.2 },
    { freq: 494, dur: 0.4 },
    { freq: 494, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 1.2 },

    { freq: 523, dur: 1.2 },
    { freq: 523, dur: 0.4 },
    { freq: 523, dur: 0.4 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 1.2 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.4 },
  ],

  /** ## 每个音符的基准时长（ms） */
  duration: 220,

  /** ## 音量（0-1） */
  volume: 0.11,

  /** ## 波形类型：方波（经典 8-bit 音色） */
  wave: 'square',

  /** ## 连奏/断奏比例（0.6，明显断奏颗粒感） */
  gate: 0.6,
};

export default TetrisTheme;
