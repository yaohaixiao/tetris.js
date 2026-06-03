/**
 * # 获取所有合法的水平位置
 *
 * 根据棋盘宽度和方块形状宽度，计算出方块在棋盘上所有可以放置的 X 坐标。
 *
 * 合法范围：从 0 到 `boardWidth - shapeWidth`（包含两端）， 确保方块不会超出棋盘左右边界。
 *
 * @param {number[][]} board - 游戏棋盘（二维数组，取第一行长度作为棋盘宽度）
 * @param {number[][]} shape - 方块形状矩阵（取第一行长度作为方块宽度）
 * @returns {number[]} 所有合法的 X 坐标数组，按从左到右的顺序排列
 */
const getValidXPositions = (board, shape) => {
  /*
   * ==================== 计算边界参数 ====================
   *
   * boardWidth  — 棋盘的总列数
   * shapeWidth  — 方块的列数
   * maxX        — 方块能放置的最右 X 坐标（包含）
   */
  const boardWidth = board[0].length;
  const shapeWidth = shape[0].length;
  const maxX = boardWidth - shapeWidth;

  /*
   * ==================== 生成合法 X 坐标列表 ====================
   *
   * 从 0 遍历到 maxX，每个位置都合法（不检查纵向碰撞，由后续逻辑处理）
   */
  const positions = [];

  for (let x = 0; x <= maxX; x++) {
    positions.push(x);
  }

  return positions;
};

export default getValidXPositions;
