import getColumnHeight from '@/lib/ai/utils/get-column-height.js';
import countHoles from '@/lib/ai/utils/count-holes.js';

/**
 * # 棋盘评估函数
 *
 * 对棋盘状态进行综合评分，用于 AI 决策。
 *
 * ## 评估指标
 *
 * | 指标                      | 权重  | 说明                                       |
 * | ------------------------- | ----- | ------------------------------------------ |
 * | aggregateHeight（总高度） | -0.51 | 所有列高度之和，惩罚堆叠过高               |
 * | holes（空洞数）           | -0.35 | 方块下方的空位数，惩罚堆叠不紧密           |
 * | bumpiness（不平整度）     | -0.18 | 相邻列高度差的绝对值之和，惩罚表面凹凸不平 |
 * | completeLines（消除行数） | +1.5  | 奖励可消除的完整行，引导 AI 主动消行       |
 *
 * ## 分数含义
 *
 * - 分数越高（越接近 0）越好
 * - 空棋盘分数为 0
 * - 每个惩罚项都会降低分数
 * - 消除行奖励可以抵消部分惩罚
 *
 * @example
 *   const emptyBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
 *   evaluateBoard(emptyBoard); // 0
 *
 *   // 填满最底下一行
 *   const board = Array.from({ length: 20 }, () => Array(10).fill(0));
 *   for (let x = 0; x < 10; x++) board[19][x] = 1;
 *   evaluateBoard(board); // 约 -3.6（10* -0.51 + 1*1.5）
 *
 * @function evaluateBoard
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {object} weights - 计算的权重信息对象
 * @returns {number} 棋盘评分，越高越好
 */
const evaluateBoard = (board, weights) => {
  // 收集每列的高度
  const heights = [];
  const w = {
    height: -0.51,
    holes: -0.35,
    bumpiness: -0.18,
    completeLines: 1.5,
    // 自定义权重覆盖默认值
    ...weights,
  };

  for (let x = 0; x < board[0].length; x++) {
    heights.push(getColumnHeight(board, x));
  }

  // 计算总高度（所有列高度之和）
  const aggregateHeight = heights.reduce((a, b) => a + b, 0);

  // 计算不平整度（相邻列高度差的绝对值之和）
  let bumpiness = 0;

  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }

  // 计算空洞数量
  const holes = countHoles(board);

  // 计算可消除的完整行数
  let completeLines = 0;

  for (const row of board) {
    // 如果该行每个格子都被占用，则为完整行
    if (row.every((cell) => cell !== 0)) {
      completeLines += 1;
    }
  }

  // 加权求和：惩罚项为负，奖励项为正
  return (
    aggregateHeight * w.height +
    holes * w.holes +
    bumpiness * w.bumpiness +
    completeLines * w.completeLines
  );
};

export default evaluateBoard;
