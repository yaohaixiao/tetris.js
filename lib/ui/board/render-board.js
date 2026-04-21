import BOARD from '@/lib/ui/constants/board.js';
import Canvas from '@/lib/ui/core/canvas.js';
import clearBoard from '@/lib/ui/board/clear-board.js';
import renderBlock from '@/lib/ui/core/render-block.js';
import renderChineseHourCharacterImage from '@/lib/ui/image/render-chinese-hour-character-image.js';
import renderTempleImage from '@/lib/ui/image/render-temple-image.js';

/**
 * # 绘制面板
 *
 * 渲染并绘制完整的游戏棋盘（核心功能：清空画布 → 遍历棋盘网格 → 绘制所有存在的方块）
 *
 * @function renderBoard
 * @param {string[][]} board - 游戏棋盘二维数组，存储每个格子的颜色值，空值表示无方块
 * @param {object} options - 扩展参数对象
 * @returns {void}
 */
export function renderBoard(board, options = {}) {
  const { ROWS, COLS } = BOARD;
  const { gameBoardContext: ctx } = Canvas;
  const { overrideCells = [] } = options;

  // 清空整个画布
  clearBoard();

  // 绘制庙宇
  renderTempleImage();

  // 绘制12生效
  renderChineseHourCharacterImage();

  // 1. 先构建一个“跳过表”（哪些原始格子不要画）
  const skipMap = new Set();

  for (const cell of overrideCells) {
    // 把原位置标记为不绘制（避免重影）
    if (Number.isInteger(cell.fromY)) {
      skipMap.add(`${cell.x},${cell.fromY}`);
    }
  }

  // 2. 先画静态 board（排除被动画覆盖的）
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!board[y][x]) continue;

      if (skipMap.has(`${x},${y}`)) continue;

      renderBlock(ctx, x, y, board[y][x]);
    }
  }

  // 3. 再画动画层（overrideCells）
  for (const cell of overrideCells) {
    renderBlock(
      ctx,
      cell.x,
      // 这里可以是小数（动画关键！）
      cell.y,
      cell.value,
    );
  }
}

export default renderBoard;
