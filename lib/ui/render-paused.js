import COLORS from '@/lib/constants/colors.js';
import GAME from '@/lib/game/constants/game.js';
import Canvas from '@/lib/ui/canvas.js';
import renderTetrisText from '@/lib/ui/render-tetris-text.js';
import renderDigitalTime from '@/lib/ui/render-digital-time.js';
import renderClock from '@/lib/ui/render-clock.js';

/**
 * # 绘制游戏暂停界面
 *
 * 全屏半透明遮罩 + 居中显示 PAUSED 文字
 *
 * @function renderPaused
 * @returns {void}
 */
const renderPaused = () => {
  const { RGBA_BLACK, YELLOW, WHITE } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = Canvas;
  const { width, height } = gameBoard;

  // 绘制半透明黑色遮罩覆盖整个画布
  ctx.fillStyle = RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  renderTetrisText();

  /* ======== 绘制电子时间（青色）======== */
  renderDigitalTime();

  /* ======== 绘制时钟（青色）======== */
  renderClock();

  /* ======== 绘制文本：PAUSED（黄色）======== */
  ctx.save();
  // 设置文字样式：黄色、居中、像素字体
  ctx.fillStyle = YELLOW;
  ctx.textAlign = 'center';
  ctx.font = `${fontSize * 1.6}px ${FONT_FAMILY}`;
  // 居中绘制暂停文字
  ctx.fillText('PAUSED', width / 2, height / 1.45);
  // 添加阴影
  ctx.shadowColor = WHITE;
  ctx.shadowBlur = 13; // 轻微模糊，保留像素感
  ctx.shadowOffsetX = 2; // 向右偏移2px
  ctx.shadowOffsetY = 2; // 向下偏移2px
  ctx.restore();
};

export default renderPaused;
