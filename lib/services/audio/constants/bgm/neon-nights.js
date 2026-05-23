// lib/services/audio/constants/musics/neon-nights.js

/**
 * # 背景音乐：NeonNights
 *
 * 合成波风格（Synthwave），80 年代霓虹灯下的电子节奏。 三角波音色，带断奏感。
 *
 * @constant {object} NeonNights
 */
const NeonNights = {
  name: 'NeonNights',

  melody: [
    // ===== 引子（低音铺垫）=====
    { freq: 220, dur: 1 },
    { freq: 277, dur: 1 },
    { freq: 330, dur: 1 },
    { freq: 277, dur: 0.5 },
    { freq: 220, dur: 0.5 },
    { freq: 330, dur: 1 },
    { freq: 370, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 277, dur: 0.5 },
    { freq: 220, dur: 0.5 },

    // ===== 主动机（霓虹闪烁）=====
    { freq: 440, dur: 0.5 },
    { freq: 554, dur: 0.5 },
    { freq: 659, dur: 1 },
    { freq: 554, dur: 0.5 },
    { freq: 440, dur: 0.5 },
    { freq: 370, dur: 0.5 },
    { freq: 440, dur: 0.5 },
    { freq: 554, dur: 0.5 },
    { freq: 659, dur: 1 },
    { freq: 0, dur: 0.25 },
    { freq: 659, dur: 0.25 },
    { freq: 740, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 554, dur: 0.5 },
    { freq: 440, dur: 0.5 },

    // ===== 上行推进 =====
    { freq: 554, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 740, dur: 0.5 },
    { freq: 831, dur: 0.5 },
    { freq: 880, dur: 1 },
    { freq: 831, dur: 0.5 },
    { freq: 740, dur: 0.5 },
    { freq: 659, dur: 0.5 },
    { freq: 554, dur: 0.5 },
    { freq: 440, dur: 0.5 },
    { freq: 554, dur: 0.5 },
    { freq: 659, dur: 1 },

    // ===== 间奏（律动切分）=====
    { freq: 330, dur: 0.5 },
    { freq: 0, dur: 0.25 },
    { freq: 330, dur: 0.25 },
    { freq: 370, dur: 0.5 },
    { freq: 0, dur: 0.25 },
    { freq: 370, dur: 0.25 },
    { freq: 440, dur: 0.5 },
    { freq: 0, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 370, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 277, dur: 0.5 },
    { freq: 330, dur: 1 },

    // ===== 高潮（全开合成器）=====
    { freq: 440, dur: 0.25 },
    { freq: 554, dur: 0.25 },
    { freq: 659, dur: 0.25 },
    { freq: 740, dur: 0.25 },
    { freq: 880, dur: 0.5 },
    { freq: 988, dur: 0.5 },
    { freq: 880, dur: 0.5 },
    { freq: 740, dur: 0.25 },
    { freq: 659, dur: 0.25 },
    { freq: 554, dur: 0.25 },
    { freq: 440, dur: 0.25 },
    { freq: 659, dur: 0.5 },
    { freq: 554, dur: 0.5 },
    { freq: 440, dur: 0.5 },
    { freq: 370, dur: 0.5 },
    { freq: 440, dur: 1 },

    // ===== 回落 =====
    { freq: 370, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 277, dur: 0.5 },
    { freq: 220, dur: 1 },
    { freq: 277, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 277, dur: 0.5 },
    { freq: 220, dur: 1 },
    { freq: 0, dur: 0.5 },

    // ===== 循环衔接 =====
    { freq: 220, dur: 0.5 },
    { freq: 277, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 370, dur: 0.5 },
    { freq: 440, dur: 1 },
    { freq: 370, dur: 0.5 },
    { freq: 330, dur: 0.5 },
    { freq: 277, dur: 0.5 },
    { freq: 220, dur: 1.5 },
  ],

  duration: 160,
  volume: 0.12,
  wave: 'triangle',
  gate: 0.85,
};

export default NeonNights;
