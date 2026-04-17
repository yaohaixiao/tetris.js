import COLORS from '../constants/colors.js';
import GAME from '../constants/game.js';
import Canvas from './canvas.js';
import clearBoard from './clear-board.js';
import renderTetrisText from './render-tetris-text.js';

/**
 * # 绘制倒计时
 *
 * 绘制倒计时 3 2 1 动画界面
 *
 * @function renderCountdown
 * @param {object} state - Countdown 控制器的 state 数据
 * @returns {void}
 */
const renderCountdown = (state) => {
  const { YELLOW, BLACK, RGBA_BLACK, GREEN } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = Canvas;
  const { width, height } = gameBoard;
  const { scale, number } = state;

  clearBoard();

  ctx.save();
  ctx.fillStyle = RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  renderTetrisText();

  /* ======== 绘制数字：缩放动画（黄色）======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);
  // 设置数字样式
  ctx.font = `${fontSize * 3.25}px ${FONT_FAMILY}`;
  ctx.fillStyle = YELLOW;
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 6;
  ctx.strokeText(number.toString(), 0, 0);
  ctx.fillText(number.toString(), 0, 0);
  ctx.restore();

  /* ======== 绘制文字：GET READY!（绿色）======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  // 固定字体大小，不再跟着 scale 变
  ctx.font = `${fontSize * 1.1}px ${FONT_FAMILY}`;
  ctx.fillStyle = GREEN;
  ctx.strokeStyle = BLACK;
  ctx.strokeText('GET READY!', width / 2, height / 1.46);
  ctx.fillText('GET READY!', width / 2, height / 1.46);
  ctx.restore();

  ctx.restore();
};

export default renderCountdown;
