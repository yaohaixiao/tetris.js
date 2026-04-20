import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';

/**
 * # 渲染全屏遮罩层（Overlay）
 *
 * 在当前画布上绘制一个覆盖全屏的矩形遮罩， 常用于 UI 强调、暂停界面、弹窗背景或场景过渡效果。
 *
 * 特性：
 *
 * - 覆盖整个游戏画布
 * - 支持自定义颜色
 * - 默认使用 RGBA_BLACK 半透明黑色
 *
 * @function renderOverlay
 * @param {string} [color] - 遮罩颜色（rgba / hex / css color）
 * @returns {void}
 */
const renderOverlay = (color) => {
  const { RGBA_BLACK } = COLORS;
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;

  ctx.save();

  // 使用传入颜色，否则使用默认黑色遮罩
  ctx.fillStyle = color || RGBA_BLACK;

  // 覆盖整个画布
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
};

export default renderOverlay;
