import cloneBoard from '@/lib/ai/utils/clone-board.js';

/**
 * ============================================================
 *
 * # 模拟方块放置到棋盘
 *
 * ============================================================
 *
 * 在给定棋盘的深拷贝副本上，将指定形状的方块直接写入任意给定的 (offsetX, offsetY) 位置。 与 simulateDrop
 * 不同，本函数不模拟下落过程。
 *
 * ## 核心逻辑
 *
 * 1. 深拷贝棋盘，确保不修改原始棋盘
 * 2. 遍历方块形状矩阵的每个格子
 * 3. 跳过空格子（值为 0 或 falsy）
 * 4. 对每个实心格子，计算其在棋盘上的绝对坐标
 * 5. 在范围内的格子写入 1 标记已占用
 * 6. 返回修改后的棋盘副本
 *
 * ## 边界处理
 *
 * - 顶部越界（by < 0）：跳过，不写入
 * - 底部越界（by >= 行数）：跳过，不写入
 * - 左右边界：调用方应确保不越界
 *
 * ## 不可变性
 *
 * 函数不会修改传入的原始 board，始终返回一个新的棋盘副本。
 *
 * @function simulatePlacement
 * @param {number[][]} board - 棋盘二维数组
 * @param {number[][]} shape - 方块形状矩阵
 * @param {number} offsetX - 方块左上角的 X 坐标
 * @param {number} offsetY - 方块左上角的 Y 坐标
 * @returns {number[][]} 放置方块后的新棋盘（深拷贝）
 */
const simulatePlacement = (board, shape, offsetX, offsetY) => {
  // 深拷贝棋盘，避免污染原始数据
  const next = cloneBoard(board);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (!shape[y][x]) continue;

      const bx = x + offsetX;
      const by = y + offsetY;

      // 边界保护：只写入棋盘范围内的位置
      if (by >= 0 && by < next.length) {
        next[by][bx] = 1;
      }
    }
  }

  return next;
};

export default simulatePlacement;
