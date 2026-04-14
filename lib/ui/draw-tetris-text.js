import COLORS from '../constants/colors.js';
import GAME from '../constants/game.js';
import Canvas from './canvas.js';

const drawTetrisText = () => {
  const { GREEN } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext, fontSize } = Canvas;
  const { width, height } = gameBoard;

  /* ======== 绘制文本：TETRIS.JS（绿色） ======== */
  gameBoardContext.save();
  // 设置文本居中对齐
  gameBoardContext.textAlign = 'center';
  // 设置像素风格字体与大小
  gameBoardContext.font = `${fontSize * 1.1}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = GREEN;
  gameBoardContext.fillText('TETRIS.JS', width / 2, height * 0.1);
  gameBoardContext.restore();
};

export default drawTetrisText;
