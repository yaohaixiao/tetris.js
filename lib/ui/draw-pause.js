import COLORS from '../constants/colors.js';
import GAME from '../constants/game.js';
import Canvas from './canvas.js';
import GameState from '../state/game-state.js';
import clearBoard from './clear-board.js';
import drawTetrisText from './draw-tetris-text.js';
import drawBoard from './draw-board.js';
import drawCurr from './draw-curr.js';
import drawDigitalTime from './draw-digital-time.js';
import drawClock from './draw-clock.js';

/**
 * # 绘制游戏暂停界面
 *
 * 全屏半透明遮罩 + 居中显示 PAUSED 文字
 *
 * @function drawPause
 * @returns {void}
 */
const drawPause = () => {
  const { RGBA_BLACK, YELLOW, WHITE } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext, fontSize } = Canvas;
  const { width, height } = gameBoard;

  // 清除画布，显示游戏画面
  clearBoard();
  // 重绘游戏方块（保留原界面）
  drawBoard(GameState.board);
  drawCurr(GameState.curr, GameState.cx, GameState.cy);

  // 绘制半透明黑色遮罩覆盖整个画布
  gameBoardContext.fillStyle = RGBA_BLACK;
  gameBoardContext.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  drawTetrisText();

  /* ======== 绘制电子时间（青色）======== */
  drawDigitalTime();

  /* ======== 绘制时钟（青色）======== */
  drawClock();

  /* ======== 绘制文本：PAUSED（黄色）======== */
  gameBoardContext.save();
  // 设置文字样式：黄色、居中、像素字体
  gameBoardContext.fillStyle = YELLOW;
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 1.6}px ${FONT_FAMILY}`;
  // 居中绘制暂停文字
  gameBoardContext.fillText('PAUSED', width / 2, height / 1.45);
  // 添加阴影
  gameBoardContext.shadowColor = WHITE;
  gameBoardContext.shadowBlur = 13; // 轻微模糊，保留像素感
  gameBoardContext.shadowOffsetX = 2; // 向右偏移2px
  gameBoardContext.shadowOffsetY = 2; // 向下偏移2px
  gameBoardContext.restore();
};

export default drawPause;
