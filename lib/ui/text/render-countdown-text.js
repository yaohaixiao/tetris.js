import COLORS from '@/lib/constants/colors.js';
import GAME from '@/lib/game/constants/game.js';
import Canvas from '@/lib/ui/core/canvas.js';

/**
 * 渲染倒计时数字（Countdown Text）
 *
 * 用于 3-2-1 开始动画等场景
 *
 * 特点：
 *
 * - 居中显示（translate 到中心）
 * - 支持缩放（scale）
 * - 填充 + 描边（增强视觉冲击）
 *
 * @function renderCountdownText
 * @param {number} count - 当前倒计时数字
 * @param {number} [scale=1] - 缩放比例（用于动画）. Default is `1`
 * @returns {void}
 */
const renderCountdownText = (count, scale = 1) => {
  const { YELLOW, BLACK } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = Canvas;
  const { width, height } = gameBoard;

  ctx.save();

  // ======== 坐标系移动到中心 ========
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(width / 2, height / 2);

  // ======== 缩放（用于动画） ========
  ctx.scale(scale, scale);

  // ======== 文本样式 ========
  ctx.font = `${fontSize * 3.25}px ${FONT_FAMILY}`;
  ctx.fillStyle = YELLOW;
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 6;

  const text = String(count);

  // ======== 描边 + 填充 ========
  ctx.strokeText(text, 0, 0);
  ctx.fillText(text, 0, 0);

  ctx.restore();
};

export default renderCountdownText;
