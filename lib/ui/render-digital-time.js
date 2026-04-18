import COLORS from '../constants/colors.js';
import GAME from '../game/constants/game.js';
import Canvas from './canvas.js';
import formatTime from '../utils/format-time.js';

const renderDigitalTime = () => {
  const { GREEN, WHITE } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = Canvas;
  const { width, height } = gameBoard;
  const time = formatTime(new Date(), 'HH:mm:ss');

  ctx.save();
  // 设置文字样式：黄色、居中、像素字体
  ctx.fillStyle = GREEN;
  ctx.textAlign = 'center';
  ctx.font = `${fontSize * 0.86}px ${FONT_FAMILY}`;
  // 居中绘制暂停文字
  ctx.fillText(`${time}`, width / 2, height / 3.65);
  // 添加阴影
  ctx.shadowColor = WHITE;
  ctx.shadowBlur = 13; // 轻微模糊，保留像素感
  ctx.shadowOffsetX = 2; // 向右偏移2px
  ctx.shadowOffsetY = 2; // 向下偏移2px
  ctx.restore();
};

export default renderDigitalTime;
