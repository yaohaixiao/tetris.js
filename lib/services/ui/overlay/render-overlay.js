import COLORS from '@/lib/constants/colors.js';

/**
 * # 渲染全屏遮罩层（Overlay）
 *
 * 在当前画布上绘制一个覆盖全屏的矩形遮罩， 常用于 UI 强调、暂停界面、弹窗背景或场景过渡效果。
 *
 * ## 特性
 *
 * - 覆盖整个游戏画布
 * - 支持自定义颜色
 * - 默认使用 `RGBA_BLACK`（半透明黑色）
 *
 * @example
 *   // 使用默认黑色遮罩
 *   renderOverlay(canvas);
 *
 *   // 使用自定义颜色遮罩
 *   renderOverlay(canvas, 'rgba(0, 0, 255, 0.5)');
 *
 * @function renderOverlay
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {string} [color] - 遮罩颜色（rgba / hex / css color），默认使用半透明黑色
 * @returns {void}
 */
const renderOverlay = (canvas, color) => {
  const { RGBA_BLACK } = COLORS;
  const { gameBoard, gameBoardContext: ctx } = canvas;
  const { width, height } = gameBoard;

  // 保存当前绘图状态
  ctx.save();

  // 使用传入颜色，否则使用默认半透明黑色遮罩
  ctx.fillStyle = color || RGBA_BLACK;
  // 覆盖整个画布
  ctx.fillRect(0, 0, width, height);

  // 恢复之前的绘图状态
  ctx.restore();
};

export default renderOverlay;
