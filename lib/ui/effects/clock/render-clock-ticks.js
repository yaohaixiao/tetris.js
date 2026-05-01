import Canvas from '@/lib/ui/core/canvas.js';

/**
 * # 渲染时钟刻度（Ticks）
 *
 * 在时钟表盘上绘制 12 个均匀分布的刻度点（小时刻度）。
 *
 * 实现方式：
 *
 * - 通过旋转 canvas 坐标系
 * - 在圆周固定半径位置绘制小圆点
 *
 * @function renderClockTicks
 * @param {number} radius - 时钟半径
 * @param {object} theme - 主题配置
 * @param {string} theme.stroke - 刻度颜色
 * @returns {void}
 */
const renderClockTicks = (radius, theme) => {
  const { gameBoardContext: ctx } = Canvas;

  // 刻度点半径（根据整体大小自适应）
  const dotRadius = Math.floor(radius * 0.06);

  // 刻度点距离中心的半径（略小于外圈）
  const dotDistance = radius - Math.floor(radius * 0.25);

  // 绘制 12 个刻度点（每 30° 一个）
  for (let i = 0; i < 12; i++) {
    ctx.save();

    // 旋转到对应刻度角度
    ctx.rotate((i * Math.PI) / 6);

    // 开始绘制刻度点
    ctx.beginPath();

    // 在圆周上绘制圆点
    ctx.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);

    // 设置填充颜色（使用主题边框色）
    ctx.fillStyle = theme.stroke;

    // 填充刻度点
    ctx.fill();

    // 恢复画布状态
    ctx.restore();
  }
};

export default renderClockTicks;
