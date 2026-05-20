import cloneBoard from '@/lib/ai/utils/clone-board.js';

/**
 * # 模拟方块放置到棋盘
 *
 * 在给定棋盘的深拷贝副本上，将指定形状的方块"放置"到指定偏移位置。 与 `simulateDrop` 不同，本函数**不模拟下落过程**，
 * 而是直接将方块写入任意给定的 (offsetX, offsetY) 位置。
 *
 * ## 核心逻辑
 *
 * 1. 调用 `cloneBoard` 创建棋盘的深拷贝，确保不修改原始棋盘
 * 2. 遍历方块形状矩阵的每个格子
 * 3. 跳过形状中的空格子（值为 0 或 falsy 的格子）
 * 4. 对每个实心格子，计算其在棋盘上的绝对坐标 (bx, by)
 * 5. 如果坐标在棋盘范围内（by >= 0 且 by < 行数），将该格子标记为已占用（写入 1）
 * 6. 返回修改后的棋盘副本
 *
 * ## 边界处理
 *
 * - **顶部越界**（by < 0）：跳过，不写入。允许方块部分在棋盘上方
 * - **底部越界**（by >= 行数）：跳过，不写入。调用方应确保传入合法位置
 * - **左右边界**：调用方应确保 offsetX + 形状宽度 ≤ 棋盘列数
 *
 * ## 不可变性
 *
 * 函数不会修改传入的原始 `board`，始终返回一个新的棋盘副本。
 *
 * ## 使用场景
 *
 * - `simulateDrop`：在找到下落终点后，调用本函数将方块固化到棋盘
 * - `generateMoves` 的替代实现：如果需要直接指定放置位置而非模拟下落
 * - AI 搜索算法扩展：如需要回退某步操作时，可基于原始棋盘快速放置
 *
 * @example
 *   const board = createEmptyBoard();
 *   const shape = [
 *     [0, 1, 0],
 *     [1, 1, 1],
 *   ]; // T 型方块
 *   const result = simulatePlacement(board, shape, 3, 18);
 *   // result[18][4] === 1  (shape[0][1] → (3+1, 18+0))
 *   // result[19][3] === 1  (shape[1][0] → (3+0, 18+1))
 *   // result[19][4] === 1  (shape[1][1] → (3+1, 18+1))
 *   // result[19][5] === 1  (shape[1][2] → (3+2, 18+1))
 *   // board 保持不变
 *
 * @function simulatePlacement
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {number[][]} shape - 方块形状矩阵，1 为实心，0 为空
 * @param {number} offsetX - 方块左上角的 X 坐标（列偏移）
 * @param {number} offsetY - 方块左上角的 Y 坐标（行偏移）
 * @returns {number[][]} 放置方块后的新棋盘（深拷贝）
 */
const simulatePlacement = (board, shape, offsetX, offsetY) => {
  // 深拷贝棋盘，避免污染原始数据
  const next = cloneBoard(board);

  // 遍历形状矩阵的每一行
  for (let y = 0; y < shape.length; y++) {
    // 遍历形状矩阵的每一列
    for (let x = 0; x < shape[0].length; x++) {
      // 跳过空格子（值为 0 或 falsy 的格子不参与放置）
      if (!shape[y][x]) continue;

      // 计算该格子在棋盘上的绝对坐标
      const bx = x + offsetX;
      const by = y + offsetY;

      /**
       * 边界保护：只写入棋盘范围内的位置
       *
       * - By >= 0：允许方块部分在顶部上方（跳过不写入）
       * - By < next.length：防止超出底部
       */
      if (by >= 0 && by < next.length) {
        // 在结果棋盘上标记为已占用
        next[by][bx] = 1;
      }
    }
  }

  // 返回修改后的棋盘副本
  return next;
};

export default simulatePlacement;
