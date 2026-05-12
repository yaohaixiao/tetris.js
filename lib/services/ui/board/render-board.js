import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderBlock from '@/lib/services/ui/core/render-block.js';
import renderChineseHourCharacter from '@/lib/services/ui/image/render-chinese-hour-character.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';

/**
 * # 绘制面板
 *
 * 渲染并绘制完整的游戏棋盘（核心功能：清空画布 → 遍历棋盘网格 → 绘制所有存在的方块）
 *
 * @function renderBoard
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {string[][]} board - 游戏棋盘二维数组，存储每个格子的颜色值，空值表示无方块
 * @returns {void}
 */
const renderBoard = (canvas, board) => {
  const { rows, cols } = canvas;

  // 清空整个画布
  clearBoard(canvas);

  // 绘制12时辰文字
  renderChineseHourCharacter(canvas);

  // 绘制背景图案
  renderSceneBackground(canvas, 'playing');

  // 双层循环遍历棋盘所有行和列（Y 轴为行，X 轴为列）
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // 如果当前棋盘格子有颜色值（存在方块），则调用方块绘制函数
      if (board[y][x]) {
        renderBlock(canvas, x, y, board[y][x]);
      }
    }
  }
};

export default renderBoard;
