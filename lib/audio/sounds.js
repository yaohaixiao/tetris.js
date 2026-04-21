import playTone from '@/lib/audio/play-tone.js';

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
  //
  /**
   * ## 方块消除音效
   *
   * 根据消除层数播放不同的音效
   *
   * @param {number} lines - 消除方块的层数
   */
  clear: (lines = 0) => {
    const frequencies = [
      [440, 587, 698],
      [587, 698, 880],
      [698, 880, 1174],
      [587, 880, 1174],
      [440, 880, 1174],
    ];

    const speeds = [260, 300, 380];
    const volumes = [0.32, 0.3, 0.25];
    const timeouts = [160, 320, 480];
    const music = frequencies[lines];

    for (const [index, freq] of music.entries()) {
      setTimeout(
        () => playTone(freq, speeds[index], volumes[index], 'square'),
        timeouts[index],
      );
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
