import COLORS from '../constants/colors.js';
import GAME from '../constants/game.js';
import Canvas from './canvas.js';
import drawTetrisText from './draw-tetris-text.js';
import drawEnterStartText from './draw-enter-start-text.js';

/**
 * # 绘制游戏结束界面
 *
 * 先绘制最终棋盘，再添加半透明遮罩，居中显示红色 GAME OVER 文字
 *
 * @function drawOver
 * @returns {void}
 */
const drawOver = () => {
  const { RGBA_BLACK, RED, YELLOW } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext, fontSize } = Canvas;
  const { width, height } = gameBoard;

  // 绘制全屏半透明黑色遮罩
  gameBoardContext.fillStyle = RGBA_BLACK;
  gameBoardContext.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  drawTetrisText();

  /* ======== 绘制文本：GAME（红色）======== */
  gameBoardContext.save();
  // 设置文字样式：红色、居中、像素字体
  gameBoardContext.fillStyle = RED;
  gameBoardContext.strokeStyle = YELLOW;
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 2.3}px ${FONT_FAMILY}`;
  gameBoardContext.strokeText('GAME', width / 2, height / 2.2);
  gameBoardContext.fillText('GAME', width / 2, height / 2.2);
  gameBoardContext.restore();

  /* ======== 绘制文本：OVER（红色）======== */
  gameBoardContext.save();
  // 设置文字样式：红色、居中、像素字体
  gameBoardContext.fillStyle = RED;
  gameBoardContext.strokeStyle = YELLOW;
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 2.3}px ${FONT_FAMILY}`;
  gameBoardContext.strokeText('OVER', width / 2, height / 1.8);
  gameBoardContext.fillText('OVER', width / 2, height / 1.8);
  gameBoardContext.restore();

  /* ======== 绘制文本：ENTER START（蓝色）======== */
  drawEnterStartText();
};

export default drawOver;
