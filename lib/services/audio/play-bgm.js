import Musics from '@/lib/services/audio/constants/musics.js';
import loopPlayBGM from '@/lib/services/audio/loop-play-bgm.js';

//  从曲库中解构所有可用曲目
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
 * 曲目列表，按等级从低到高排列。 茉莉花放在第一位，作为初始关卡曲目。
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
 * # 根据玩家等级选取对应的背景音乐。
 *
 * 将最大等级按曲目数量均分，每个区间对应一首曲子。 例如：8 首曲子，最大等级 96 → step = 12，每 12 级换一首。
 * 超出最大等级时固定选取最后一首。
 *
 * @param {number} level - 玩家当前等级（从 1 开始）
 * @param {number} [maxLevel=99] - 游戏配置的最高等级. Default is `99`
 * @returns {object} - 返回对应的曲目配置对象
 */
const getMusicByLevel = (level, maxLevel = 99) => {
  const { length } = MUSIC_LIST;
  const step = Math.floor(maxLevel / length);
  const index = Math.min(Math.floor((level - 1) / step), length - 1);
  return MUSIC_LIST[index];
};

/**
 * # 播放游戏背景音乐（BGM）
 *
 * 根据玩家当前等级选取对应的曲目，停止当前正在播放的 BGM， 然后启动新的旋律循环。
 *
 * ## 执行流程
 *
 * 1. 检查 BGM 开关，若关闭则直接返回。
 * 2. 若 AudioContext 处于 suspended 状态（浏览器自动暂停策略）， 调用 `resume()` 恢复。
 * 3. 停止当前可能正在播放的 BGM，防止重叠。
 * 4. 根据等级获取曲目配置。
 * 5. 提取配置中的参数传入 `loopPlayBGM()` 开始循环播放。
 *
 * @async
 * @example
 *   // 玩家升至第 5 级时调用
 *   await playBGM(5);
 *
 * @function playBGM
 * @param {object} audio - Audio 对象实例
 * @param {number} [level=1] - 玩家当前等级，默认 1. Default is `1`
 * @param {number} [maxLevel=99] - 游戏配置的最高等级. Default is `99`
 * @returns {void}
 */
const playBGM = (audio, level = 1, maxLevel = 99) => {
  // 根据等级获取对应曲目配置
  const music = getMusicByLevel(level, maxLevel);

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
