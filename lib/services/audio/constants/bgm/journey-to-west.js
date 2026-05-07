/**
 * ## 背景音乐：
 *
 * JourneyToWest - 云宫迅音
 */
const JourneyToWest = {
  name: 'JourneyToWest',
  melody: [
    // === 前奏：标志性的"丢丢丢丢" ===
    { freq: 880, dur: 1.2 },
    { freq: 880, dur: 1.2 },
    { freq: 0, dur: 0.6 }, // 休止
    { freq: 880, dur: 1.2 },
    { freq: 880, dur: 1.2 },
    { freq: 0, dur: 0.6 },
    { freq: 880, dur: 1.2 },
    { freq: 880, dur: 1.2 },
    { freq: 0, dur: 0.6 },
    { freq: 880, dur: 1.2 },
    { freq: 880, dur: 2.4 },

    // === 主旋律（附点节奏 3-1-1） ===
    { freq: 440, dur: 3.6 },
    { freq: 440, dur: 0.9 },
    { freq: 440, dur: 2.7 },
    { freq: 523, dur: 3.6 },
    { freq: 587, dur: 3.6 },
    { freq: 587, dur: 0.9 },
    { freq: 587, dur: 2.7 },
    { freq: 659, dur: 4.5 },

    // === 冲上云霄 ===
    { freq: 880, dur: 3.6 },
    { freq: 880, dur: 0.9 },
    { freq: 880, dur: 2.7 },
    { freq: 784, dur: 3.6 },
    { freq: 659, dur: 3.6 },
    { freq: 659, dur: 0.9 },
    { freq: 659, dur: 2.7 },
    { freq: 659, dur: 4.5 },

    // === 转折 ===
    { freq: 587, dur: 3.6 },
    { freq: 587, dur: 0.9 },
    { freq: 587, dur: 2.7 },
    { freq: 523, dur: 3.6 },
    { freq: 440, dur: 3.6 },
    { freq: 440, dur: 0.9 },
    { freq: 440, dur: 2.7 },
    { freq: 440, dur: 4.5 },

    // === 燃段 ===
    { freq: 587, dur: 2.7 },
    { freq: 587, dur: 1.8 },
    { freq: 659, dur: 2.7 },
    { freq: 784, dur: 3.6 },
    { freq: 784, dur: 1.8 },
    { freq: 784, dur: 1.8 },
    { freq: 880, dur: 3.6 },
    { freq: 988, dur: 2.7 },
    { freq: 988, dur: 1.8 },
    { freq: 988, dur: 2.7 },
    { freq: 880, dur: 3.6 },
    { freq: 784, dur: 2.7 },
    { freq: 784, dur: 1.8 },
    { freq: 784, dur: 3.6 },

    // === 回响：超高音 ===
    { freq: 1175, dur: 1.4 },
    { freq: 1175, dur: 1.4 },
    { freq: 0, dur: 0.9 },
    { freq: 1175, dur: 1.4 },
    { freq: 1175, dur: 1.4 },
    { freq: 0, dur: 0.9 },
    { freq: 880, dur: 2.7 },
    { freq: 880, dur: 2.7 },

    // === 结尾 ===
    { freq: 440, dur: 3.6 },
    { freq: 440, dur: 1.8 },
    { freq: 440, dur: 3.6 },
    { freq: 440, dur: 1.8 },
    { freq: 440, dur: 5.4 },
  ],
  duration: 110,
  volume: 0.12,
  wave: 'square',
};

export default JourneyToWest;
