import JasmineFlower from '@/lib/services/audio/constants/bgm/jasmine-flower.js';
import FirstDivision from '@/lib/services/audio/constants/bgm/first-division.js';
import Loginska from '@/lib/services/audio/constants/bgm/loginska.js';
import Technotris from '@/lib/services/audio/constants/bgm/technotris.js';
import Korobeiniki from '@/lib/services/audio/constants/bgm/korobeiniki.js';
import BeyondTheWall from '@/lib/services/audio/constants/bgm/beyond-the-wall.js';
import TetrisTheme from '@/lib/services/audio/constants/bgm/tetris-theme.js';
import JourneyToWest from '@/lib/services/audio/constants/bgm/journey-to-west.js';

/**
 * @typedef {object} MusicNote
 * @property {number} freq - 音符频率（Hz）
 * @property {number} dur - 音符时长系数（基准 duration × dur = 实际时长 ms）
 * @property {string} [wave] - 可选，单音波形类型
 */

/**
 * @typedef {object} Music
 * @property {string} name - 音乐名称
 * @property {number[] | MusicNote[]} melody - 音符数组，支持纯数字（Hz）或带节奏的对象
 * @property {number} duration - 基准音符时长（ms）
 * @property {number} volume - 音量（0~1）
 * @property {string} [wave] - 默认波形类型（'sine' | 'square' | 'triangle' |
 *   'sawtooth'）
 */

/** # 游戏背景音乐资源 */
const Musics = {
  /**
   * ## 背景音乐：JasmineFlower
   *
   * @type {Music}
   */
  JasmineFlower,

  /**
   * ## 背景音乐：FirstDivision
   *
   * @type {Music}
   */
  FirstDivision,

  /**
   * ## 背景音乐：Loginska
   *
   * @type {Music}
   */
  Loginska,

  /**
   * ## 背景音乐：Technotris
   *
   * @type {Music}
   */
  Technotris,

  /**
   * ## 背景音乐：Korobeiniki
   *
   * @type {Music}
   */
  Korobeiniki,

  /**
   * ## 背景音乐：BeyondTheWall
   *
   * @type {Music}
   */
  BeyondTheWall,

  /**
   * ## 背景音乐：TetrisTheme
   *
   * @type {Music}
   */
  TetrisTheme,

  /**
   * ## 背景音乐：JourneyToWest
   *
   * @type {Music}
   */
  JourneyToWest,
};

export default Musics;
