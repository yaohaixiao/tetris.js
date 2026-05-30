/**
 * # 背景音乐：Ascension
 *
 * 飞升主题，三角波 + 正弦波混合，辉煌而温暖。 玩家即将突破 256 关见证循环彩蛋，气氛庄严而激动。 上行音阶 + 大调和弦分解，营造"升天"感。
 *
 * @constant {object} Ascension
 */
const Ascension = {
  name: 'Ascension',

  melody: [
    // ===== 序章（黎明）=====
    { freq: 262, dur: 3 },
    { freq: 330, dur: 2 },
    { freq: 392, dur: 3 },
    { freq: 330, dur: 1 },
    { freq: 392, dur: 1 },
    { freq: 523, dur: 4 },

    // ===== 升华（逐级上行）=====
    { freq: 523, dur: 1 },
    { freq: 587, dur: 1 },
    { freq: 659, dur: 2 },
    { freq: 587, dur: 1 },
    { freq: 523, dur: 1 },
    { freq: 659, dur: 1 },
    { freq: 784, dur: 2 },
    { freq: 659, dur: 1 },
    { freq: 587, dur: 1 },
    { freq: 523, dur: 2 },

    // ===== 天梯攀登 =====
    { freq: 784, dur: 1 },
    { freq: 880, dur: 1 },
    { freq: 988, dur: 2 },
    { freq: 880, dur: 1 },
    { freq: 784, dur: 1 },
    { freq: 988, dur: 1 },
    { freq: 1175, dur: 2 },
    { freq: 988, dur: 1 },
    { freq: 880, dur: 1 },
    { freq: 784, dur: 1 },
    { freq: 659, dur: 1 },
    { freq: 523, dur: 2 },

    // ===== 云层之上（高音区）=====
    { freq: 1175, dur: 0.5 },
    { freq: 1319, dur: 0.5 },
    { freq: 1568, dur: 1 },
    { freq: 1319, dur: 0.5 },
    { freq: 1175, dur: 0.5 },
    { freq: 988, dur: 1 },
    { freq: 1175, dur: 2 },
    { freq: 0, dur: 1 },
    { freq: 1568, dur: 0.5 },
    { freq: 1319, dur: 0.5 },
    { freq: 1175, dur: 1 },
    { freq: 988, dur: 1 },
    { freq: 880, dur: 2 },

    // ===== 循环之门 =====
    { freq: 784, dur: 1 },
    { freq: 880, dur: 0.5 },
    { freq: 988, dur: 0.5 },
    { freq: 1175, dur: 1 },
    { freq: 1319, dur: 0.5 },
    { freq: 1175, dur: 0.5 },
    { freq: 988, dur: 1 },
    { freq: 880, dur: 1 },
    { freq: 784, dur: 1 },
    { freq: 659, dur: 1 },
    { freq: 523, dur: 2 },

    // ===== 循环衔接（回到起点）=====
    { freq: 440, dur: 1 },
    { freq: 392, dur: 1 },
    { freq: 330, dur: 1 },
    { freq: 262, dur: 1 },
    { freq: 330, dur: 1 },
    { freq: 392, dur: 1 },
    { freq: 262, dur: 3 },
    { freq: 0, dur: 1 },
    { freq: 262, dur: 2 },
  ],

  duration: 200,
  volume: 0.11,
  wave: 'triangle',
  gate: 1,
};

export default Ascension;
