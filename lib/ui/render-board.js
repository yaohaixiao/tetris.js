import BOARD from './constants/board.js';
import Canvas from './canvas.js';
import clearBoard from './clear-board.js';
import renderBlock from './render-block.js';

/**
 * # 绘制面板
 *
 * 渲染并绘制完整的游戏棋盘（核心功能：清空画布 → 遍历棋盘网格 → 绘制所有存在的方块）
 *
 * @function renderBoard
 * @param {string[][]} board - 游戏棋盘二维数组，存储每个格子的颜色值，空值表示无方块
 * @returns {void}
 */
export function renderBoard(board) {
  const { ROWS, COLS } = BOARD;
  const { gameBoardContext } = Canvas;

  // 清空整个画布
  clearBoard();

  // 双层循环遍历棋盘所有行和列（Y 轴为行，X 轴为列）
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      // 如果当前棋盘格子有颜色值（存在方块），则调用方块绘制函数
      if (board[y][x]) {
        renderBlock(gameBoardContext, x, y, board[y][x]);
      }
    }
  }
}

export default renderBoard;
