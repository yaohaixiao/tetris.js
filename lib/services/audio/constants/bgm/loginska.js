/**
 * ## 背景音乐：
 *
 * Loginska - 雅达利版《俄罗斯方块》背景音乐
 */
const Loginska = {
  name: 'Loginska',
  melody: [
    // === A段：沉稳推进 ===
    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 880, dur: 0.6 },
    { freq: 784, dur: 1.2 },
    { freq: 784, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.6 },

    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 880, dur: 0.6 },

    // === B段：上行高潮 ===
    { freq: 784, dur: 1.2 },
    { freq: 784, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 880, dur: 0.6 },
    { freq: 988, dur: 0.6 },
    { freq: 880, dur: 1.2 },
    { freq: 880, dur: 0.4 },
    { freq: 880, dur: 0.4 },
    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 0.6 },

    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 1.2 },
    { freq: 587, dur: 0.4 },
    { freq: 587, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 784, dur: 0.6 },

    // === C段：急促下行收束 ===
    { freq: 784, dur: 1.2 },
    { freq: 784, dur: 0.4 },
    { freq: 784, dur: 0.4 },
    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.6 },
    { freq: 659, dur: 1.2 },
    { freq: 659, dur: 0.4 },
    { freq: 659, dur: 0.4 },
    { freq: 523, dur: 0.6 },
    { freq: 494, dur: 0.6 },

    { freq: 440, dur: 1.2 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 0.6 },
    { freq: 440, dur: 1.2 },
    { freq: 440, dur: 0.4 },
    { freq: 440, dur: 0.4 },
  ],
  duration: 180,
  volume: 0.07,
  wave: 'square',
};

export default Loginska;
