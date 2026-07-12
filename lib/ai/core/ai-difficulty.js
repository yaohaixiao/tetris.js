/**
 * AI 评估权重。
 *
 * | 指标          | 权重  | 说明                                                            |
 * | :------------ | :---- | :-------------------------------------------------------------- |
 * | holes         | -8    | 重罚空洞。AI 不惜一切代价避免留洞                               |
 * | height        | -0.7  | 背景压力。适度恐高，防止无限堆叠                                |
 * | bumpiness     | -0.35 | 惩罚不平整，引导 AI 保持表面平整以便多消行                      |
 * | completeLines | 20    | 消行奖励缩放因子。Tetris = 40 × (20/4) = 200 分，Double = 30 分 |
 *
 * @constant {object}
 */
const AI_WEIGHTS = {
  holes: -8,
  height: -0.7,
  bumpiness: -0.35,
  completeLines: 20,
};

/**
 * ============================================================
 *
 * # AI 难度配置
 *
 * ============================================================
 *
 * 定义不同游戏难度下 AI 的行为参数。 难度越高，AI 的搜索广度越宽、噪声越低、响应速度越快。 所有难度共享同一套评估权重（AI_WEIGHTS）。
 *
 * ## 配置参数说明
 *
 * | 参数      | 类型   | 说明                                         |
 * | :-------- | :----- | :------------------------------------------- |
 * | lookahead | number | 前瞻深度：2=多看一步，3=多看两步，4=多看三步 |
 * | noise     | number | 随机噪声（0-1）：AI 有概率随机选择非最优解   |
 * | beam      | number | Beam Search 剪枝宽度，每层保留的候选路径数量 |
 * | weights   | object | 评估权重（所有难度共用 AI_WEIGHTS）          |
 * | delay     | number | AI 决策延迟（毫秒）：模拟人类反应时间        |
 *
 * ## 难度等级
 *
 * | 难度   | lookahead | beam | noise | delay | 特点                         |
 * | :----- | :-------- | :--- | :---- | :---- | :--------------------------- |
 * | EASY   | 2         | 2    | 0.08  | 480ms | 多看一步，偶尔犯错，反应慢   |
 * | NORMAL | 3         | 3    | 0.05  | 380ms | 多看两步，偶尔失误，中等速度 |
 * | HARD   | 4         | 3    | 0     | 200ms | 多看三步，聚焦搜索，反应快   |
 * | EXPERT | 4         | 4    | 0     | 130ms | 多看三步，宽搜索不遗漏，极速 |
 *
 * @constant {object} AIDifficulty
 */
const AIDifficulty = {
  /**
   * 简单难度（EASY）：
   *
   * - 前瞻 2 步；
   * - Beam=2；
   * - 8% 噪声；
   * - 延迟 480ms
   */
  EASY: {
    lookahead: 2,
    beam: 2,
    noise: 0.08,
    weights: AI_WEIGHTS,
    delay: 480,
  },

  /**
   * 普通难度（NORMAL）：
   *
   * - 前瞻 3 步；
   * - Beam=3；
   * - 5% 噪声；
   * - 延迟 380ms
   */
  NORMAL: {
    lookahead: 3,
    beam: 3,
    noise: 0.05,
    weights: AI_WEIGHTS,
    delay: 380,
  },

  /**
   * 困难难度（HARD）：
   *
   * - 前瞻 4 步；
   * - Beam=3；
   * - 0% 噪声；
   * - 延迟 200ms
   */
  HARD: {
    lookahead: 4,
    beam: 3,
    noise: 0,
    weights: AI_WEIGHTS,
    delay: 200,
  },

  /**
   * 专家难度（EXPERT）：
   *
   * - 前瞻 4 步；
   * - Beam=4；
   * - 0% 噪声；
   * - 延迟 130ms
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
