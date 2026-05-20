import collision from '@/lib/ai/utils/collision.js';
import simulatePlacement from '@/lib/ai/simulator/simulate-placement.js';

/**
 * # 模拟方块硬降
 *
 * 将给定形状的方块从指定水平位置下落到底部， 返回下落后的棋盘状态和最终 Y 坐标。
 *
 * ## 下落逻辑
 *
 * 1. 从 y = 0 开始，逐步增加 y 值
 * 2. 每次检查 y + 1 位置是否会发生碰撞
 * 3. 当 y + 1 位置发生碰撞时，停止下落，当前 y 为最终位置
 * 4. 调用 `simulatePlacement` 将方块写入最终位置
 * 5. 返回新棋盘和最终 Y 坐标
 *
 * ## 不可变性
 *
 * - 函数不会修改传入的原始 `board`
 * - 通过 `simulatePlacement` 内部的 `cloneBoard` 创建深拷贝后再写入方块
 * - 返回的棋盘是一个全新的独立副本
 *
 * @example
 *   const board = createEmptyBoard();
 *   const shape = [
 *     [0, 1, 0],
 *     [1, 1, 1],
 *   ]; // T 型方块
 *   const result = simulateDrop(board, shape, 3);
 *   // result.y = 18（高度为 2 的方块停在最底部）
 *   // result.board 包含已写入方块的新棋盘
 *
 * @function simulateDrop
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {number[][]} shape - 方块形状矩阵，1 为实心，0 为空
 * @param {number} startX - 方块左上角的起始 X 坐标（列偏移）
 * @returns {{ board: number[][]; y: number }} 包含结果棋盘和最终 Y 坐标的对象
 */
const simulateDrop = (board, shape, startX) => {
  // 从顶部开始，逐步下移直到碰撞
  let y = 0;

  // 检查 y + 1 位置是否碰撞，如果 y + 1 不碰撞，说明还可以继续下落
  while (!collision(board, shape, startX, y + 1)) {
    y += 1;
  }

  // 使用 simulatePlacement 将方块写入最终位置（内部会深拷贝棋盘）
  const nextBoard = simulatePlacement(board, shape, startX, y);

  return {
    board: nextBoard,
    y,
  };
};

export default simulateDrop;
