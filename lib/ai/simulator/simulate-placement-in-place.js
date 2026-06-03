/**
 * # 模拟方块放置到棋盘（原地修改 + 回滚，零拷贝）
 *
 * 直接在原棋盘上临时写入方块，记录被修改的位置， 评分后回滚到原始状态。避免每次放置都深拷贝棋盘， 大幅减少 GC 压力，提升 AI 搜索速度。
 *
 * ## 使用方式
 *
 * 不返回新棋盘，而是通过回调函数让调用方在棋盘被修改期间评分。 回调执行完毕后自动回滚所有修改。
 *
 * ## 与 simulatePlacement 的区别
 *
 * | 函数                       | 用途                   | 是否拷贝 |
 * | -------------------------- | ---------------------- | -------- |
 * | `simulatePlacement`        | advanceSnapshot 持久化 | 深拷贝   |
 * | `simulatePlacementInPlace` | selfPlay 临时评分      | 零拷贝   |
 *
 * @example
 *   const score = simulatePlacementInPlace(
 *     board,
 *     shape,
 *     x,
 *     y,
 *     (modifiedBoard) => {
 *       return evaluateBoard(modifiedBoard, weights);
 *     },
 *   );
 *   // board 已恢复原样，score 是评分结果
 *
 * @function simulatePlacementInPlace
 * @param {number[][]} board - 棋盘（会被临时修改，评分后自动回滚）
 * @param {number[][]} shape - 方块形状矩阵，1 为实心，0 为空
 * @param {number} offsetX - 方块左上角的 X 坐标（列偏移）
 * @param {number} offsetY - 方块左上角的 Y 坐标（行偏移）
 * @param {Function} callback - 评分回调，接收修改后的棋盘，返回评分
 * @returns {object} - 回调函数的返回值
 */
const simulatePlacementInPlace = (board, shape, offsetX, offsetY, callback) => {
  // 记录所有被修改的位置，用于回滚
  const changes = [];

  /**
   * 原地写入方块，记录每个被修改格子的原始值
   *
   * 跳过形状中的空格子（值为 0）。 跳过棋盘外的格子（by < 0 或 by >= 行数）。
   */
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (!shape[y][x]) continue;

      const by = offsetY + y;
      const bx = offsetX + x;

      if (by >= 0 && by < board.length) {
        // 记录原始值和位置
        changes.push({ y: by, x: bx, old: board[by][bx] });
        // 写入方块
        board[by][bx] = 1;
      }
    }
  }

  // 调用方在棋盘修改期间评分
  const result = callback(board);

  // 回滚所有修改，恢复棋盘原样
  for (const { y, x, old } of changes) {
    board[y][x] = old;
  }

  return result;
};

export default simulatePlacementInPlace;
