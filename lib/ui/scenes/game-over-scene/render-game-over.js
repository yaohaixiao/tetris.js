import COLORS from '@/lib/constants/colors.js';
import GAME from '@/lib/game/constants/game.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderTetrisText from '@/lib/ui/text/render-tetris-text.js';
import renderEnterStartText from '@/lib/ui/text/render-enter-start-text.js';
import renderActiveOnly from '@/lib/ui/board/render-active-only.js';
import clearBoard from '@/lib/ui/board/clear-board.js';

/**
 * # 绘制游戏结束界面
 *
 * 先绘制最终棋盘，再添加半透明遮罩，居中显示红色 GAME OVER 文字
 *
 * @function renderGameOver
 * @returns {void}
 */
const renderGameOver = () => {
  const { RGBA_BLACK, RED, YELLOW } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = Canvas;
  const { width, height } = gameBoard;

  clearBoard();
  renderActiveOnly();

  // 绘制全屏半透明黑色遮罩
  ctx.fillStyle = RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  renderTetrisText();

  /* ======== 绘制文本：GAME（红色）======== */
  ctx.save();
  // 设置文字样式：红色、居中、像素字体
  ctx.fillStyle = RED;
  ctx.strokeStyle = YELLOW;
  ctx.textAlign = 'center';
  ctx.font = `${fontSize * 2.3}px ${FONT_FAMILY}`;
  ctx.strokeText('GAME', width / 2, height / 2.2);
  ctx.fillText('GAME', width / 2, height / 2.2);
  ctx.restore();

  /* ======== 绘制文本：OVER（红色）======== */
  ctx.save();
  // 设置文字样式：红色、居中、像素字体
  ctx.fillStyle = RED;
  ctx.strokeStyle = YELLOW;
  ctx.textAlign = 'center';
  ctx.font = `${fontSize * 2.3}px ${FONT_FAMILY}`;
  ctx.strokeText('OVER', width / 2, height / 1.8);
  ctx.fillText('OVER', width / 2, height / 1.8);
  ctx.restore();

  /* ======== 绘制文本：ENTER START（蓝色）======== */
  renderEnterStartText();
};

export default renderGameOver;
