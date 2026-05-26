import TetrisTheme from '@/lib/services/audio/constants/bgm/tetris-theme.js';
import SpringFestival from '@/lib/services/audio/constants/bgm/spring-festival.js';
import FirstDivision from '@/lib/services/audio/constants/bgm/first-division.js';
import GongXiFaCai from '@/lib/services/audio/constants/bgm/gong-xi-fa-cai.js';
import Loginska from '@/lib/services/audio/constants/bgm/loginska.js';
import BeyondTheWall from '@/lib/services/audio/constants/bgm/beyond-the-wall.js';
import Technotris from '@/lib/services/audio/constants/bgm/technotris.js';
import GoldenSnakeDance from '@/lib/services/audio/constants/bgm/golden-snake-dance.js';
import Korobeiniki from '@/lib/services/audio/constants/bgm/korobeiniki.js';
import Ascension from '@/lib/services/audio/constants/bgm/ascension.js';
import NeonNights from '@/lib/services/audio/constants/bgm/neon-nights.js';
import FrozenPeaks from '@/lib/services/audio/constants/bgm/frozen-peaks.js';
import CyberRush from '@/lib/services/audio/constants/bgm/cyber-rush.js';
import Starlight from '@/lib/services/audio/constants/bgm/starlight.js';
import FinalPush from '@/lib/services/audio/constants/bgm/final-push.js';
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

/**
 * # 曲目列表
 *
 * 按等级从低到高排列，等级越高解锁越后面的曲目。 共 16 首，与 MAX_LEVEL(256) 配合，每 16 关换一首。
 *
 * | 序号 | 曲名             | 关卡段  |
 * | ---- | ---------------- | ------- |
 * | 1    | TetrisTheme      | 1-16    |
 * | 2    | SpringFestival   | 17-32   |
 * | 3    | FirstDivision    | 33-48   |
 * | 4    | GongXiFaCai      | 49-64   |
 * | 5    | Loginska         | 65-80   |
 * | 6    | BeyondTheWall    | 81-96   |
 * | 7    | Technotris       | 97-112  |
 * | 8    | GoldenSnakeDance | 113-128 |
 * | 9    | Korobeiniki      | 129-144 |
 * | 10   | Ascension        | 145-160 |
 * | 11   | NeonNights       | 161-176 |
 * | 12   | FrozenPeaks      | 177-192 |
 * | 13   | CyberRush        | 193-208 |
 * | 14   | Starlight        | 209-224 |
 * | 15   | FinalPush        | 225-240 |
 * | 16   | JourneyToWest    | 241-256 |
 *
 * @constant {object[]}
 */
const Musics = [
  /**
   * ## 背景音乐：TetrisTheme
   *
   * @type {Music}
   */
  TetrisTheme,

  /**
   * ## 背景音乐：SpringFestival
   *
   * @type {Music}
   */
  SpringFestival,

  /**
   * ## 背景音乐：FirstDivision
   *
   * @type {Music}
   */
  FirstDivision,

  /**
   * ## 背景音乐：GongXiFaCai
   *
   * @type {Music}
   */
  GongXiFaCai,

  /**
   * ## 背景音乐：Loginska
   *
   * @type {Music}
   */
  Loginska,

  /**
   * ## 背景音乐：BeyondTheWall
   *
   * @type {Music}
   */
  BeyondTheWall,

  /**
   * ## 背景音乐：Technotris
   *
   * @type {Music}
   */
  Technotris,

  /**
   * ## 背景音乐：GoldenSnakeDance
   *
   * @type {Music}
   */
  GoldenSnakeDance,

  /**
   * ## 背景音乐：Korobeiniki
   *
   * @type {Music}
   */
  Korobeiniki,

  /**
   * ## 背景音乐：Ascension
   *
   * @type {Music}
   */
  Ascension,

  /**
   * ## 背景音乐：NeonNights
   *
   * @type {Music}
   */
  NeonNights,

  /**
   * ## 背景音乐：FrozenPeaks
   *
   * @type {Music}
   */
  FrozenPeaks,

  /**
   * ## 背景音乐：CyberRush
   *
   * @type {Music}
   */
  CyberRush,

  /**
   * ## 背景音乐：Starlight
   *
   * @type {Music}
   */
  Starlight,

  /**
   * ## 背景音乐：FinalPush
   *
   * @type {Music}
   */
  FinalPush,

  /**
   * ## 背景音乐：JourneyToWest
   *
   * @type {Music}
   */
  JourneyToWest,
];

export default Musics;
