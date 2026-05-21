/**
 * # AI 难度配置
 *
 * 定义不同游戏难度下 AI 的行为参数。 难度越高，AI 的前瞻深度越深、评估权重越严格、响应速度越快。
 *
 * ## 配置参数说明
 *
 * | 参数                | 类型   | 说明                                                     |
 * | ------------------- | ------ | -------------------------------------------------------- |
 * | `lookahead`         | number | 前瞻深度：1=只看当前方块，2=多看一步，3=多看两步         |
 * | `noise`             | number | 随机噪声（0-1）：AI 有概率随机选择非最优解，值越大越"笨" |
 * | `weights`           | object | 评估函数的权重配置（负数，越负表示惩罚越重）             |
 * | `weights.holes`     | number | 空洞惩罚权重                                             |
 * | `weights.height`    | number | 总高度惩罚权重                                           |
 * | `weights.bumpiness` | number | 不平整度惩罚权重                                         |
 * | `delay`             | number | AI 决策延迟（毫秒）：模拟人类反应时间，值越大 AI 越"慢"  |
 *
 * ## 难度等级
 *
 * | 难度   | lookahead | noise | delay | 特点                         |
 * | ------ | --------- | ----- | ----- | ---------------------------- |
 * | EASY   | 1         | 0.25  | 680ms | 只看眼前，偶尔犯错，反应慢   |
 * | NORMAL | 2         | 0.1   | 480ms | 多看一步，偶尔失误，中等速度 |
 * | HARD   | 3         | 0     | 380ms | 多看两步，从不犯错，较快     |
 * | EXPERT | 3         | 0     | 120ms | 多看两步，从不犯错，极快     |
 *
 * ## 如何使用
 *
 * ```js
 * import AIDifficulty from '@/lib/ai/config/ai-difficulty.js';
 *
 * const config = AIDifficulty.NORMAL;
 * // selfPlay(snapshot, config.lookahead);
 * // score += randomNoise * config.noise;
 * // scheduler.delay(loop, config.delay);
 * ```
 *
 * @constant {object} AIDifficulty
 */
const AIDifficulty = {
  /**
   * ## 简单难度
   *
   * - 只看当前方块（lookahead=1），不做深层推演
   * - 25% 概率随机选择非最优解，模拟人类失误
   * - 评估权重较轻，允许堆高和留空洞
   * - 决策延迟 680ms，给玩家充足的操作时间
   */
  EASY: {
    /** 前瞻深度：只看当前方块 */
    lookahead: 1,
    /** 随机噪声：25% 概率随机选择 */
    noise: 0.25,
    /** 评估权重（轻惩罚） */
    weights: {
      holes: -0.45,
      height: -0.35,
      bumpiness: -0.12,
      completeLines: 2,
    },
    /** 决策延迟（毫秒） */
    delay: 580,
  },

  /**
   * ## 普通难度
   *
   * - 多看一步（lookahead=2），有一定前瞻能力
   * - 10% 概率随机选择，偶尔失误
   * - 评估权重适中，开始重视空洞
   * - 决策延迟 480ms，中等响应速度
   */
  NORMAL: {
    /** 前瞻深度：多看一步 */
    lookahead: 2,
    /** 随机噪声：10% 概率随机选择 */
    noise: 0.1,
    /** 评估权重（中等惩罚） */
    weights: {
      holes: -0.75,
      height: -0.45,
      bumpiness: -0.18,
      completeLines: 3,
    },
    /** 决策延迟（毫秒） */
    delay: 480,
  },

  /**
   * ## 困难难度
   *
   * - 多看两步（lookahead=3），深度推演
   * - 0% 噪声，始终选择最优解，不犯错
   * - 评估权重严格，强力惩罚空洞
   * - 决策延迟 380ms，较快响应
   */
  HARD: {
    /** 前瞻深度：多看两步 */
    lookahead: 3,
    beam: 5,
    /** 随机噪声：不犯错 */
    noise: 0,
    /** 评估权重（重惩罚） */
    weights: {
      holes: -0.9,
      height: -0.75,
      bumpiness: -0.2,
      completeLines: 5,
    },
    /** 决策延迟（毫秒） */
    delay: 280,
  },

  /**
   * ## 专家难度
   *
   * - 和困难难度相同的推理能力（lookahead=3, noise=0）
   * - 唯一的区别是决策延迟仅为 120ms， 接近游戏的最低下落速度，给玩家极短的反应窗口
   */
  EXPERT: {
    /** 前瞻深度：多看两步 */
    lookahead: 3,
    /** 随机噪声：不犯错 */
    noise: 0,
    beam: 3,
    /** 评估权重（重惩罚，与 HARD 相同） */
    weights: {
      holes: -1,
      height: -0.95,
      bumpiness: -0.2,
      completeLines: 6,
    },
    /** 决策延迟（毫秒）：极快 */
    delay: 150,
  },
};

export default AIDifficulty;
