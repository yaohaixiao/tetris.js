import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderBlock from '@/lib/services/ui/block/render-block.js';
import renderChineseHourCharacter from '@/lib/services/ui/image/render-chinese-hour-character.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';

/**
 * ============================================================
 *
 * # 渲染完整游戏棋盘
 *
 * ============================================================
 *
 * 清空画布后，依次绘制场景背景、时辰字符和所有已锁定的方块。 这是棋盘渲染的核心函数，每帧渲染时调用。
 *
 * ## 渲染层级（从底到顶）
 *
 * | 层级 | 操作                         | 说明                       |
 * | :--- | :--------------------------- | :------------------------- |
 * | 1    | clearBoard()                 | 清空画布                   |
 * | 2    | renderChineseHourCharacter() | 绘制当前时辰对应的汉字装饰 |
 * | 3    | renderSceneBackground()      | 绘制 playing 场景背景图标  |
 * | 4    | 遍历棋盘网格                 | 绘制所有已锁定的方块       |
 *
 * ## 注意事项
 *
 * - 只绘制 board[y][x] 有颜色值的格子（已锁定的方块）
 * - 当前活动方块不在此函数中绘制，由 renderActivePieces 单独处理
 *
 * @function renderBoard
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {string[][]} board - 游戏棋盘二维数组， 存储每个格子的颜色值，空值表示无方块
 * @returns {void}
 */
const renderBoard = (canvas, board) => {
  const { rows, cols } = canvas;

  // 1. 清空整个画布
  clearBoard(canvas);

  // 2. 绘制当前时辰对应的汉字装饰
  renderChineseHourCharacter(canvas);

  // 3. 绘制 playing 场景背景图标
  renderSceneBackground(canvas, 'playing');

  // 4. 遍历棋盘所有格子，绘制已锁定的方块
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (board[y][x]) {
        renderBlock(canvas, x, y, board[y][x]);
      }
    }
  }
};

export default renderBoard;
