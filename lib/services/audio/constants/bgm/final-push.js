/**
 * # 背景音乐：FinalPush
 *
 * 最终冲刺，方波进行曲风格。 快速音符 + 大跳音程，营造"最后一战"的决绝感。 玩家距离 256 关循环只剩最后一段，气氛拉满。
 *
 * @constant {object} FinalPush
 */
const FinalPush = {
  name: 'FinalPush',

  melody: [
    // ===== 战鼓引子 =====
    { freq: 220, dur: 0.5 },
    { freq: 220, dur: 0.5 },
    { freq: 220, dur: 0.5 },
    { freq: 0, dur: 0.25 },
    { freq: 220, dur: 0.25 },
    { freq: 330, dur: 0.5 },
    { freq: 0, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 0, dur: 0.25 },
    { freq: 330, dur: 0.25 },
    { freq: 440, dur: 1 },

    // ===== 冲锋号角 =====
    { freq: 523, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 784, dur: 1 },
    { freq: 0, dur: 0.25 },
    { freq: 784, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 523, dur: 0.5 },
    { freq: 440, dur: 0.5 },
    { freq: 523, dur: 1 },
    { freq: 0, dur: 0.25 },
    { freq: 587, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 784, dur: 1 },

    // ===== 推进阵线 =====
    { freq: 784, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 988, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.25 },
    { freq: 880, dur: 0.25 },
    { freq: 988, dur: 0.5 },
    { freq: 1109, dur: 0.5 },
    { freq: 1175, dur: 1 },
    { freq: 0, dur: 0.25 },
    { freq: 988, dur: 0.25 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.5 },
    { freq: 659, dur: 1 },

    // ===== 间奏（重整旗鼓）=====
    { freq: 440, dur: 0.5 },
    { freq: 494, dur: 0.5 },
    { freq: 523, dur: 0.5 },
    { freq: 494, dur: 0.5 },
    { freq: 440, dur: 0.5 },
    { freq: 392, dur: 0.5 },
    { freq: 330, dur: 1 },
    { freq: 0, dur: 0.5 },
    { freq: 392, dur: 0.5 },
    { freq: 440, dur: 0.5 },
    { freq: 494, dur: 0.5 },
    { freq: 523, dur: 1 },

    // ===== 总攻高潮 =====
    { freq: 659, dur: 0.25 },
    { freq: 784, dur: 0.25 },
    { freq: 880, dur: 0.25 },
    { freq: 988, dur: 0.25 },
    { freq: 1175, dur: 0.5 },
    { freq: 1319, dur: 0.5 },
    { freq: 1175, dur: 0.25 },
    { freq: 988, dur: 0.25 },
    { freq: 880, dur: 0.25 },
    { freq: 784, dur: 0.25 },
    { freq: 880, dur: 0.5 },
    { freq: 988, dur: 0.5 },
    { freq: 1175, dur: 0.5 },
    { freq: 1319, dur: 1 },

    // ===== 胜利在望 =====
    { freq: 1175, dur: 0.5 },
    { freq: 988, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.5 },
    { freq: 659, dur: 1 },
    { freq: 784, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 523, dur: 1 },

    // ===== 循环（再度冲锋）=====
    { freq: 440, dur: 0.5 },
    { freq: 392, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 220, dur: 0.5 },
    { freq: 220, dur: 0.5 },
    { freq: 220, dur: 0.5 },
    { freq: 0, dur: 0.25 },
    { freq: 220, dur: 0.25 },
    { freq: 330, dur: 0.5 },
    { freq: 440, dur: 1.5 },
  ],

  duration: 140,
  volume: 0.11,
  wave: 'square',
  gate: 0.8,
};

export default FinalPush;
