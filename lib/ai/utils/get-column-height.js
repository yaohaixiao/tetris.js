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

export default getColumnHeight;
