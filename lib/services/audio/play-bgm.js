import Musics from '@/lib/services/audio/constants/musics.js';
import loopPlayBGM from '@/lib/services/audio/loop-play-bgm.js';

// 从曲库中解构所有可用曲目
const {
  TetrisTheme,
  SpringFestival,
  FirstDivision,
  GongXiFaCai,
  Loginska,
  BeyondTheWall,
  Technotris,
  GoldenSnakeDance,
  Korobeiniki,
  JourneyToWest,
} = Musics;

/**
 * ## 曲目列表
 *
 * 按等级从低到高排列，等级越高解锁越后面的曲目。
 *
 * @constant {object[]}
 */
const MUSIC_LIST = [
  TetrisTheme,
  SpringFestival,
  FirstDivision,
  GongXiFaCai,
  Loginska,
  BeyondTheWall,
  Technotris,
  GoldenSnakeDance,
  Korobeiniki,
  JourneyToWest,
];

/**
 * # 根据玩家等级选取对应的背景音乐
 *
 * 将最大等级按曲目数量均分，每个区间对应一首曲子。 超出最大等级时固定选取最后一首。
 *
 * ## 选曲算法
 *
 *     step = floor(maxLevel / musicCount);
 *     index = min(floor((level - 1) / step), musicCount - 1);
 *
 * 例如：10 首曲子，最大等级 99 → step = 9， 等级 1-9 放第 1 首，10-18 放第 2 首，以此类推。
 *
 * @param {object} audio - Audio 对象实例（含 Level.max）
 * @param {number} level - 玩家当前等级（从 1 开始）
 * @returns {object} 对应的曲目配置对象（含 melody、duration、volume 等）
 */
const getMusicByLevel = (audio, level) => {
  const { length } = MUSIC_LIST;
  const maxLevel = audio.Level.max;
  // 每个曲目覆盖的等级区间大小
  const step = Math.floor(maxLevel / length);
  // 计算等级对应的曲目索引（最小为 0，最大为 length-1）
  const index = Math.min(Math.floor((level - 1) / step), length - 1);
  return MUSIC_LIST[index];
};

/**
 * # 播放游戏背景音乐（BGM）
 *
 * 根据玩家当前等级选取对应的曲目， 并启动旋律的循环播放。
 *
 * ## 执行流程
 *
 * 1. 根据等级获取对应的曲目配置
 * 2. 提取配置中的参数（旋律、时长、音量、波形、包络等）
 * 3. 调用 `loopPlayBGM()` 开始循环播放
 *
 * @example
 *   // 玩家升至第 5 级时调用
 *   playBGM(audio, 5);
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
