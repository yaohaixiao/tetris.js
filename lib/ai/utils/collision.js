/**
 * ============================================================
 *
 * # 碰撞检测
 *
 * ============================================================
 *
 * 检测方块在指定偏移位置是否与棋盘边界或已有方块发生碰撞。
 *
 * ## 检测逻辑
 *
 * 1. 遍历方块形状矩阵的每个格子
 * 2. 跳过空格子（值为 0 或 falsy）
 * 3. 对每个实心格子，计算其在棋盘上的绝对坐标
 * 4. 检查是否超出左/右/底部边界，或与已有方块重叠
 * 5. 允许方块顶部超出棋盘（by < 0），不视为碰撞
 *
 * ## 使用场景
 *
 * - SimulateDrop：AI 模拟硬降时，循环下移直到碰撞
 * - GenerateMoves：生成候选动作时的合法性检查
 *
 * @function collision
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {number[][]} shape - 方块形状矩阵，1 为实心，0 为空
 * @param {number} offsetX - 方块左上角的 X 坐标
 * @param {number} offsetY - 方块左上角的 Y 坐标
 * @returns {boolean} 发生碰撞返回 true，否则返回 false
 */
const collision = (board, shape, offsetX, offsetY) => {
  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) {
        continue;
      }

      const bx = offsetX + x;
      const by = offsetY + y;

      // 检查边界碰撞（不检查顶部越界）
      if (bx < 0 || bx >= board[0].length || by >= board.length) {
        return true;
      }

      // 检查与已有方块重叠
      if (by >= 0 && board[by][bx]) {
        return true;
      }
    }
  }

  return false;
};

export default collision;
