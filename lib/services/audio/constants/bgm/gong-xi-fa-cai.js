/**
 * ============================================================
 *
 * # 背景音乐：GongXiFaCai（恭喜发财）
 *
 * ============================================================
 *
 * 改编自经典贺岁歌曲《恭喜发财》， 以方波音色配合适中连奏，营造喜庆热闹的节日氛围。
 *
 * ## 曲式结构
 *
 * | 段落 | 歌词             | 说明               |
 * | :--- | :--------------- | :----------------- |
 * | 主题 | 恭喜发财         | 经典旋律，中等节奏 |
 * | 发展 | 我恭喜你发财     | 节奏加快，音符更短 |
 * | 过渡 | 最好的请过来     | 音区上移，情绪推进 |
 * | 收束 | 礼多人不怪       | 音符拉长，趋于平稳 |
 * | 间奏 | -                | 短暂休止过渡       |
 * | 循环 | 恭喜发财（再现） | 主题再现，缩短处理 |
 * | 收尾 | 高音             | 高音区长音收束     |
 *
 * ## 音乐参数
 *
 * | 参数     | 值     | 说明                     |
 * | :------- | :----- | :----------------------- |
 * | duration | 260    | 每个音符的基准时长（ms） |
 * | volume   | 0.13   | 音量（0-1）              |
 * | wave     | square | 波形（方波）             |
 * | gate     | 0.8    | 连奏/断奏比例，较连奏    |
 *
 * ## 运音包络
 *
 * | 参数         | 值    | 说明             |
 * | :----------- | :---- | :--------------- |
 * | attackTime   | 0.003 | 起音时间（3ms）  |
 * | releaseTime  | 0.02  | 释音时间（20ms） |
 * | sustainRatio | 0.6   | 延音比（中高）   |
 *
 * @constant {object} GongXiFaCai
 */
const GongXiFaCai = {
  /** 音乐名称 */
  name: 'Gong Xi Fa Cai',

  /**
   * 旋律数据。
   *
   * 每个音符包含 freq（频率 Hz）和 dur（时长系数）。 freq=0 表示休止符。
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // 恭喜发财 恭喜发财
    { freq: 523, dur: 0.5 },
    { freq: 587, dur: 0.5 },
    { freq: 659, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 784, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.8 },
    { freq: 659, dur: 1.5 },

    { freq: 587, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 784, dur: 0.8 },
    { freq: 784, dur: 0.8 },
    { freq: 880, dur: 0.5 },
    { freq: 1047, dur: 0.5 },
    { freq: 880, dur: 0.8 },
    { freq: 784, dur: 1.5 },

    // 我恭喜你发财 我恭喜你精彩
    { freq: 659, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 880, dur: 0.5 },
    { freq: 880, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 659, dur: 1 },

    { freq: 587, dur: 0.3 },
    { freq: 659, dur: 0.3 },
    { freq: 784, dur: 0.5 },
    { freq: 784, dur: 0.3 },
    { freq: 659, dur: 0.3 },
    { freq: 587, dur: 1 },

    // 最好的请过来 不好的请走开
    { freq: 523, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 880, dur: 0.4 },
    { freq: 784, dur: 0.8 },

    { freq: 659, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 523, dur: 1.2 },

    // 礼多人不怪
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 1.5 },

    // 间奏过渡
    { freq: 0, dur: 0.8 },

    // 恭喜发财 循环再现
    { freq: 523, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.6 },
    { freq: 784, dur: 0.4 },
    { freq: 880, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 1.2 },

    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 784, dur: 0.6 },
    { freq: 880, dur: 0.4 },
    { freq: 1047, dur: 0.4 },
    { freq: 880, dur: 0.6 },
    { freq: 784, dur: 1.2 },

    // 收尾高音
    { freq: 880, dur: 0.5 },
    { freq: 1047, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.5 },
    { freq: 659, dur: 2 },

    { freq: 0, dur: 1.5 },
  ],

  /** 每个音符的基准时长（ms） */
  duration: 260,

  /** 音量（0-1） */
  volume: 0.13,

  /** 波形类型：方波 */
  wave: 'square',

  /** 连奏/断奏比例（0.8，较连奏） */
  gate: 0.8,

  /** 运音包络 */
  articulation: {
    /** 起音时间（3ms，快速起音） */
    attackTime: 0.003,
    /** 释音时间（20ms，平滑收尾） */
    releaseTime: 0.02,
    /** 延音比（0.6，中高延音） */
    sustainRatio: 0.6,
  },
};

export default GongXiFaCai;
