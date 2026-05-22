/**
 * # AI 难度配置
 *
 * 定义不同游戏难度下 AI 的行为参数。 难度越高，AI 的前瞻深度越深、评估权重越严格、响应速度越快。
 *
 * ## 配置参数说明
 *
 * | 参数                    | 类型   | 说明                                                     |
 * | ----------------------- | ------ | -------------------------------------------------------- |
 * | `lookahead`             | number | 前瞻深度：1=只看当前方块，2=多看一步，3=多看两步         |
 * | `noise`                 | number | 随机噪声（0-1）：AI 有概率随机选择非最优解，值越大越"笨" |
 * | `beam`                  | number | Beam Search 剪枝宽度，第一层只保留 top N 候选进入递归    |
 * | `weights`               | object | 评估函数的权重配置（负数越负表示惩罚越重）               |
 * | `weights.holes`         | number | 空洞惩罚权重                                             |
 * | `weights.height`        | number | 总高度惩罚权重                                           |
 * | `weights.bumpiness`     | number | 不平整度惩罚权重                                         |
 * | `weights.completeLines` | number | 消行奖励权重（内部会平方处理，4 行 = weight × 16）       |
 * | `delay`                 | number | AI 决策延迟（毫秒）：模拟人类反应时间，值越大 AI 越"慢"  |
 *
 * ## 难度等级
 *
 * | 难度   | lookahead | noise | delay | 特点                         |
 * | ------ | --------- | ----- | ----- | ---------------------------- |
 * | EASY   | 1         | 0.25  | 580ms | 只看眼前，偶尔犯错，反应慢   |
 * | NORMAL | 2         | 0.1   | 480ms | 多看一步，偶尔失误，中等速度 |
 * | HARD   | 3         | 0     | 280ms | 多看两步，从不犯错，较快     |
 * | EXPERT | 3         | 0     | 150ms | 多看两步，从不犯错，极快     |
 *
 * ## 如何使用
 *
 * ```js
 * import AIDifficulty from '@/lib/ai/config/ai-difficulty.js';
 *
 * const config = AIDifficulty.NORMAL;
 * selfPlay(snapshot, config.weights, config.lookahead, config.beam);
 * scheduler.delay(loop, config.delay);
 * ```
 *
 * @constant {object} AIDifficulty
 */
const AIDifficulty = {
  /**
   * ## 简单难度（EASY）
   *
   * - 只看当前方块（lookahead=1），不做深层推演
   * - 25% 概率随机选择非最优解，模拟人类失误
   * - 评估权重较轻，允许堆高和留空洞
   * - 决策延迟 580ms，给玩家充足的操作时间
   *
   * ### 权重设计
   *
   * | 指标          | 权重  | 说明                                     |
   * | ------------- | ----- | ---------------------------------------- |
   * | holes         | -0.45 | 轻度惩罚空洞，偶尔漏填无妨               |
   * | height        | -0.35 | 允许堆高，不主动压高度                   |
   * | bumpiness     | -0.12 | 轻微惩罚不平整                           |
   * | completeLines | 2     | 消 1 行奖 2 分，4 行奖 32 分，不刻意追求 |
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
   * ## 普通难度（NORMAL）
   *
   * - 多看一步（lookahead=2），有一定前瞻能力
   * - 10% 概率随机选择，偶尔失误
   * - 评估权重适中，开始重视空洞
   * - 决策延迟 480ms，中等响应速度
   *
   * ### 权重设计
   *
   * | 指标          | 权重  | 说明                                   |
   * | ------------- | ----- | -------------------------------------- |
   * | holes         | -0.75 | 明显惩罚空洞，减少留洞                 |
   * | height        | -0.45 | 适度控制高度                           |
   * | bumpiness     | -0.18 | 惩罚不平整，保持表面平整               |
   * | completeLines | 3     | 消 1 行奖 3 分，4 行奖 48 分，鼓励消行 |
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
   * ## 困难难度（HARD）
   *
   * - 多看两步（lookahead=3），深度推演
   * - Beam Search 剪枝宽度 5，平衡性能与智能
   * - 0% 噪声，始终选择最优解，不犯错
   * - 评估权重严格，强力惩罚空洞和高度
   * - 决策延迟 280ms，较快响应
   *
   * ### 权重设计
   *
   * | 指标          | 权重  | 说明                                          |
   * | ------------- | ----- | --------------------------------------------- |
   * | holes         | -0.9  | 重罚空洞，几乎不留洞                          |
   * | height        | -0.95 | **强力压高度**，AI 极度恐高                   |
   * | bumpiness     | -0.2  | 保持表面平整                                  |
   * | completeLines | 6     | 消 1 行奖 6 分，4 行奖 96 分，高度追求 Tetris |
   *
   * 高度惩罚 -0.95 配合消行奖励 6（平方后 4 行 = 96 分）， AI 会为了凑满行而主动压低堆叠，同时追求一次性消除多行。
   */
  HARD: {
    /** 前瞻深度：多看两步 */
    lookahead: 3,
    /** Beam Search 剪枝宽度 */
    beam: 5,
    /** 随机噪声：不犯错 */
    noise: 0,
    /** 评估权重（重惩罚） */
    weights: {
      holes: -0.9,
      height: -0.95,
      bumpiness: -0.2,
      completeLines: 6,
    },
    /** 决策延迟（毫秒） */
    delay: 280,
  },

  /**
   * ## 专家难度（EXPERT）
   *
   * - 和困难难度相同的推理能力（lookahead=3, noise=0）
   * - Beam Search 剪枝宽度 3，保证流畅性
   * - 评估权重最严格，对高度和空洞零容忍
   * - 决策延迟仅为 150ms，给玩家极短的反应窗口
   * - 接近游戏的最低下落速度（120ms），但保留 30ms 呼吸感
   *
   * ### 权重设计
   *
   * | 指标          | 权重  | 说明                                           |
   * | ------------- | ----- | ---------------------------------------------- |
   * | holes         | -1.0  | 最重空洞惩罚，绝不留洞                         |
   * | height        | -1.25 | **极限压高度**，AI 视堆高为最大威胁            |
   * | bumpiness     | -0.2  | 保持表面平整                                   |
   * | completeLines | 7     | 消 1 行奖 7 分，4 行奖 112 分，极限追求 Tetris |
   *
   * 高度惩罚 -1.25 是四个难度中的最大值， 配合消行奖励 7（平方后 4 行 = 112 分）， AI 在极度恐高的同时会疯狂追求一次性多行消除。
   */
  EXPERT: {
    /** 前瞻深度：多看两步 */
    lookahead: 3,
    /** 随机噪声：不犯错 */
    noise: 0,
    /** Beam Search 剪枝宽度 */
    beam: 3,
    /** 评估权重（最重惩罚） */
    weights: {
      holes: -1,
      height: -1.25,
      bumpiness: -0.2,
      completeLines: 8,
    },
    /** 决策延迟（毫秒）：极快，保留 30ms 呼吸感 */
    delay: 150,
  },
};

export default AIDifficulty;
