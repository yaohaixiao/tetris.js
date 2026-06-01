/**
 * ## 获取所有合法的水平位置
 *
 * 计算形状在棋盘上所有可以放置的 X 坐标范围。
 *
 * @param {object} board - 游戏棋盘
 * @param {object} shape - 方块形状矩阵
 * @returns {number[]} 所有合法的 X 坐标数组
 */
const getValidXPositions = (board, shape) => {
  const boardWidth = board[0].length;
  const shapeWidth = shape[0].length;
  const maxX = boardWidth - shapeWidth;
  const positions = [];

  for (let x = 0; x <= maxX; x++) {
    positions.push(x);
  }

  return positions;
};

export default getValidXPositions;
