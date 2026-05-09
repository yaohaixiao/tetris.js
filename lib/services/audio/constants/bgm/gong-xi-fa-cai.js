/**
 * ## 背景音乐：
 *
 * GongXiFaCai - 恭喜发财
 */
const GongXiFaCai = {
  name: 'Gong Xi Fa Cai',
  melody: [
    // ===== 恭喜发财 恭喜发财 =====
    { freq: 523, dur: 0.5 }, // 恭 (C5)
    { freq: 587, dur: 0.5 }, // 喜 (D5)
    { freq: 659, dur: 0.8 }, // 发 (E5)
    { freq: 659, dur: 0.8 }, // 财～
    { freq: 784, dur: 0.5 }, // 恭
    { freq: 880, dur: 0.5 }, // 喜
    { freq: 784, dur: 0.8 }, // 发
    { freq: 659, dur: 1.5 }, // 财～

    { freq: 587, dur: 0.5 }, // 恭
    { freq: 659, dur: 0.5 }, // 喜
    { freq: 784, dur: 0.8 }, // 发
    { freq: 784, dur: 0.8 }, // 财～
    { freq: 880, dur: 0.5 }, // 恭
    { freq: 1047, dur: 0.5 }, // 喜 (C6)
    { freq: 880, dur: 0.8 }, // 发
    { freq: 784, dur: 1.5 }, // 财～

    // ===== 我恭喜你发财 我恭喜你精彩 =====
    { freq: 659, dur: 0.3 }, // 我
    { freq: 784, dur: 0.3 }, // 恭
    { freq: 880, dur: 0.5 }, // 喜
    { freq: 880, dur: 0.3 }, // 你
    { freq: 784, dur: 0.3 }, // 发
    { freq: 659, dur: 1.0 }, // 财～

    { freq: 587, dur: 0.3 }, // 我
    { freq: 659, dur: 0.3 }, // 恭
    { freq: 784, dur: 0.5 }, // 喜
    { freq: 784, dur: 0.3 }, // 你
    { freq: 659, dur: 0.3 }, // 精
    { freq: 587, dur: 1.0 }, // 彩～

    // ===== 最好的请过来 不好的请走开 =====
    { freq: 523, dur: 0.4 }, // 最
    { freq: 587, dur: 0.4 }, // 好
    { freq: 659, dur: 0.4 }, // 的
    { freq: 784, dur: 0.4 }, // 请
    { freq: 880, dur: 0.4 }, // 过
    { freq: 784, dur: 0.8 }, // 来～

    { freq: 659, dur: 0.4 }, // 不
    { freq: 587, dur: 0.4 }, // 好
    { freq: 659, dur: 0.4 }, // 的
    { freq: 784, dur: 0.4 }, // 请
    { freq: 659, dur: 0.4 }, // 走
    { freq: 523, dur: 1.2 }, // 开～

    // ===== 礼多人不怪 =====
    { freq: 587, dur: 0.4 }, // 礼
    { freq: 659, dur: 0.4 }, // 多
    { freq: 784, dur: 0.4 }, // 人
    { freq: 659, dur: 0.4 }, // 不
    { freq: 587, dur: 0.8 }, // 怪～
    { freq: 523, dur: 1.5 }, // （收）

    // ===== 间奏过渡 =====
    { freq: 0, dur: 0.8 },

    // ===== 恭喜发财 循环再现 =====
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

    // ===== 收尾高音 =====
    { freq: 880, dur: 0.5 },
    { freq: 1047, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.5 },
    { freq: 659, dur: 2.0 },

    { freq: 0, dur: 1.5 }, // 段落呼吸
  ],
  duration: 260,
  volume: 0.08,
  wave: 'square',
  gate: 0.8,
  articulation: {
    attackTime: 0.003,
    releaseTime: 0.02,
    sustainRatio: 0.6,
  },
};

export default GongXiFaCai;
