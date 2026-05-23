import GAME from '@/lib/game/constants/game.js';
import Musics from '@/lib/services/audio/constants/musics.js';
import loopPlayBGM from '@/lib/services/audio/loop-play-bgm.js';

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
const MUSIC_LIST = [
  Musics.TetrisTheme,
  Musics.SpringFestival,
  Musics.FirstDivision,
  Musics.GongXiFaCai,
  Musics.Loginska,
  Musics.BeyondTheWall,
  Musics.Technotris,
  Musics.GoldenSnakeDance,
  Musics.Korobeiniki,
  Musics.Ascension,
  Musics.NeonNights,
  Musics.FrozenPeaks,
  Musics.CyberRush,
  Musics.Starlight,
  Musics.FinalPush,
  Musics.JourneyToWest,
];

/**
 * # 根据玩家等级选取对应的背景音乐
 *
 * 将最大等级（256）按曲目数量（16）均分为 16 段，每段一首。
 *
 * ## 选曲算法
 *
 *     step = floor(MAX_LEVEL / musicCount);
 *     index = min(floor((level - 1) / step), musicCount - 1);
 *
 * ## 示例（MAX_LEVEL = 256，16 首）
 *
 *     step = 256 / 16 = 16
 *
 * | 等级    | index | 曲目                      |
 * | ------- | ----- | ------------------------- |
 * | 1-16    | 0     | TetrisTheme               |
 * | 17-32   | 1     | SpringFestival            |
 * | 33-48   | 2     | FirstDivision             |
 * | ...     | ...   | ...                       |
 * | 241-256 | 15    | JourneyToWest             |
 * | 257+    | 15    | JourneyToWest（min 保护） |
 *
 * @param {object} audio - Audio 对象实例
 * @param {number} level - 玩家当前等级（从 1 开始）
 * @returns {object} 对应的曲目配置对象（含 melody、duration、volume、wave、gate、articulation）
 */
const getMusicByLevel = (audio, level) => {
  const { length } = MUSIC_LIST;
  const { MAX_LEVEL } = GAME;

  /**
   * 每个曲目覆盖的等级区间大小
   *
   * 256 / 16 = 16 关/首
   */
  const step = Math.floor(MAX_LEVEL / length);

  /**
   * 计算等级对应的曲目索引
   *
   * `Math.min` 防止越界：超出 256 关时固定取最后一首
   */
  const index = Math.min(Math.floor((level - 1) / step), length - 1);

  return MUSIC_LIST[index];
};

/**
 * # 播放游戏背景音乐（BGM）
 *
 * 根据玩家当前等级选取对应的曲目，启动旋律的循环播放。
 *
 * ## 执行流程
 *
 * 1. 调用 `getMusicByLevel()` 根据等级获取曲目配置
 * 2. 解构配置中的 melody、duration、volume、wave、gate、articulation
 * 3. 调用 `loopPlayBGM()` 将旋律排入调度器循环播放
 *
 * ## 调用时机
 *
 * - 游戏开始时（`begin`）
 * - 等级升级后（`_onClearLines`）
 * - 恢复游戏时（`resume`）
 * - 重启游戏时（`restart`）
 *
 * @example
 *   playBGM(audio, 150); // 等级 150 播放 Ascension
 *
 * @function playBGM
 * @param {object} audio - Audio 对象实例
 * @param {number} [level=1] - 玩家当前等级，默认 1. Default is `1`
 * @returns {void}
 */
const playBGM = (audio, level = 1) => {
  // 根据等级获取对应曲目配置
  const music = getMusicByLevel(audio, level);

  // 解构曲目配置，传给循环播放器
  const { melody, duration, volume, wave, gate, articulation } = music;

  loopPlayBGM(audio, melody, {
    duration,
    volume,
    wave,
    gate,
    articulation,
  });
};

export default playBGM;
