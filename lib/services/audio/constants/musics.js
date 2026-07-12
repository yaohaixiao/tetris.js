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
 * 音符类型定义。
 *
 * @typedef {object} MusicNote
 * @property {number} freq - 音符频率（Hz）
 * @property {number} dur - 音符时长系数
 * @property {string} [wave] - 单音波形类型
 */

/**
 * 曲目类型定义。
 *
 * @typedef {object} Music
 * @property {string} name - 音乐名称
 * @property {number[] | MusicNote[]} melody - 音符数组
 * @property {number} duration - 基准音符时长（ms）
 * @property {number} volume - 音量（0~1）
 * @property {string} [wave] - 默认波形类型
 */

/**
 * ============================================================
 *
 * # 曲目列表
 *
 * ============================================================
 *
 * 按等级从低到高排列，等级越高解锁越后面的曲目。 共 16 首，与 MAX_LEVEL(256) 配合，每 16 关换一首。
 *
 * | 序号 | 曲名             | 关卡段  |
 * | :--- | :--------------- | :------ |
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
 * @constant {Music[]}
 */
const Musics = [
  /** @type {Music} TetrisTheme */
  TetrisTheme,
  /** @type {Music} SpringFestival */
  SpringFestival,
  /** @type {Music} FirstDivision */
  FirstDivision,
  /** @type {Music} GongXiFaCai */
  GongXiFaCai,
  /** @type {Music} Loginska */
  Loginska,
  /** @type {Music} BeyondTheWall */
  BeyondTheWall,
  /** @type {Music} Technotris */
  Technotris,
  /** @type {Music} GoldenSnakeDance */
  GoldenSnakeDance,
  /** @type {Music} Korobeiniki */
  Korobeiniki,
  /** @type {Music} Ascension */
  Ascension,
  /** @type {Music} NeonNights */
  NeonNights,
  /** @type {Music} FrozenPeaks */
  FrozenPeaks,
  /** @type {Music} CyberRush */
  CyberRush,
  /** @type {Music} Starlight */
  Starlight,
  /** @type {Music} FinalPush */
  FinalPush,
  /** @type {Music} JourneyToWest */
  JourneyToWest,
];

export default Musics;
