/**
 * # 背景音乐：FirstDivision
 *
 * FC 版《俄罗斯方块》经典背景音乐（Troika 风格）， 以方波音色演奏，带有明显的进行曲节奏感。
 *
 * ## 曲式结构
 *
 * | 段落     | 风格     | 说明                   |
 * | -------- | -------- | ---------------------- |
 * | 主动机   | 进行曲感 | 经典开场旋律，节奏稳健 |
 * | 重复推进 | 上行     | 音高上移，推进情绪     |
 * | 第二句   | 上行     | 继续上行走势           |
 * | 强化段   | 军乐推进 | 音域扩大，力度增强     |
 * | 高潮     | 稳定推进 | 最高音区，气势最强     |
 * | 回落     | 收束     | 音高下移，趋于平静     |
 * | 循环点   | 过渡     | 衔接回开头，循环播放   |
 *
 * ## 音乐参数
 *
 * | 参数     | 值     | 说明                          |
 * | -------- | ------ | ----------------------------- |
 * | duration | 180    | 每个音符的基准时长（ms）      |
 * | volume   | 0.08   | 音量（0-1）                   |
 * | wave     | square | 波形（方波，经典 8-bit 音色） |
 *
 * @constant {object} FirstDivision
 */
const FirstDivision = {
  /** ## 音乐名称 */
  name: 'FirstDivision',

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
    // ===== 主动机（进行曲感）=====
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },

    // ===== 重复推进 =====
    { freq: 659, dur: 0.8 },
    { freq: 698, dur: 0.8 },
    { freq: 784, dur: 1.2 },
    { freq: 698, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },

    // ===== 第二句（上行）=====
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 698, dur: 0.8 },
    { freq: 784, dur: 1.2 },
    { freq: 698, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 1.2 },

    // ===== 强化段（军乐推进）=====
    { freq: 659, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 880, dur: 1.2 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 698, dur: 0.8 },
    { freq: 784, dur: 1.2 },

    // ===== 高潮（稳定推进）=====
    { freq: 784, dur: 0.8 },
    { freq: 880, dur: 0.8 },
    { freq: 988, dur: 1.2 },
    { freq: 880, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 698, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },

    // ===== 回落（收束）=====
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 1.2 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 1.2 },

    // ===== 循环点 =====
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 1.6 },
  ],

  /** ## 每个音符的基准时长（ms） */
  duration: 180,

  /** ## 音量（0-1） */
  volume: 0.08,

  /** ## 波形类型：方波（经典 8-bit 音色） */
  wave: 'square',
};

export default FirstDivision;
