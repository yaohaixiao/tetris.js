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

export default countHoles;
