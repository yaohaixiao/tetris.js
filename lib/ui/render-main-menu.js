import COLORS from '@/lib/constants/colors.js';
import GAME from '@/lib/game/constants/game.js';
import Canvas from '@/lib/ui/canvas.js';
import clearBoard from '@/lib/ui/clear-board.js';
import renderTetrisText from '@/lib/ui/render-tetris-text.js';
import renderEnterStartText from '@/lib/ui/render-enter-start-text.js';

/**
 * # 绘制游戏难度选择界面
 *
 * 显示当前选择的等级、操作提示文本，居中展示在游戏主画布
 *
 * @function renderMainMenu
 * @param {number} level - 当前选中的游戏难度等级
 * @returns {void}
 */
const renderMainMenu = (level) => {
  const { RGBA_BLACK, GREEN, WHITE } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = Canvas;
  const { width, height } = gameBoard;

  // 清空画布，准备绘制等级选择界面
  clearBoard();

  ctx.save();
  // 半透明遮罩层
  ctx.fillStyle = RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  renderTetrisText();

  /* ======== 绘制文本：LEVEL（绿色）======== */
  ctx.save();
  // 设置文本居中对齐
  ctx.textAlign = 'center';
  // 设置像素风格字体与大小
  ctx.font = `${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = GREEN;
  ctx.fillText('LEVEL', width / 2, height * 0.35);
  ctx.restore();

  /* ======== 绘制文本：选中的等级数字（绿色）======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${fontSize * 3}px ${FONT_FAMILY}`;
  ctx.fillStyle = GREEN;
  ctx.fillText(level.toString(), width / 2, height * 0.5);
  ctx.restore();

  /* ======== 绘制文本：1-9 快捷键（白色）======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = WHITE;
  ctx.fillText('1-9 or T KEY', width / 2, height * 0.58);
  ctx.restore();

  /* ======== 绘制文本：ENTER START（蓝色）======== */
  renderEnterStartText();

  ctx.restore();
};

export default renderMainMenu;
