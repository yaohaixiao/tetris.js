import generateGarbageRows from '@/lib/game/state/utils/generate-garbage-rows.js';

/**
 * # 将垃圾行写入棋盘底部
 *
 * 直接修改传入的 board 数组
 *
 * @param {string[][]} board - 棋盘二维数组
 * @param {number} garbageRowCount - 垃圾行数量
 * @param {number} cols - 棋盘列数
 * @returns {void}
 */
const placeGarbageOnBoard = (board, garbageRowCount, cols) => {
  const rows = board.length;

  if (garbageRowCount <= 0) return;

  const garbageRows = generateGarbageRows(garbageRowCount, cols);
  const startRow = rows - garbageRowCount;

  for (let i = 0; i < garbageRows.length; i++) {
    if (startRow + i >= 0) {
      board[startRow + i] = [...garbageRows[i]];
    }
  }
};

export default placeGarbageOnBoard;
