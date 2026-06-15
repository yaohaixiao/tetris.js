const AI_WEIGHTS = {
  holes: -5,
  height: -0.3,
  bumpiness: -0.2,
  completeLines: 20,
};

/**
 * # AI 难度配置
 *
 * 定义不同游戏难度下 AI 的行为参数。难度越高，AI 的前瞻深度越深、噪声越低、响应速度越快。
 * 所有难度共享同一套评估权重（AI_WEIGHTS），差异仅体现在搜索深度、噪声和延迟上。
 *
 * ## 统一权重设计
 *
 * | 指标          | 权重 | 说明                                            |
 * | ------------- | ---- | ----------------------------------------------- |
 * | holes         | -5   | 重罚空洞。一个洞毁全局，AI 不惜一切代价避免留洞 |
 * | height        | -0.3 | 背景压力。温和控制高度，不过度恐高              |
 * | bumpiness     | -0.2 | 适度惩罚不平整，保持表面基本平整                |
 * | completeLines | 20   | 消行奖励缩放因子。Tetris = 20×4 = 80 分         |
 *
 * ## 配置参数说明
 *
 * | 参数        | 类型   | 说明                                         |
 * | ----------- | ------ | -------------------------------------------- |
 * | `lookahead` | number | 前瞻深度：2=多看一步，3=多看两步，4=多看三步 |
 * | `noise`     | number | 随机噪声（0-1）：AI 有概率随机选择非最优解   |
 * | `beam`      | number | Beam Search 剪枝宽度                         |
 * | `weights`   | object | 评估权重（所有难度共用 AI_WEIGHTS）          |
 * | `delay`     | number | AI 决策延迟（毫秒）：模拟人类反应时间        |
 *
 * ## 难度等级
 *
 * | 难度   | lookahead | beam | noise | delay | 特点                         |
 * | ------ | --------- | ---- | ----- | ----- | ---------------------------- |
 * | EASY   | 2         | —    | 0.25  | 580ms | 多看一步，偶尔犯错，反应慢   |
 * | NORMAL | 3         | 2    | 0.15  | 480ms | 多看两步，偶尔失误，中等速度 |
 * | HARD   | 4         | 4    | 0.05  | 280ms | 多看三步，很少犯错，较快     |
 * | EXPERT | 4         | 5    | 0     | 150ms | 多看三步，从不犯错，极快     |
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
   * - 多看一步（lookahead=2），有基本前瞻
   * - 15% 概率随机选择非最优解，模拟人类失误
   * - 决策延迟 480ms，给玩家充足的操作时间
   */
  EASY: {
    lookahead: 2,
    noise: 0.15,
    weights: AI_WEIGHTS,
    delay: 480,
  },

  /**
   * ## 普通难度（NORMAL）
   *
   * - 多看两步（lookahead=3），深度推演
   * - Beam Search 剪枝宽度 2，保证流畅
   * - 8% 概率随机选择，偶尔失误
   * - 决策延迟 380ms，中等响应速度
   */
  NORMAL: {
    lookahead: 3,
    beam: 2,
    noise: 0.08,
    weights: AI_WEIGHTS,
    delay: 380,
  },

  /**
   * ## 困难难度（HARD）
   *
   * - 多看三步（lookahead=4），极限推演
   * - Beam Search 剪枝宽度 4，保留更多候选
   * - 4% 概率随机选择，很少失误
   * - 决策延迟 200ms，较快响应
   */
  HARD: {
    lookahead: 4,
    beam: 4,
    noise: 0.04,
    weights: AI_WEIGHTS,
    delay: 200,
  },

  /**
   * ## 专家难度（EXPERT）
   *
   * - 多看三步（lookahead=4），极限推演
   * - Beam Search 剪枝宽度 5，最宽搜索
   * - 0% 噪声，始终选择最优解，不犯错
   * - 决策延迟仅为 130ms，给玩家极短的反应窗口
   */
  EXPERT: {
    lookahead: 4,
    noise: 0,
    beam: 5,
    weights: AI_WEIGHTS,
    delay: 130,
  },
};

export default AIDifficulty;
