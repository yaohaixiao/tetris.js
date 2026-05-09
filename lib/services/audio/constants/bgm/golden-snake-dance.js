/**
 * ## 背景音乐：
 *
 * GoldenSnakeDance - 金蛇狂舞（主题段落）
 */
const GoldenSnakeDance = {
  name: 'Golden Snake Dance',
  melody: [
    // ===== 核心主题：赛龙舟 =====
    { freq: 659, dur: 0.3 }, // 啦 (E5)
    { freq: 587, dur: 0.3 }, // 啦 (D5)
    { freq: 523, dur: 0.3 }, // 啦 (C5)
    { freq: 587, dur: 0.3 }, // 啦
    { freq: 659, dur: 0.6 }, // 啦～
    { freq: 659, dur: 0.3 },
    { freq: 659, dur: 0.3 },
    { freq: 659, dur: 0.6 },

    { freq: 587, dur: 0.3 },
    { freq: 523, dur: 0.3 },
    { freq: 440, dur: 0.3 }, // 啦 (A4)
    { freq: 523, dur: 0.3 },
    { freq: 587, dur: 0.6 },
    { freq: 587, dur: 0.3 },
    { freq: 587, dur: 0.3 },
    { freq: 587, dur: 0.6 },

    // ===== 对答段落：锣鼓模仿 =====
    { freq: 784, dur: 0.2 }, // 锵 (G5)
    { freq: 784, dur: 0.2 }, // 锵
    { freq: 784, dur: 0.2 }, // 锵
    { freq: 659, dur: 0.4 }, // 咚
    { freq: 659, dur: 0.2 }, // 咚
    { freq: 659, dur: 0.2 }, // 咚

    { freq: 784, dur: 0.2 }, // 锵
    { freq: 880, dur: 0.2 }, // 锵 (A5)
    { freq: 784, dur: 0.2 }, // 锵
    { freq: 659, dur: 0.4 }, // 咚
    { freq: 659, dur: 0.2 }, // 咚
    { freq: 659, dur: 0.2 }, // 咚

    { freq: 880, dur: 0.2 }, // 锵
    { freq: 784, dur: 0.2 }, // 锵
    { freq: 659, dur: 0.2 }, // 锵
    { freq: 587, dur: 0.4 }, // 咚
    { freq: 587, dur: 0.2 }, // 咚
    { freq: 587, dur: 0.2 }, // 咚

    { freq: 784, dur: 0.2 },
    { freq: 659, dur: 0.2 },
    { freq: 587, dur: 0.2 },
    { freq: 523, dur: 0.6 }, // 咚～
    { freq: 523, dur: 0.3 },
    { freq: 523, dur: 0.3 },

    // ===== 主题再现，上行递进 =====
    { freq: 659, dur: 0.3 },
    { freq: 784, dur: 0.3 }, // 拔高
    { freq: 880, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 1047, dur: 0.6 }, // 更高 (C6)
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

    // ===== 热烈对答，加速感 =====
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

    // ===== 收束 =====
    { freq: 659, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 880, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.3 },
    { freq: 523, dur: 1.5 },

    { freq: 0, dur: 1 },
  ],
  duration: 200, // 快节奏
  volume: 0.08,
  wave: 'square',
  gate: 0.6, // 明显断奏，模仿弹拨乐颗粒感
  articulation: {
    attackTime: 0.002,
    releaseTime: 0.015,
    sustainRatio: 0.4, // 低延音，音符跳跃
  },
};

export default GoldenSnakeDance;
