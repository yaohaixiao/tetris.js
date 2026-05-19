/**
 * # 渲染时钟刻度（Ticks）
 *
 * 在模拟时钟表盘上绘制 12 个均匀分布的刻度点， 代表 12 个小时位置。
 *
 * ## 实现方式
 *
 * - 通过旋转 Canvas 坐标系绘制每个刻度点
 * - 每个刻度点间隔 30°（360° ÷ 12）
 * - 刻度点位于表盘外圈内侧
 *
 * ## 视觉规格
 *
 * - **刻度点半径**：时钟半径 × 6%
 * - **刻度距离圆心**：时钟半径 - 25%（略小于外圈）
 * - **颜色**：使用主题的 `stroke` 颜色
 *
 * @function renderClockTicks
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {number} radius - 时钟半径（像素）
 * @param {object} theme - 主题配置对象
 * @returns {void}
 */
const renderClockTicks = (canvas, radius, theme) => {
  const { gameBoardContext: ctx } = canvas;

  // 刻度点半径（根据时钟半径自适应）
  const dotRadius = Math.floor(radius * 0.06);

  // 刻度点距圆心的距离（略小于外圈，留出边框空间）
  const dotDistance = radius - Math.floor(radius * 0.25);

  // 绘制 12 个刻度点（每 30° 一个，对应 12 个小时位置）
  for (let i = 0; i < 12; i++) {
    ctx.save();

    // 旋转到对应的小时角度（i × 30° = i × π/6 弧度）
    ctx.rotate((i * Math.PI) / 6);

    // 开始绘制刻度点
    ctx.beginPath();

    // 在圆周上绘制圆形刻度点（12 点方向）
    ctx.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);

    // 设置填充颜色（使用主题边框色保持视觉统一）
    ctx.fillStyle = theme.stroke;

    // 填充刻度点
    ctx.fill();

    // 恢复画布状态
    ctx.restore();
  }
};

export default renderClockTicks;
