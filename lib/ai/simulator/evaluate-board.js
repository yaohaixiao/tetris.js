import getColumnHeight from '@/lib/ai/utils/get-column-height.js';
import countHoles from '@/lib/ai/utils/count-holes.js';

/**
 * # 棋盘评估函数
 *
 * 对棋盘状态进行综合评分，用于 AI 决策。
 *
 * ## 设计理念
 *
 * - `aggregateHeight` 作为背景压力（弱权重），防止 AI 无限养井
 * - `holes` 作为核心指标（强权重），一个洞毁全局
 * - `maxHeight` 超过 10 行后开始指数惩罚，逼迫 AI 及时消行
 * - 消行奖励从 `clearResult` 读取，表驱动区分 Single～5行
 * - `clearResult` 沿前瞻链传递，深层搜索也能看到消行价值
 *
 * ## 评估指标
 *
 * ### 静态指标（棋盘结构）
 *
 * | 指标                      | 权重 | 说明                                       |
 * | ------------------------- | ---- | ------------------------------------------ |
 * | aggregateHeight（总高度） | -0.3 | 背景压力，弱权重，防止无限养井             |
 * | maxHeight（最高列）       | 动态 | >10 开始指数惩罚，系数 1，逼迫 AI 及时消行 |
 * | holes（空洞数）           | -5   | 核心指标，一个洞毁全局                     |
 * | bumpiness（不平整度）     | -0.2 | 适度惩罚表面凹凸不平                       |
 *
 * ### 计分奖励（消行价值）
 *
 * | 指标         | 说明                |
 * | ------------ | ------------------- |
 * | lineRewards  | 表驱动：1/4/8/20/30 |
 * | clearScore   | 消行得分归一化      |
 * | isTSpin      | T-Spin 额外奖励     |
 * | isTSpinMini  | T-Spin Mini 奖励    |
 * | isBackToBack | Back-to-Back 奖励   |
 * | isAllClear   | All Clear 重奖      |
 * | combo        | Combo 奖励          |
 *
 * ## 危险区行为
 *
 *     ≤10 行：安全，自由堆叠
 *     11-12：轻度压力
 *     13-14：明显压力，必须找消行
 *     15+：  重度压力，不消行会快速死亡
 *
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {object} weights - 权重配置，可覆盖默认值
 * @param {object} [clearResult] - 消行计分结果（沿前瞻链传递）
 * @returns {number} 棋盘评分，越高越好
 */
const evaluateBoard = (board, weights, clearResult) => {
  const heights = [];

  const w = {
    height: -0.3,
    holes: -5,
    bumpiness: -0.2,
    completeLines: 20,
    ...weights,
  };

  for (let x = 0; x < board[0].length; x++) {
    heights.push(getColumnHeight(board, x));
  }

  // 总高度：背景压力
  const aggregateHeight = heights.reduce((a, b) => a + b, 0);

  // 最高列：危险区判断
  const maxHeight = Math.max(...heights);

  // 不平整度
  let bumpiness = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }

  // 空洞：核心指标
  const holes = countHoles(board);

  /**
   * 危险区指数惩罚
   *
   * 从 10 行开始触发，逼迫 AI 及时消行。 12 行：罚 (12-10)² × 1 = 4 14 行：罚 (14-10)² × 1 = 16 16
   * 行：罚 (16-10)² × 1 = 36 18 行：罚 (18-10)² × 1 = 64 20 行：罚 (20-10)² × 1 = 100
   */
  let maxHeightPenalty = 0;
  if (maxHeight > 10) {
    maxHeightPenalty = -Math.pow(maxHeight - 10, 2) * 1;
  }

  /**
   * 消行奖励：表驱动
   *
   * Single=1, Double=4, Triple=8, Tetris=20, 5行=30。 乘以 completeLines/5 实现权重缩放。
   * Tetris: 20 × (20/5) = 80 分 5行: 30 × 4 = 120 分
   */
  const lineRewards = [0, 1, 4, 8, 20, 30];
  const linesCleared = clearResult ? clearResult.cleared : 0;
  const lineReward = lineRewards[linesCleared] || 0;

  /**
   * 静态评分
   *
   * = 总高度(背景压力) + 危险区惩罚 + 空洞(核心) + 不平整度 + 消行奖励
   */
  const staticScore =
    aggregateHeight * w.height +
    maxHeightPenalty +
    holes * w.holes +
    bumpiness * w.bumpiness +
    lineReward * (w.completeLines / 5);

  /** 计分奖励 */
  let scoreBonus = 0;

  if (clearResult) {
    scoreBonus += clearResult.clearScore * 0.01;

    if (clearResult.isTSpin) {
      scoreBonus += 5;
    } else if (clearResult.isTSpinMini) {
      scoreBonus += 2;
    }

    if (clearResult.isBackToBack) {
      scoreBonus += 3;
    }

    if (clearResult.isAllClear) {
      scoreBonus += 10;
    }

    scoreBonus += clearResult.combo * 0.5;
  }

  return staticScore + scoreBonus;
};

export default evaluateBoard;
