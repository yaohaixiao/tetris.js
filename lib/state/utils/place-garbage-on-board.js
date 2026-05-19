import generateGarbageRows from '@/lib/state/utils/generate-garbage-rows.js';

/**
 * # 将垃圾行写入棋盘底部
 *
 * 在棋盘底部生成并放置指定数量的随机垃圾行， 用于根据游戏难度预填充棋盘。
 *
 * ## 处理流程
 *
 * 1. 检查垃圾行数量是否有效（> 0）
 * 2. 调用 `generateGarbageRows` 生成随机垃圾行
 * 3. 从棋盘底部开始，用生成的垃圾行覆盖对应位置
 *
 * ## 注意事项
 *
 * - **直接修改传入的 board 数组**，不创建新数组
 * - 垃圾行从底部向上放置（如 3 行垃圾则覆盖最后 3 行）
 * - 每行通过 `[...garbageRows[i]]` 浅拷贝写入，避免引用共享
 *
 * @example
 *   // 在 20x10 棋盘底部放置 3 行垃圾
 *   const board = Array.from({ length: 20 }, () => Array(10).fill(''));
 *   placeGarbageOnBoard(board, 3, 10);
 *   // board[17]、board[18]、board[19] 被替换为随机垃圾行
 *
 * @function placeGarbageOnBoard
 * @param {string[][]} board - 棋盘二维数组（会被直接修改）
 * @param {number} garbageRowCount - 要放置的垃圾行数量
 * @param {number} cols - 棋盘列数
 * @returns {void}
 */
const placeGarbageOnBoard = (board, garbageRowCount, cols) => {
  const rows = board.length;

  // 无效数量，直接返回
  if (garbageRowCount <= 0) return;

  // 生成随机垃圾行
  const garbageRows = generateGarbageRows(garbageRowCount, cols);

  // 计算起始行（从底部向上放置）
  const startRow = rows - garbageRowCount;

  // 逐行覆盖
  for (let i = 0; i < garbageRows.length; i++) {
    if (startRow + i >= 0) {
      // 浅拷贝每行，避免后续修改污染生成的垃圾行
      board[startRow + i] = [...garbageRows[i]];
    }
  }
};

export default placeGarbageOnBoard;
