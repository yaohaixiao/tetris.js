import Canvas from '@/lib/ui/core/canvas.js';

/**
 * # 渲染时钟中心点
 *
 * 在时钟中心绘制一个小圆点，用于视觉定位与装饰效果。
 *
 * @function renderClockCenter
 * @param {number} radius - 时钟半径（用于计算中心点大小）
 * @param {object} theme - 主题配置对象
 * @param {string} theme.secondHand - 秒针颜色（用于中心点填充色）
 * @returns {void}
 */
const renderClockCenter = (radius, theme) => {
  const { gameBoardContext: ctx } = Canvas;

  // 保存当前画布状态，避免影响外部绘制
  ctx.save();

  // 开始绘制路径
  ctx.beginPath();

  // 设置填充颜色（使用秒针颜色统一视觉风格）
  ctx.fillStyle = theme.secondHand;

  // 绘制中心圆点（半径 = 时钟半径的 5%）
  ctx.arc(0, 0, Math.floor(radius * 0.05), 0, Math.PI * 2);

  // 填充圆形
  ctx.fill();

  // 恢复画布状态
  ctx.restore();
};

export default renderClockCenter;
