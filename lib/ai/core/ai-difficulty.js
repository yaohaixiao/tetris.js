const AI_WEIGHTS = {
  holes: -8, // 空洞惩罚：一个洞 ≈ 10 分
  height: -0.7, // 背景压力：适中恐高
  bumpiness: -0.35, // 不平整度：引导平整表面
  completeLines: 20, // 消行奖励缩放因子
};

/**
 * # AI 难度配置
 *
 * 定义不同游戏难度下 AI 的行为参数。难度越高，AI 的搜索广度越宽、噪声越低、响应速度越快。
 * 所有难度共享同一套评估权重（AI_WEIGHTS），差异体现在搜索深度、搜索广度、噪声和延迟上。
 *
 * ## 统一权重设计
 *
 * | 指标          | 权重  | 说明                                                            |
 * | ------------- | ----- | --------------------------------------------------------------- |
 * | holes         | -8    | 重罚空洞。一个洞毁全局，AI 不惜一切代价避免留洞                 |
 * | height        | -0.7  | 背景压力。适度恐高，防止无限堆叠                                |
 * | bumpiness     | -0.35 | 惩罚不平整，引导 AI 保持表面平整以便多消行                      |
 * | completeLines | 20    | 消行奖励缩放因子。Tetris = 40 × (20/4) = 200 分，Double = 30 分 |
 *
 * ## 权重设计理念
 *
 * - **holes = -8**：一个洞 ≈ 10 分惩罚，AI 最多为 Double（30分）打 3 个洞
 * - **height = -0.7**：平均高度 10 行 ≈ -7 分，持续施压防止堆叠过高
 * - **bumpiness = -0.35**：不平整度 10 ≈ -3.5 分，相对温和但持续施压
 * - **completeLines = 20**：Tetris = 200 分，给了 AI 明确的"追 Tetris"目标
 *
 * ## 配置参数说明
 *
 * | 参数        | 类型   | 说明                                         |
 * | ----------- | ------ | -------------------------------------------- |
 * | `lookahead` | number | 前瞻深度：2=多看一步，3=多看两步，4=多看三步 |
 * | `noise`     | number | 随机噪声（0-1）：AI 有概率随机选择非最优解   |
 * | `beam`      | number | Beam Search 剪枝宽度，每层保留的候选路径数量 |
 * | `weights`   | object | 评估权重（所有难度共用 AI_WEIGHTS）          |
 * | `delay`     | number | AI 决策延迟（毫秒）：模拟人类反应时间        |
 *
 * ## 难度等级
 *
 * | 难度   | lookahead | beam | noise | delay | 特点                         |
 * | ------ | --------- | ---- | ----- | ----- | ---------------------------- |
 * | EASY   | 2         | 2    | 0.08  | 480ms | 多看一步，偶尔犯错，反应慢   |
 * | NORMAL | 3         | 3    | 0.05  | 380ms | 多看两步，偶尔失误，中等速度 |
 * | HARD   | 4         | 3    | 0     | 200ms | 多看三步，聚焦搜索，反应快   |
 * | EXPERT | 4         | 4    | 0     | 130ms | 多看三步，宽搜索不遗漏，极速 |
 *
 * ## 设计说明
 *
 * - **lookahead=4 是评估函数的上限**：实测 lookahead=5 效果反而变差，线性评估函数 的误差在超过 4 步后会被放大
 * - **HARD 与 EXPERT 的差异**：两者搜索深度相同，EXPERT 使用更宽的 beam (4 vs 3) 和更低的延迟 (130ms vs
 *   200ms)。实测 beam=3 和 beam=4 表现几乎无差别， beam=4 不更好但也不更差，保留作为名义区分
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
   * - 前瞻 2 步，有基本规划能力
   * - Beam 宽度 2，只保留最优 2 个候选
   * - 8% 噪声，偶尔随机选择非最优解
   * - 决策延迟 480ms，给玩家充足的反应时间
   */
  EASY: {
    lookahead: 2,
    beam: 2,
    noise: 0.08,
    weights: AI_WEIGHTS,
    delay: 480,
  },

  /**
   * ## 普通难度（NORMAL）
   *
   * - 前瞻 3 步，中等深度推演
   * - Beam 宽度 3，保留更多候选路径
   * - 5% 噪声，偶尔失误
   * - 决策延迟 380ms，中等响应速度
   */
  NORMAL: {
    lookahead: 3,
    beam: 3,
    noise: 0.05,
    weights: AI_WEIGHTS,
    delay: 380,
  },

  /**
   * ## 困难难度（HARD）
   *
   * - 前瞻 4 步，达到评估函数有效预测上限
   * - Beam 宽度 3，聚焦搜索
   * - 0% 噪声，始终选择最优解
   * - 决策延迟 200ms，较快响应
   */
  HARD: {
    lookahead: 4,
    beam: 3,
    noise: 0,
    weights: AI_WEIGHTS,
    delay: 200,
  },

  /**
   * ## 专家难度（EXPERT）
   *
   * - 前瞻 4 步，与 HARD 相同深度
   * - Beam 宽度 4，比 HARD 更宽的搜索
   * - 0% 噪声，始终选择最优解
   * - 决策延迟 130ms，极速响应
   */
  EXPERT: {
    lookahead: 4,
    beam: 4,
    noise: 0,
    weights: AI_WEIGHTS,
    delay: 130,
  },
};

export default AIDifficulty;
