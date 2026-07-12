/**
 * ============================================================
 *
 * # 获取所有合法的水平位置
 *
 * ============================================================
 *
 * 根据棋盘宽度和方块形状宽度， 计算出方块在棋盘上所有可以放置的 X 坐标。
 *
 * 合法范围：从 0 到 boardWidth - shapeWidth（包含两端）， 确保方块不会超出棋盘左右边界。
 *
 * @function getValidXPositions
 * @param {number[][]} board - 游戏棋盘
 * @param {number[][]} shape - 方块形状矩阵
 * @returns {number[]} 所有合法的 X 坐标数组
 */
const getValidXPositions = (board, shape) => {
  const boardWidth = board[0].length;
  const shapeWidth = shape[0].length;
  const maxX = boardWidth - shapeWidth;

  // 生成从 0 到 maxX 的所有合法 X 坐标
  const positions = [];

  for (let x = 0; x <= maxX; x++) {
    positions.push(x);
  }

  return positions;
};

export default getValidXPositions;
