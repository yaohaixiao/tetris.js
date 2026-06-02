/**
 * # 碰撞检测
 *
 * 检测方块在指定偏移位置是否与棋盘边界或已有方块发生碰撞。
 *
 * ## 检测逻辑
 *
 * 1. 遍历方块形状矩阵的每个格子
 * 2. 跳过空格子（值为 0 或 falsy 的格子）
 * 3. 对每个实心格子，计算其在棋盘上的绝对坐标
 * 4. 检查是否满足以下碰撞条件：
 *
 *    - 超出左边界（bx < 0）
 *    - 超出右边界（bx >= 列数）
 *    - 超出底部（by >= 行数）
 *    - 与已有方块重叠（board[by][bx] 非空）
 * 5. 允许方块顶部超出棋盘（by < 0），不视为碰撞
 *
 * ## 使用场景
 *
 * - `simulateDrop`：AI 模拟硬降时，循环下移直到碰撞
 * - `generateMoves`：生成候选动作时的合法性检查
 *
 * @example
 *   // 检测 T 型方块在 (3, 5) 位置是否碰撞
 *   const board = createEmptyBoard();
 *   const shape = [
 *     [0, 1, 0],
 *     [1, 1, 1],
 *   ];
 *   const isColliding = collision(board, shape, 3, 5);
 *
 * @function collision
 * @param {object} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {object} shape - 方块形状矩阵，1 为实心，0 为空
 * @param {number} offsetX - 方块左上角的 X 坐标（列偏移）
 * @param {number} offsetY - 方块左上角的 Y 坐标（行偏移）
 * @returns {boolean} 发生碰撞返回 true，否则返回 false
 */
const collision = (board, shape, offsetX, offsetY) => {
  // 遍历形状矩阵的每一行
  for (let y = 0; y < shape.length; y += 1) {
    // 遍历形状矩阵的每一列
    for (let x = 0; x < shape[y].length; x += 1) {
      // 空格子跳过，不参与碰撞检测
      if (!shape[y][x]) {
        continue;
      }

      // 计算该格子在棋盘上的绝对坐标
      const bx = offsetX + x;
      const by = offsetY + y;

      // 检查水平边界和底部边界：注意：不检查顶部越界（by < 0），允许方块部分在顶部上方
      if (bx < 0 || bx >= board[0].length || by >= board.length) {
        return true;
      }

      // 检查是否与已有方块重叠：by >= 0 确保不访问负数索引（顶部上方的情况）
      if (by >= 0 && board[by][bx]) {
        return true;
      }
    }
  }

  // 所有实心格子都合法，无碰撞
  return false;
};

export default collision;
