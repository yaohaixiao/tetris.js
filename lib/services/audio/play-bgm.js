import GAME from '@/lib/game/constants/game.js';
import Musics from '@/lib/services/audio/constants/musics.js';
import loopPlayBGM from '@/lib/services/audio/loop-play-bgm.js';

/**
 * ============================================================
 *
 * # 根据玩家等级选取对应的背景音乐
 *
 * ============================================================
 *
 * 将最大等级（256）按曲目数量（16）均分为 16 段，每段一首。
 *
 * ## 选曲算法
 *
 * Step = floor(MAX_LEVEL / musicCount) index = min(floor((level - 1) / step),
 * musicCount - 1)
 *
 * ## 示例（MAX_LEVEL = 256，16 首）
 *
 * | 等级    | index | 曲目                      |
 * | :------ | :---- | :------------------------ |
 * | 1-16    | 0     | TetrisTheme               |
 * | 17-32   | 1     | SpringFestival            |
 * | 33-48   | 2     | FirstDivision             |
 * | ...     | ...   | ...                       |
 * | 241-256 | 15    | JourneyToWest             |
 * | 257+    | 15    | JourneyToWest（min 保护） |
 *
 * @function getMusicByLevel
 * @param {number} level - 玩家当前等级（从 1 开始）
 * @returns {object} 对应的曲目配置对象
 */
const getMusicByLevel = (level) => {
  const { length } = Musics;
  const { MAX_LEVEL } = GAME;

  // 每个曲目覆盖的等级区间大小：256 / 16 = 16 关/首
  const step = Math.floor(MAX_LEVEL / length);

  // 计算等级对应的曲目索引，min 防止越界
  const index = Math.min(Math.floor((level - 1) / step), length - 1);

  return Musics[index];
};

/**
 * ============================================================
 *
 * # 播放游戏背景音乐
 *
 * ============================================================
 *
 * 根据玩家当前等级选取对应的曲目，启动旋律的循环播放。
 *
 * ## 执行流程
 *
 * 1. 调用 getMusicByLevel() 根据等级获取曲目配置
 * 2. 解构配置中的参数
 * 3. 调用 loopPlayBGM() 将旋律排入调度器循环播放
 *
 * ## 调用时机
 *
 * - 游戏开始时（begin）
 * - 等级升级后（_onClearLines）
 * - 恢复游戏时（resume）
 * - 重启游戏时（restart）
 *
 * ## 示例
 *
 * ```javascript
 * playBGM(audio, 150); // 等级 150 播放 Ascension
 * ```
 *
 * @function playBGM
 * @param {object} audio - Audio 对象实例
 * @param {number} [level=1] - 玩家当前等级. Default is `1`
 * @returns {void}
 */
const playBGM = (audio, level = 1) => {
  // 根据等级获取对应曲目配置
  const music = getMusicByLevel(level);

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
