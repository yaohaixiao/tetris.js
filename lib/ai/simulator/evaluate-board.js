import getColumnHeight from '@/lib/ai/utils/get-column-height.js';
import countHoles from '@/lib/ai/utils/count-holes.js';

/**
 * # 棋盘评估函数
 *
 * 对棋盘状态进行综合评分，用于 AI 决策。
 *
 * ## 评估指标
 *
 * ### 静态指标（棋盘结构）
 *
 * | 指标                      | 权重 | 说明                                       |
 * | ------------------------- | ---- | ------------------------------------------ |
 * | aggregateHeight（总高度） | 可配 | 所有列高度之和，惩罚堆叠过高               |
 * | maxHeight（最高列）       | -1.2 | 单独惩罚最高列，防止"一边堆到顶一边全空"   |
 * | holes（空洞数）           | 可配 | 方块下方的空位数，惩罚堆叠不紧密           |
 * | bumpiness（不平整度）     | 可配 | 相邻列高度差的绝对值之和，惩罚表面凹凸不平 |
 *
 * ### 计分奖励（消行价值）
 *
 * | 指标         | 权重 | 说明                                 |
 * | ------------ | ---- | ------------------------------------ |
 * | clearScore   | 0.01 | 消行得分归一化，引导 AI 追求高分消行 |
 * | isTSpin      | 5    | T-Spin 额外奖励，引导 AI 构造 T 型槽 |
 * | isTSpinMini  | 2    | T-Spin Mini 奖励                     |
 * | isBackToBack | 3    | Back-to-Back 奖励，鼓励连续大招      |
 * | isAllClear   | 10   | All Clear 重奖，AI 会追求全清        |
 * | combo        | 0.5  | Combo 奖励，鼓励连续消行             |
 *
 * ## 分数含义
 *
 * - 分数越高（越接近 0）越好
 * - 空棋盘分数为 0
 * - 每个惩罚项都会降低分数
 * - 计分奖励可以抵消部分惩罚，引导 AI 做出战术选择
 *
 * @example
 *   const emptyBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
 *   evaluateBoard(emptyBoard); // 0
 *
 * @function evaluateBoard
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {object} weights - 计算的权重信息对象
 * @param {object} [clearResult] - 消行计分结果（由 simulateClearResult 返回）
 * @returns {number} 棋盘评分，越高越好
 */
const evaluateBoard = (board, weights, clearResult) => {
  const heights = [];
  const w = {
    height: -0.51,
    holes: -0.35,
    bumpiness: -0.18,
    completeLines: 1.5,
    ...weights,
  };

  for (let x = 0; x < board[0].length; x++) {
    heights.push(getColumnHeight(board, x));
  }

  const aggregateHeight = heights.reduce((a, b) => a + b, 0);
  const maxHeight = Math.max(...heights);

  let bumpiness = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }

  const holes = countHoles(board);

  let completeLines = 0;
  for (const row of board) {
    if (row.every((cell) => cell !== 0)) {
      completeLines += 1;
    }
  }

  const staticScore =
    aggregateHeight * w.height +
    maxHeight * -1.2 +
    holes * w.holes +
    bumpiness * w.bumpiness +
    Math.pow(completeLines, 2) * w.completeLines;

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
