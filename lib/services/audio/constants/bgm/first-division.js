/**
 * ## 背景音乐：
 *
 * FirstDivision - FC 版《俄罗斯方块》背景音乐
 */
const FirstDivision = {
  name: 'FirstDivision',
  melody: [
    // === 主动机（进行曲感）===
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },

    // === 重复推进 ===
    { freq: 659, dur: 0.8 },
    { freq: 698, dur: 0.8 },
    { freq: 784, dur: 1.2 },
    { freq: 698, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },

    // === 第二句（上行）===
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

    // === 强化段（军乐推进）===
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

    // === 高潮（稳定推进）===
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

    // === 回落（收束）===
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 1.2 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.8 },
    { freq: 659, dur: 1.2 },
    { freq: 587, dur: 0.8 },
    { freq: 523, dur: 1.2 },

    // === 循环点 ===
    { freq: 494, dur: 0.8 },
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 1.2 },
    { freq: 523, dur: 0.8 },
    { freq: 494, dur: 1.6 },
  ],
  duration: 180,
  volume: 0.08,
  wave: 'square',
};

export default FirstDivision;
