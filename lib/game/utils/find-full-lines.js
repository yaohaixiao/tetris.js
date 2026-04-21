/**
 * # 查找满行（Find Full Lines）
 *
 * ## 功能说明
 *
 * 遍历棋盘每一行，检测是否为“满行”（即所有格子都有方块） 并返回所有需要被消除的行索引。
 *
 * ## 判断规则
 *
 * 使用 `Array.every(Boolean)`：
 *
 * - 只要该行没有 0 / null / undefined
 * - 即认为该行是“满行”
 *
 * ## 用途
 *
 * - 消行检测（Clear Lines）
 * - 连锁判断（Gravity 后二次检测）
 * - 分数计算依据
 *
 * @param {(number | string)[][]} board - 游戏棋盘二维数组
 * @returns {number[]} Lines - 满行的行索引数组（从上到下）
 */
const findFullLines = (board) => {
  /**
   * 存储所有满行的索引
   *
   * 示例：[18, 19] 表示第18和19行需要消除
   */
  const lines = [];

  // 遍历每一行（按 Y 轴）
  for (let y = 0; y < board.length; y++) {
    /**
     * 判断该行是否“全非空”
     *
     * Every(Boolean) 等价于：
     *
     * - 0 / null / undefined / "" → false
     * - 有值 → true
     */
    if (board[y].every(Boolean)) {
      lines.push(y);
    }
  }

  // 返回所有满行
  return lines;
};

export default findFullLines;
