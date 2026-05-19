/**
 * # 获取指定列的高度
 *
 * 从上往下扫描，找到第一个被占用的格子， 返回该列从该格子到底部的距离作为列高度。 如果整列为空，返回 0。
 *
 * @example
 *   // 假设棋盘 20 行，第 3 列在 y=17 处有第一个方块
 *   // 返回 20 - 17 = 3
 *   const height = getColumnHeight(board, 3);
 *
 * @function getColumnHeight
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {number} x - 列索引
 * @returns {number} 该列的高度（底部到最高方块的行数）
 */
const getColumnHeight = (board, x) => {
  // 从上往下遍历每一行
  for (let y = 0; y < board.length; y++) {
    // 找到第一个被占用的格子
    if (board[y][x]) {
      // 返回从底部到该格子的距离
      return board.length - y;
    }
  }

  // 整列为空
  return 0;
};

/**
 * # 计算空洞数量
 *
 * 空洞的定义：某一列中，最顶部方块**之下**的空格。 这些空格被上方方块遮挡，无法直接消除，是棋盘质量的重要负面指标。
 *
 * ### 计算方式
 *
 * 1. 从上往下扫描每一列
 * 2. 标记是否已遇到第一个方块（blockFound）
 * 3. 遇到方块后，其下方的所有空格都计入空洞
 *
 * @example
 *   // 某列：[0, 1, 0, 1]（从上到下）
 *   // y=0: 0, blockFound=false → 不计
 *   // y=1: 1, blockFound=true
 *   // y=2: 0, blockFound=true → 空洞 +1
 *   // y=3: 1, blockFound=true → 不计
 *   // 该列空洞数 = 1
 *
 * @function countHoles
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @returns {number} 空洞总数
 */
const countHoles = (board) => {
  let holes = 0;

  // 逐列扫描
  for (let x = 0; x < board[0].length; x++) {
    // 标记是否已遇到该列的第一个方块
    let blockFound = false;

    // 从上往下遍历该列的每一行
    for (const row of board) {
      if (row[x]) {
        // 遇到方块，标记已找到
        blockFound = true;
      } else if (blockFound) {
        // 在方块之下遇到空格，计入空洞
        holes += 1;
      }
    }
  }

  return holes;
};

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
 * @returns {number} 棋盘评分，越高越好
 */
const evaluateBoard = (board) => {
  // 收集每列的高度
  const heights = [];

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
    aggregateHeight * -0.51 +
    holes * -0.35 +
    bumpiness * -0.18 +
    completeLines * 1.5
  );
};

export default evaluateBoard;
