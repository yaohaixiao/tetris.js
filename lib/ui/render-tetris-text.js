import COLORS from '../constants/colors.js';
import GAME from '../game/constants/game.js';
import Canvas from './canvas.js';

const renderTetrisText = () => {
  const { GREEN } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = Canvas;
  const { width, height } = gameBoard;

  /* ======== 绘制文本：TETRIS.JS（绿色） ======== */
  ctx.save();
  // 设置文本居中对齐
  ctx.textAlign = 'center';
  // 设置像素风格字体与大小
  ctx.font = `${fontSize * 1.1}px ${FONT_FAMILY}`;
  ctx.fillStyle = GREEN;
  ctx.fillText('TETRIS.JS', width / 2, height * 0.1);
  ctx.restore();
};

export default renderTetrisText;
