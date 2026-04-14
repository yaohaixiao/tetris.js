import COLORS from '../constants/colors.js';
import GAME from '../constants/game.js';
import Canvas from './canvas.js';
import formatTime from '../utils/format-time.js';

const drawDigitalTime = () => {
  const { GREEN, WHITE } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext, fontSize } = Canvas;
  const { width, height } = gameBoard;
  const time = formatTime(new Date(), 'HH:mm:ss');

  gameBoardContext.save();
  // 设置文字样式：黄色、居中、像素字体
  gameBoardContext.fillStyle = GREEN;
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 0.86}px ${FONT_FAMILY}`;
  // 居中绘制暂停文字
  gameBoardContext.fillText(`${time}`, width / 2, height / 3.65);
  // 添加阴影
  gameBoardContext.shadowColor = WHITE;
  gameBoardContext.shadowBlur = 13; // 轻微模糊，保留像素感
  gameBoardContext.shadowOffsetX = 2; // 向右偏移2px
  gameBoardContext.shadowOffsetY = 2; // 向下偏移2px
  gameBoardContext.restore();
};

export default drawDigitalTime;
