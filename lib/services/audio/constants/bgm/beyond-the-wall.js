/**
 * # 背景音乐：BeyondTheWall（边塞风）
 *
 * 一首以三角波为主音色、带有苍凉边塞风格的背景音乐。 融合了胡笳感脉冲、马蹄节奏、号角高潮和 DnB 破碎节奏等段落。
 *
 * ## 曲式结构
 *
 * | 段落     | 风格       | 说明                         |
 * | -------- | ---------- | ---------------------------- |
 * | 前奏     | 胡笳感脉冲 | 低音区重复音型，营造空旷感   |
 * | 主旋律   | 苍凉开场   | 长音为主，带有休止符的呼吸感 |
 * | 推进段   | 马蹄节奏   | 短促音符交替，模仿马蹄声     |
 * | 高潮     | 边塞号角   | 高音区长音，加入"断气点"     |
 * | DnB 段   | 破碎节奏   | 空拍 + 短音符，现代感        |
 * | 回落     | 大漠孤烟   | 拉长音符，留白增多           |
 * | 循环衔接 | 更"远"     | 与前奏呼应，音量更轻         |
 *
 * ## 音乐参数
 *
 * | 参数     | 值       | 说明                     |
 * | -------- | -------- | ------------------------ |
 * | duration | 130      | 每个音符的基准时长（ms） |
 * | volume   | 0.09     | 音量（0-1）              |
 * | wave     | triangle | 波形（三角波，音色柔和） |
 *
 * ## 分段 Gate 配置
 *
 * 可在 Engine 中按段落应用不同的 gate 值（连奏/断奏比例）， 实现不同段落的演奏风格变化。
 *
 * @constant {object} BeyondTheWall
 */
const BeyondTheWall = {
  /** ## 音乐名称 */
  name: 'BeyondTheWall',

  /**
   * ## 分段 Gate 配置（可选）
   *
   * 控制不同段落的连奏/断奏比例：
   *
   * - Gate 值越大越连奏，越小越断奏
   *
   * @type {object}
   */
  config: {
    gate: {
      intro: 0.92, // 前奏：较连奏
      main: 0.93, // 主旋律：很连奏
      drive: 0.96, // 推进段：最连奏
      dnb: 0.88, // DnB：较断奏
      outro: 0.91, // 回落：较连奏
    },
  },

  /**
   * ## 旋律数据
   *
   * 每个音符包含：
   *
   * - `freq`：频率（Hz），0 表示休止符
   * - `dur`：时长系数（乘以 duration 得到实际时长）
   *
   * @type {{ freq: number; dur: number }[]}
   */
  melody: [
    // ===== 前奏：胡笳感脉冲 =====
    { freq: 330, dur: 0.6 },
    { freq: 0, dur: 0.15 },

    { freq: 392, dur: 0.6 },
    { freq: 0, dur: 0.15 },

    { freq: 330, dur: 0.6 },
    { freq: 392, dur: 0.6 },

    { freq: 330, dur: 0.6 },
    { freq: 0, dur: 0.15 },

    { freq: 392, dur: 0.6 },
    { freq: 0, dur: 0.15 },

    { freq: 440, dur: 1.8 },
    { freq: 0, dur: 0.3 },

    // ===== 主旋律：苍凉开场 =====
    { freq: 440, dur: 1.2 },
    { freq: 523, dur: 0.6 },

    { freq: 587, dur: 1.2 },
    { freq: 0, dur: 0.2 },

    { freq: 523, dur: 0.6 },
    { freq: 440, dur: 1.2 },

    { freq: 392, dur: 0.6 },
    { freq: 330, dur: 1.2 },

    { freq: 392, dur: 1.2 },
    { freq: 0, dur: 0.25 },

    { freq: 440, dur: 1.2 },
    { freq: 523, dur: 0.6 },

    { freq: 659, dur: 1.8 },
    { freq: 0, dur: 0.2 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.2 },

    { freq: 440, dur: 0.6 },
    { freq: 392, dur: 1.2 },

    { freq: 330, dur: 1.2 },
    { freq: 0, dur: 0.3 },

    // ===== 推进段：马蹄 =====
    { freq: 392, dur: 0.6 },
    { freq: 440, dur: 0.3 },

    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.3 },

    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.3 },

    { freq: 523, dur: 0.6 },
    { freq: 440, dur: 0.3 },

    { freq: 392, dur: 0.6 },
    { freq: 440, dur: 0.3 },

    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.3 },

    { freq: 659, dur: 1.2 },
    { freq: 0, dur: 0.2 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.2 },

    // ===== 高潮：边塞号角 =====
    { freq: 659, dur: 1.2 },
    { freq: 784, dur: 0.6 },

    { freq: 880, dur: 1.8 },
    { freq: 0, dur: 0.25 },

    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 1.2 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.2 },

    { freq: 440, dur: 0.6 },
    { freq: 0, dur: 0.2 },

    { freq: 659, dur: 1.2 },
    { freq: 784, dur: 0.6 },

    { freq: 880, dur: 1.2 },
    { freq: 0, dur: 0.25 },

    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 1.2 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.8 },

    // ===== DnB 段：破碎节奏 + 空拍 =====
    { freq: 440, dur: 0.4 },
    { freq: 0, dur: 0.2 },

    { freq: 440, dur: 0.4 },
    { freq: 523, dur: 0.4 },

    { freq: 0, dur: 0.2 },
    { freq: 440, dur: 0.4 },

    { freq: 392, dur: 0.4 },
    { freq: 330, dur: 0.4 },

    { freq: 0, dur: 0.2 },
    { freq: 392, dur: 0.4 },

    { freq: 440, dur: 0.4 },
    { freq: 0, dur: 0.2 },

    { freq: 523, dur: 0.4 },
    { freq: 523, dur: 0.4 },

    { freq: 587, dur: 0.4 },
    { freq: 0, dur: 0.2 },

    { freq: 523, dur: 0.4 },
    { freq: 440, dur: 0.4 },

    { freq: 392, dur: 0.4 },
    { freq: 0, dur: 0.2 },

    { freq: 440, dur: 0.4 },
    { freq: 523, dur: 0.4 },

    // ===== 回落：大漠孤烟 =====
    { freq: 659, dur: 1.2 },
    { freq: 0, dur: 0.25 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.2 },

    { freq: 440, dur: 0.6 },
    { freq: 392, dur: 1.2 },

    { freq: 330, dur: 1.2 },
    { freq: 0, dur: 0.3 },

    { freq: 392, dur: 1.2 },
    { freq: 330, dur: 0.6 },

    { freq: 294, dur: 1.2 },
    { freq: 0, dur: 0.25 },

    { freq: 330, dur: 0.6 },
    { freq: 392, dur: 1.8 },

    // ===== 循环衔接（更"远"） =====
    { freq: 330, dur: 0.6 },
    { freq: 0, dur: 0.15 },

    { freq: 392, dur: 0.6 },
    { freq: 0, dur: 0.15 },

    { freq: 330, dur: 0.6 },
    { freq: 392, dur: 0.6 },

    { freq: 440, dur: 1.8 },
  ],

  /** ## 每个音符的基准时长（ms） */
  duration: 130,

  /** ## 音量（0-1） */
  volume: 0.09,

  /** ## 波形类型：三角波（音色柔和） */
  wave: 'triangle',
};

export default BeyondTheWall;
