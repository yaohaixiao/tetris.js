/**
 * ============================================================
 *
 * # 背景音乐：GoldenSnakeDance（金蛇狂舞）
 *
 * ============================================================
 *
 * 改编自中国经典民乐《金蛇狂舞》的主题段落，以方波音色配合明显断奏， 模仿弹拨乐的颗粒感， 营造赛龙舟般的热烈节日氛围。
 *
 * ## 曲式结构
 *
 * | 段落     | 风格     | 说明                     |
 * | :------- | :------- | :----------------------- |
 * | 核心主题 | 赛龙舟   | 经典旋律，短促活泼       |
 * | 对答段落 | 锣鼓模仿 | 高低音交替，模仿锣鼓对话 |
 * | 主题再现 | 上行递进 | 音区拔高，情绪升温       |
 * | 热烈对答 | 加速感   | 音符更短，节奏更紧       |
 * | 收束     | 回落     | 音高下移，渐慢收尾       |
 *
 * ## 音乐参数
 *
 * | 参数     | 值     | 说明                             |
 * | :------- | :----- | :------------------------------- |
 * | duration | 200    | 每个音符的基准时长（ms），快节奏 |
 * | volume   | 0.12   | 音量（0-1）                      |
 * | wave     | square | 波形（方波，模拟唢呐/弹拨乐）    |
 * | gate     | 0.6    | 连奏/断奏比例，明显断奏          |
 *
 * ## 运音包络
 *
 * | 参数         | 值    | 说明                       |
 * | :----------- | :---- | :------------------------- |
 * | attackTime   | 0.002 | 起音时间（2ms，快速起音）  |
 * | releaseTime  | 0.015 | 释音时间（15ms，快速收尾） |
 * | sustainRatio | 0.4   | 延音比（低，音符跳跃感强） |
 *
 * @constant {object} GoldenSnakeDance
 */
const GoldenSnakeDance = {
  /** 音乐名称 */
  name: 'Golden Snake Dance',

  /**
   * 旋律数据。
   *
   * 每个音符包含 freq（频率 Hz）和 dur（时长系数）。 freq=0 表示休止符。
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // 核心主题：赛龙舟
    { freq: 659, dur: 0.3 },
    { freq: 587, dur: 0.3 },
    { freq: 523, dur: 0.3 },
    { freq: 587, dur: 0.3 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.3 },
    { freq: 659, dur: 0.3 },
    { freq: 659, dur: 0.6 },

    { freq: 587, dur: 0.3 },
    { freq: 523, dur: 0.3 },
    { freq: 440, dur: 0.3 },
    { freq: 523, dur: 0.3 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 0.3 },
    { freq: 587, dur: 0.3 },
    { freq: 587, dur: 0.6 },

    // 对答段落：锣鼓模仿
    { freq: 784, dur: 0.2 },
    { freq: 784, dur: 0.2 },
    { freq: 784, dur: 0.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.2 },
    { freq: 659, dur: 0.2 },

    { freq: 784, dur: 0.2 },
    { freq: 880, dur: 0.2 },
    { freq: 784, dur: 0.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.2 },
    { freq: 659, dur: 0.2 },

    { freq: 880, dur: 0.2 },
    { freq: 784, dur: 0.2 },
    { freq: 659, dur: 0.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.2 },
    { freq: 587, dur: 0.2 },

    { freq: 784, dur: 0.2 },
    { freq: 659, dur: 0.2 },
    { freq: 587, dur: 0.2 },
    { freq: 523, dur: 0.6 },
    { freq: 523, dur: 0.3 },
    { freq: 523, dur: 0.3 },

    // 主题再现，上行递进
    { freq: 659, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 880, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 1047, dur: 0.6 },
    { freq: 1047, dur: 0.3 },
    { freq: 1047, dur: 0.3 },
    { freq: 1047, dur: 0.6 },

    { freq: 880, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 659, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 880, dur: 0.6 },
    { freq: 880, dur: 0.3 },
    { freq: 880, dur: 0.3 },
    { freq: 880, dur: 0.6 },

    // 热烈对答，加速感
    { freq: 784, dur: 0.15 },
    { freq: 880, dur: 0.15 },
    { freq: 784, dur: 0.15 },
    { freq: 659, dur: 0.15 },
    { freq: 587, dur: 0.15 },
    { freq: 659, dur: 0.15 },
    { freq: 784, dur: 0.4 },
    { freq: 659, dur: 0.4 },

    { freq: 784, dur: 0.15 },
    { freq: 880, dur: 0.15 },
    { freq: 784, dur: 0.15 },
    { freq: 1047, dur: 0.15 },
    { freq: 880, dur: 0.15 },
    { freq: 784, dur: 0.15 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.4 },

    // 收束
    { freq: 659, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 880, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.3 },
    { freq: 523, dur: 1.5 },

    { freq: 0, dur: 1 },
  ],

  /** 每个音符的基准时长（ms），较快节奏 */
  duration: 200,

  /** 音量（0-1） */
  volume: 0.12,

  /** 波形类型：方波（模拟唢呐/弹拨乐） */
  wave: 'square',

  /** 连奏/断奏比例（0.6，明显断奏） */
  gate: 0.6,

  /** 运音包络 */
  articulation: {
    /** 起音时间（2ms，快速起音） */
    attackTime: 0.002,
    /** 释音时间（15ms，快速收尾） */
    releaseTime: 0.015,
    /** 延音比（0.4，低延音使音符跳跃） */
    sustainRatio: 0.4,
  },
};

export default GoldenSnakeDance;
