import COLORS from '../constants/colors.js';
import GAME from '../constants/game.js';
import Canvas from './canvas.js';
import clearBoard from './clear-board.js';
import drawTetrisText from './draw-tetris-text.js';
import drawEnterStartText from './draw-enter-start-text.js';

/**
 * # 绘制游戏难度选择界面
 *
 * 显示当前选择的等级、操作提示文本，居中展示在游戏主画布
 *
 * @function drawLevelSelect
 * @param {number} level - 当前选中的游戏难度等级
 * @returns {void}
 */
const drawLevelSelect = (level) => {
  const { RGBA_BLACK, GREEN, WHITE } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext, fontSize } = Canvas;
  const { width, height } = gameBoard;

  // 清空画布，准备绘制等级选择界面
  clearBoard();

  gameBoardContext.save();
  // 半透明遮罩层
  gameBoardContext.fillStyle = RGBA_BLACK;
  gameBoardContext.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  drawTetrisText();

  /* ======== 绘制文本：LEVEL（绿色）======== */
  gameBoardContext.save();
  // 设置文本居中对齐
  gameBoardContext.textAlign = 'center';
  // 设置像素风格字体与大小
  gameBoardContext.font = `${fontSize}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = GREEN;
  gameBoardContext.fillText('LEVEL', width / 2, height * 0.35);
  gameBoardContext.restore();

  /* ======== 绘制文本：选中的等级数字（绿色）======== */
  gameBoardContext.save();
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 3}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = GREEN;
  gameBoardContext.fillText(level.toString(), width / 2, height * 0.5);
  gameBoardContext.restore();

  /* ======== 绘制文本：1-9 快捷键（白色）======== */
  gameBoardContext.save();
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = WHITE;
  gameBoardContext.fillText('1-9 KEY', width / 2, height * 0.58);
  gameBoardContext.restore();

  /* ======== 绘制文本：ENTER START（蓝色）======== */
  drawEnterStartText();

  /* ======== 绘制文本：P 3SEC: HIDDEN（白色） ======== */
  gameBoardContext.save();
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 0.9}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = WHITE;
  gameBoardContext.fillText('P 3SEC: HIDDEN', width / 2, height * 0.8);
  gameBoardContext.restore();

  gameBoardContext.restore();
};

export default drawLevelSelect;
