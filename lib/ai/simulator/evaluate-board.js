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
 * | maxHeight（最高列）       | -1.5 | 单独惩罚最高列，防止"一边堆到顶一边全空"   |
 * | holes（空洞数）           | 可配 | 方块下方的空位数，惩罚堆叠不紧密           |
 * | bumpiness（不平整度）     | 可配 | 相邻列高度差的绝对值之和，惩罚表面凹凸不平 |
 * | completeLines（消行奖励） | 可配 | 完整行的平方奖励，鼓励凑 Tetris            |
 *
 * ### 计分奖励（消行价值）
 *
 * 通过 `clearResult` 参数传入，在消行发生时给予额外奖励：
 *
 * | 指标         | 权重 | 说明                                 |
 * | ------------ | ---- | ------------------------------------ |
 * | clearScore   | 0.01 | 消行得分归一化，引导 AI 追求高分消行 |
 * | isTSpin      | 5    | T-Spin 额外奖励                      |
 * | isTSpinMini  | 2    | T-Spin Mini 奖励                     |
 * | isBackToBack | 3    | Back-to-Back 奖励                    |
 * | isAllClear   | 10   | All Clear 重奖                       |
 * | combo        | 0.5  | Combo 奖励                           |
 *
 * ## 分数含义
 *
 * - 分数越高（越接近 0）越好
 * - 空棋盘分数为 0
 * - 每个惩罚项都会降低分数
 * - 消行奖励可以抵消部分惩罚，引导 AI 做出战术选择
 *
 * @example
 *   const emptyBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
 *   evaluateBoard(emptyBoard); // 0
 *
 * @function evaluateBoard
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {object} weights - 权重配置，可覆盖默认的 height/holes/bumpiness/completeLines
 * @param {object} [clearResult] - 消行计分结果（由 simulateClearResult 返回），无消行时传
 *   undefined
 * @returns {number} 棋盘评分，越高越好
 */
const evaluateBoard = (board, weights, clearResult) => {
  // 收集每列的高度
  const heights = [];

  /**
   * 权重配置：默认值与自定义权重合并
   *
   * Height/holes/bumpiness/completeLines 可通过 weights 参数覆盖， 允许不同难度使用不同的评估策略。
   */
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

  // 计算总高度（所有列高度之和）
  const aggregateHeight = heights.reduce((a, b) => a + b, 0);

  // 计算最高列高度，单独惩罚防止"一边堆到顶"
  const maxHeight = Math.max(...heights);

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
    if (row.every((cell) => cell !== 0)) {
      completeLines += 1;
    }
  }

  /**
   * 静态评分：棋盘结构质量
   *
   * = 总高度惩罚 + 最高列惩罚 + 空洞惩罚 + 不平整度惩罚 + 消行奖励
   *
   * CompleteLines 使用平方处理，使 Tetris（4 行）的奖励远超 Single（1 行）。 maxHeight 单独惩罚
   * -1.5，防止单列堆到顶而其他列全空。
   */
  const staticScore =
    aggregateHeight * w.height +
    maxHeight * -1.5 +
    holes * w.holes +
    bumpiness * w.bumpiness +
    Math.pow(completeLines, 2) * w.completeLines;

  /**
   * 计分奖励：消行价值
   *
   * 如果传入了 clearResult（消行计分结果），根据消行的类型和质量给予额外奖励。 将 applyClearLines 的计分结果纳入评估，引导
   * AI 主动追求 T-Spin、Combo、Back-to-Back 等高价值操作。
   */
  let scoreBonus = 0;

  if (clearResult) {
    // 消行得分归一化（原始分数太大，缩放到合理范围）
    scoreBonus += clearResult.clearScore * 0.01;

    // T-Spin 额外奖励
    if (clearResult.isTSpin) {
      scoreBonus += 5;
    } else if (clearResult.isTSpinMini) {
      scoreBonus += 2;
    }

    // Back-to-Back 奖励：鼓励连续大招
    if (clearResult.isBackToBack) {
      scoreBonus += 3;
    }

    // All Clear 重奖：全清价值极高
    if (clearResult.isAllClear) {
      scoreBonus += 10;
    }

    // Combo 奖励：越高越值钱，鼓励连续消行
    scoreBonus += clearResult.combo * 0.5;
  }

  return staticScore + scoreBonus;
};

export default evaluateBoard;
