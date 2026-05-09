/**
 * ## 背景音乐：
 *
 * SpringFestival - 春节序曲（主题段落）
 */
const SpringFestival = {
  name: 'Spring Festival',
  melody: [
    // ===== 第一句：秧歌调 =====
    { freq: 523, dur: 0.6 }, // 啦 (C5)
    { freq: 587, dur: 0.3 }, // 啦 (D5)
    { freq: 659, dur: 0.9 }, // 啦～ (E5)
    { freq: 659, dur: 0.6 }, // 啦
    { freq: 784, dur: 0.3 }, // 啦
    { freq: 880, dur: 1.2 }, // 啦～ (A5)

    { freq: 880, dur: 0.6 }, // 啦
    { freq: 784, dur: 0.3 }, // 啦
    { freq: 659, dur: 0.9 }, // 啦～
    { freq: 587, dur: 0.6 }, // 啦
    { freq: 523, dur: 1.5 }, // 啦～

    // ===== 第二句：欢腾段落 =====
    { freq: 659, dur: 0.3 },
    { freq: 659, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 880, dur: 0.3 },
    { freq: 880, dur: 0.3 },
    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 1.2 },

    { freq: 587, dur: 0.3 },
    { freq: 587, dur: 0.3 },
    { freq: 659, dur: 0.3 },
    { freq: 659, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 784, dur: 0.3 },
    { freq: 659, dur: 0.6 },
    { freq: 523, dur: 1.2 },

    // ===== 第三句：再现秧歌，更热烈 =====
    { freq: 523, dur: 0.4 },
    { freq: 587, dur: 0.2 },
    { freq: 659, dur: 0.6 },
    { freq: 659, dur: 0.4 },
    { freq: 784, dur: 0.2 },
    { freq: 880, dur: 0.8 },

    { freq: 1047, dur: 0.4 }, // 拔高 (C6)
    { freq: 880, dur: 0.2 },
    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 523, dur: 2 }, // 收束

    // ===== 第四句：锣鼓模仿 =====
    { freq: 659, dur: 0.2 },
    { freq: 659, dur: 0.2 },
    { freq: 0, dur: 0.1 },
    { freq: 659, dur: 0.2 },
    { freq: 0, dur: 0.1 },
    { freq: 784, dur: 0.2 },
    { freq: 784, dur: 0.2 },
    { freq: 0, dur: 0.1 },
    { freq: 784, dur: 0.2 },
    { freq: 0, dur: 0.1 },
    { freq: 659, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 523, dur: 0.8 },

    { freq: 0, dur: 1 }, // 段落呼吸
  ],
  duration: 280, // 较快节奏
  volume: 0.08,
  wave: 'square', // 方波更能模拟唢呐/秧歌的热闹感
  gate: 0.7, // 轻断奏，颗粒分明
  articulation: {
    attackTime: 0.003,
    releaseTime: 0.02,
    sustainRatio: 0.5, // 较低延音比，音符跳跃
  },
};

export default SpringFestival;
