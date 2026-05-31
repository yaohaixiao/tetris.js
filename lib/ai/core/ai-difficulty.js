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
 * | NORMAL | 2         | 0     | 480ms | 多看一步，从不犯错，中等速度 |
 * | HARD   | 3         | 0     | 280ms | 多看两步，从不犯错，较快     |
 * | EXPERT | 4         | 0     | 150ms | 多看三步，从不犯错，极快     |
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
   * - 评估权重最轻，对不平整度几乎不惩罚
   * - 决策延迟 580ms，给玩家充足的操作时间
   *
   * ### 权重设计
   *
   * | 指标          | 权重  | 说明                                                 |
   * | ------------- | ----- | ---------------------------------------------------- |
   * | holes         | -0.45 | 轻度惩罚空洞，偶尔漏填无妨                           |
   * | height        | -0.35 | 允许堆高，不主动压高度                               |
   * | bumpiness     | -0.05 | 几乎不惩罚不平整，允许粗糙表面                       |
   * | completeLines | 2     | 消 1 行奖 2 分，消 2 行奖 8 分，消 4 行奖 32 分     |
   */
  EASY: {
    lookahead: 1,
    noise: 0.25,
    weights: {
      holes: -0.45,
      height: -0.35,
      bumpiness: -0.05,
      completeLines: 2,
    },
    delay: 580,
  },

  /**
   * ## 普通难度（NORMAL）
   *
   * - 多看一步（lookahead=2），有一定前瞻能力
   * - 0% 噪声，不会浪费深度搜索的结果
   * - 评估权重适中，开始重视空洞和不平整度
   * - 决策延迟 480ms，中等响应速度
   *
   * ### 权重设计
   *
   * | 指标          | 权重  | 说明                                                 |
   * | ------------- | ----- | ---------------------------------------------------- |
   * | holes         | -0.75 | 明显惩罚空洞，减少留洞                               |
   * | height        | -0.45 | 适度控制高度                                         |
   * | bumpiness     | -0.18 | 惩罚不平整，保持表面平整                             |
   * | completeLines | 3     | 消 1 行奖 3 分，消 2 行奖 12 分，消 4 行奖 48 分    |
   */
  NORMAL: {
    lookahead: 2,
    noise: 0,
    weights: {
      holes: -0.75,
      height: -0.45,
      bumpiness: -0.18,
      completeLines: 3,
    },
    delay: 480,
  },

  /**
   * ## 困难难度（HARD）
   *
   * - 多看两步（lookahead=3），深度推演
   * - Beam Search 剪枝宽度 5，平衡性能与智能
   * - 0% 噪声，始终选择最优解，不犯错
   * - 评估权重严格，强力惩罚空洞和高度
   * - 不平整度惩罚加重，要求表面更平整
   * - 决策延迟 280ms，较快响应
   *
   * ### 权重设计
   *
   * | 指标          | 权重   | 说明                                                 |
   * | ------------- | ------ | ---------------------------------------------------- |
   * | holes         | -0.9   | 重罚空洞，几乎不留洞                                 |
   * | height        | -1.15  | 强力压高度。10列各高4行惩罚 -46，AI 不敢随意堆       |
   * | bumpiness     | -0.25  | 加重不平整惩罚，要求表面平整                         |
   * | completeLines | 6      | 消 1 行奖 6 分，消 2 行奖 24 分，消 4 行奖 96 分    |
   *
   * 平衡点：10列各高4行罚 -46，Tetris 奖 96，净赚 50。 AI 愿意为 Tetris 短暂堆高，但不会长期维持高堆叠。
   */
  HARD: {
    lookahead: 3,
    beam: 5,
    noise: 0,
    weights: {
      holes: -0.9,
      height: -1.15,
      bumpiness: -0.25,
      completeLines: 6,
    },
    delay: 280,
  },

  /**
   * ## 专家难度（EXPERT）
   *
   * - 多看三步（lookahead=4），极限推演
   * - Beam Search 剪枝宽度 3，保证流畅性
   * - 0% 噪声，始终选择最优解，不犯错
   * - 评估权重最严格，对高度、空洞、不平整全部零容忍
   * - 决策延迟仅为 150ms，给玩家极短的反应窗口
   *
   * ### 权重设计
   *
   * | 指标          | 权重   | 说明                                                   |
   * | ------------- | ------ | ------------------------------------------------------ |
   * | holes         | -1.0   | 最重空洞惩罚，绝不留洞                                 |
   * | height        | -1.6   | 极限压高度。10列各高4行罚 -64，与 HARD 拉开明显差距    |
   * | bumpiness     | -0.3   | 最重不平整惩罚，表面必须平整                           |
   * | completeLines | 8      | 消 1 行奖 8 分，消 2 行奖 32 分，消 4 行奖 128 分     |
   *
   * 平衡点：10列各高4行罚 -64，Tetris 奖 128，净赚 64。 配合 7-bag 确定性前瞻（lookahead=4），AI
   * 能精确规划"短暂堆高→Tetris→快速回落"的循环。
   */
  EXPERT: {
    lookahead: 4,
    noise: 0,
    beam: 3,
    weights: {
      holes: -1,
      height: -1.6,
      bumpiness: -0.3,
      completeLines: 8,
    },
    delay: 150,
  },
};

export default AIDifficulty;
