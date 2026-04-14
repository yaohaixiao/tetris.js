import COLORS from '../constants/colors.js';
import GAME from '../constants/game.js';
import Canvas from './canvas.js';
import Effects from './effects.js';
import clearBoard from './clear-board.js';
import drawTetrisText from './draw-tetris-text.js';

/**
 * # 绘制倒计时
 *
 * 绘制倒计时 3 2 1 动画界面
 *
 * @function drawCountdownEffect
 * @returns {void}
 */
const drawCountdownEffect = () => {
  const { YELLOW, BLACK, RGBA_BLACK, GREEN } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext, fontSize } = Canvas;
  const { width, height } = gameBoard;
  const effect = Effects.countdown;

  clearBoard();

  gameBoardContext.save();
  gameBoardContext.fillStyle = RGBA_BLACK;
  gameBoardContext.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  drawTetrisText();

  /* ======== 绘制数字：缩放动画（黄色）======== */
  gameBoardContext.save();
  gameBoardContext.textAlign = 'center';
  gameBoardContext.textBaseline = 'middle';
  gameBoardContext.translate(width / 2, height / 2);
  gameBoardContext.scale(effect.scale, effect.scale);
  // 设置数字样式
  gameBoardContext.font = `${fontSize * 3.25}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = YELLOW;
  gameBoardContext.strokeStyle = BLACK;
  gameBoardContext.lineWidth = 6;
  gameBoardContext.strokeText(effect.number.toString(), 0, 0);
  gameBoardContext.fillText(effect.number.toString(), 0, 0);
  gameBoardContext.restore();

  /* ======== 绘制文字：GET READY!（绿色）======== */
  gameBoardContext.save();
  gameBoardContext.textAlign = 'center';
  gameBoardContext.textBaseline = 'top';
  // 固定字体大小，不再跟着 scale 变
  gameBoardContext.font = `${fontSize * 1.1}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = GREEN;
  gameBoardContext.strokeStyle = BLACK;
  gameBoardContext.strokeText('GET READY!', width / 2, height / 1.46);
  gameBoardContext.fillText('GET READY!', width / 2, height / 1.46);
  gameBoardContext.restore();

  gameBoardContext.restore();
};

export default drawCountdownEffect;
