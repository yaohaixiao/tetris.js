import MOTIFS from '@/lib/audio/constants/motifs.js';
import playTone from '@/lib/audio/play-tone.js';

/**
 * # 获取当前消行对应的音乐动机类型
 *
 * 用于将“游戏事件”映射为“音乐表达类型”
 *
 * @function getMotif
 * @param {number} lines - 本次消除的行数
 * @param {boolean} isPerfectClear - 是否全清（棋盘清空）
 * @returns {'combo' | 'tetris' | 'perfect'} 音乐动机类型
 */
const getMotif = (lines, isPerfectClear = false) => {
  // 全清优先级最高
  if (isPerfectClear) {
    return 'perfect';
  }

  // 4 行消除（Tetris）
  if (lines === 4) {
    return 'tetris';
  }

  // 默认普通消除
  return 'combo';
};

/**
 * # 游戏音效集合
 *
 * 统一管理所有 Tetris 游戏音效，基于 Web Audio 播放
 *
 * @typedef {object} GameSounds
 * @property {Function} levelSelect - 等级选择音效
 * @property {Function} levelStart - 等级开始音效
 * @property {Function} countdown - 开始倒计时音效
 * @property {Function} move - 方块移动音效
 * @property {Function} rotate - 方块旋转音效
 * @property {Function} drop - 方块快速下落音效
 * @property {Function} fall - 方块落地音效
 * @property {Function} clear - 方块消除音效
 * @property {Function} levelUp - 升级庆祝音效
 * @property {Function} pause - 暂停游戏音效
 * @property {Function} secondTick - 秒针走动音效
 * @property {Function} resume - 恢复游戏音效
 * @property {Function} gameOver - 游戏结束音效（降调）
 * @property {Function} bgmToggle - 背景音乐开关音效
 */

/**
 * # 全局游戏音效对象
 *
 * @type {GameSounds}
 */
const Sounds = {
  // 等级选择音效（正弦波柔和音效）
  levelSelect: () => playTone(523, 80, 0.1, 'sine'),
  // 等级开始音效
  levelStart: () => playTone(1319, 160, 0.22, 'sine'),
  // 开始倒计时音效
  countdown: () => playTone(784, 180, 0.3, 'sine'),
  // 方块移动音效
  move: () => playTone(330, 60),
  // 方块旋转音效
  rotate: () => playTone(440, 60),
  // 方块快速下落音效
  drop: () => playTone(220, 100),
  // 方块落地音效
  fall: () => playTone(180, 200),
  /**
   * ## 消行动效音播放（基于和弦 + 动机系统）
   *
   * 根据消除行数生成不同音乐动机，并播放对应和弦音效
   *
   * @param {number} lines - 消除行数
   * @param {boolean} isPerfectClear - 是否全清
   */
  clear: (lines = 1, isPerfectClear = false) => {
    // 基础和弦库（音色核心，不变）
    const frequencies = [
      [440, 587, 698],
      [587, 698, 880],
      [698, 880, 1174],
      [587, 880, 1174],
      [440, 880, 1174],
    ];

    // 每个音轨的基础播放参数
    const speeds = [260, 300, 380];
    const volumes = [0.32, 0.3, 0.25];
    const timeouts = [160, 320, 480];

    // 获取当前音乐动机（combo / tetris / perfect）
    const motif = getMotif(lines, isPerfectClear);

    // 动机参数
    const cfg = MOTIFS[motif];

    // 安全索引（防止越界）
    const index = Math.min(lines, frequencies.length - 1);

    // 基础和弦
    const baseChord = frequencies[index];

    /*
     * 生成最终和弦：
     * Shift 控制整体音高偏移
     * 12 = 半音单位
     */
    const chord = baseChord.map((freq) => freq + cfg.shift * 12);

    // 逐音轨播放
    for (const [i, freq] of chord.entries()) {
      setTimeout(() => {
        playTone(
          freq,
          speeds[i] * cfg.speed,
          volumes[i] * cfg.volume,
          'square',
        );
      }, timeouts[i]);
    }
  },
  // 升级庆祝音效
  levelUp: () => {
    playTone(523, 220);
    setTimeout(() => playTone(587, 220), 260);
    setTimeout(() => playTone(659, 240), 520);
    setTimeout(() => playTone(784, 260), 780);
    setTimeout(() => playTone(880, 280), 1060);
    setTimeout(() => playTone(1047, 320), 1360);
    setTimeout(() => playTone(1175, 360), 1700);
    setTimeout(() => playTone(1319, 480), 2080);
  },
  // 暂停游戏音效
  pause: () => playTone(300, 150),
  // 秒针走动音效
  secondTick: () => playTone(880, 50, 0.085, 'sine'),
  // 恢复游戏音效
  resume: () => playTone(400, 150),
  // 游戏结束音效（悲伤旋律）
  gameOver: () => {
    playTone(330, 200);
    setTimeout(() => playTone(294, 300), 210);
    setTimeout(() => playTone(262, 500), 520);
  },
  // 背景音乐开关音效
  bgmToggle: () => playTone(440, 100),
};

export default Sounds;
