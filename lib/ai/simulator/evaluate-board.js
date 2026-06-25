import getColumnHeight from '@/lib/ai/simulator/utils/get-column-height.js';
import countHoles from '@/lib/ai/simulator/utils/count-holes.js';

/**
 * # 棋盘评估函数
 *
 * 对棋盘状态进行综合评分，用于 AI 决策。
 *
 * ## 设计理念
 *
 * - `aggregateHeight` 作为背景压力（弱权重），防止 AI 无限养井
 * - `holes` 作为核心指标（强权重），一个洞毁全局
 * - `maxHeight` 超过 12 行后开始指数惩罚，逼迫 AI 及时消行
 * - 消行奖励从 `clearResult` 读取，表驱动区分 Single～Tetris
 * - `clearResult` 沿前瞻链传递，深层搜索也能看到消行价值
 *
 * ## 评估指标
 *
 * ### 结构指标
 *
 * | 指标                      | 权重  | 说明                                         |
 * | ------------------------- | ----- | -------------------------------------------- |
 * | aggregateHeight（总高度） | -0.45 | 背景压力，适中恐高，防止无限堆叠             |
 * | maxHeight（最高列）       | 动态  | >12 开始指数惩罚（×0.5），给 AI 留足堆叠空间 |
 * | holes（空洞数）           | -8    | 核心指标，一个洞 ≈ 10 分惩罚                 |
 * | bumpiness（不平整度）     | -0.35 | 引导 AI 保持表面平整以便多消行               |
 *
 * ### 消行奖励
 *
 * | 消行数 | lineReward | × completeLines/4 | 最终奖励 |
 * | ------ | ---------- | ----------------- | -------- |
 * | 1行    | 2          | × 5               | 10 分    |
 * | 2行    | 6          | × 5               | 30 分    |
 * | 3行    | 12         | × 5               | 60 分    |
 * | 4行    | 40         | × 5               | 200 分   |
 * | 5行    | 80         | × 5               | 400 分   |
 *
 * ### 计分奖励（叠加在消行奖励之上）
 *
 * | 指标         | 说明            |
 * | ------------ | --------------- |
 * | clearScore   | 消行得分 × 0.03 |
 * | isTSpin      | +8              |
 * | isTSpinMini  | +3              |
 * | isBackToBack | +5              |
 * | isAllClear   | +20             |
 * | combo        | combo × 0.8     |
 *
 * ## 危险区行为
 *
 *     ≤12 行：安全，自由堆叠（给 AI 充足的堆叠空间建结构）
 *     13-14：轻度压力
 *     15-16：明显压力，必须找消行
 *     17+：重度压力，不消行会快速死亡
 *
 * ## 设计说明
 *
 * `maxHeightPenalty` 从 12 行才开始触发（而非 8-10 行）， 给 AI 充足的堆叠空间来构建 well 结构等 Tetris。
 * 配合 `bumpiness = -0.35` 引导平整表面， AI 在安全区内优先追求多消行而非急于降低高度。
 *
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {object} weights - 权重配置，可覆盖默认值
 * @param {object} [clearResult] - 消行计分结果（沿前瞻链传递）
 * @returns {number} 棋盘评分，越高越好
 */
const evaluateBoard = (board, weights, clearResult) => {
  // 收集每列高度
  const heights = [];

  /** 默认权重配置。 调用方可通过 weights 参数覆盖任意字段。 对战模式下可注入 attackScore 相关权重。 */
  const w = {
    height: -0.45, // 背景压力：适中恐高
    holes: -8, // 空洞惩罚：一个洞 ≈ 10 分
    bumpiness: -0.35, // 不平整度：引导平整表面
    completeLines: 20, // 消行奖励缩放因子
    ...weights,
  };

  // 计算每列高度
  for (let x = 0; x < board[0].length; x++) {
    heights.push(getColumnHeight(board, x));
  }

  // 总高度：所有列高度之和
  const aggregateHeight = heights.reduce((a, b) => a + b, 0);

  // 最高列：用于危险区判断
  const maxHeight = Math.max(...heights);

  // 不平整度：相邻列高度差的绝对值之和
  let bumpiness = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }

  // 空洞数：被堵塞的空格数量
  const holes = countHoles(board);

  /**
   * 危险区指数惩罚。
   *
   * 从 12 行开始触发，给 AI 充足的堆叠空间： 14 行：(14-12)² × 0.5 = 2 16 行：(16-12)² × 0.5 = 8 18
   * 行：(18-12)² × 0.5 = 18 20 行：(20-12)² × 0.5 = 32
   */
  let maxHeightPenalty = 0;
  if (maxHeight > 12) {
    maxHeightPenalty = -Math.pow(maxHeight - 12, 2) * 0.5;
  }

  /**
   * 消行奖励：表驱动。
   *
   * 阶梯式奖励，Tetris 的 200 分远超 Double 的 30 分， 引导 AI 主动构建 well 结构追 Tetris。
   */
  const lineRewards = [0, 2, 6, 12, 40, 80];
  const linesCleared = clearResult ? clearResult.cleared : 0;
  const lineReward = lineRewards[linesCleared] || 0;

  /**
   * 静态评分。
   *
   * = 总高度惩罚 + 危险区惩罚 + 空洞惩罚 + 不平整度惩罚 + 消行奖励
   */
  const staticScore =
    aggregateHeight * w.height +
    maxHeightPenalty +
    holes * w.holes +
    bumpiness * w.bumpiness +
    lineReward * (w.completeLines / 4);

  /**
   * 计分奖励。
   *
   * 在消行奖励基础上叠加游戏内的各项得分奖励。
   */
  let scoreBonus = 0;

  if (clearResult) {
    // 消行得分归一化（×0.03）
    scoreBonus += clearResult.clearScore * 0.03;

    // T-Spin 额外奖励
    if (clearResult.isTSpin) {
      scoreBonus += 8;
    } else if (clearResult.isTSpinMini) {
      scoreBonus += 3;
    }

    // Back-to-Back 连续大招奖励
    if (clearResult.isBackToBack) {
      scoreBonus += 5;
    }

    // All Clear 全清重奖
    if (clearResult.isAllClear) {
      scoreBonus += 20;
    }

    // Combo 连击奖励
    scoreBonus += clearResult.combo * 0.8;
  }

  // 最终评分 = 静态结构分 + 计分奖励
  return staticScore + scoreBonus;
};

export default evaluateBoard;
