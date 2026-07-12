/**
 * ============================================================
 *
 * # 渲染时钟中心点
 *
 * ============================================================
 *
 * 在时钟中心绘制一个小圆点，用于视觉定位和装饰。 中心点颜色使用秒针颜色，保持视觉统一。
 *
 * ## 尺寸
 *
 * 中心点半径 = 时钟半径 × 5%
 *
 * @function renderClockCenter
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {number} radius - 时钟半径（像素）
 * @param {object} theme - 主题配置对象
 * @param {string} theme.secondHand - 秒针颜色
 * @returns {void}
 */
const renderClockCenter = (canvas, radius, theme) => {
  const { gameBoardContext: ctx } = canvas;

  // 保存当前画布状态
  ctx.save();

  // 开始绘制圆形路径
  ctx.beginPath();

  // 使用秒针颜色作为中心点填充色
  ctx.fillStyle = theme.secondHand;

  // 绘制中心圆点（半径 = 时钟半径的 5%）
  ctx.arc(0, 0, Math.floor(radius * 0.05), 0, Math.PI * 2);

  // 填充圆形
  ctx.fill();

  // 恢复画布状态
  ctx.restore();
};

export default renderClockCenter;
