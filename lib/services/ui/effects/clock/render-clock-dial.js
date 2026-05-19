/**
 * # 渲染时钟表盘（Dial）
 *
 * 绘制模拟时钟的主体表盘，包括圆形填充底色和外圈描边。
 *
 * ## 视觉规格
 *
 * - **底色**：使用主题的 `face` 颜色填充
 * - **边框**：使用主题的 `stroke` 颜色描边
 * - **线宽**：根据表盘半径自适应（半径 × 20%）
 *
 * @function renderClockDial
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {number} radius - 表盘半径（像素）
 * @returns {void}
 */
const renderClockDial = (canvas, radius, theme) => {
  const { gameBoardContext: ctx } = canvas;

  // 保存当前画布状态
  ctx.save();

  // 开始绘制圆形路径
  ctx.beginPath();

  // 绘制圆形表盘（以原点为中心，半径为 radius）
  ctx.arc(0, 0, radius, 0, Math.PI * 2);

  // 填充表盘背景色
  ctx.fillStyle = theme.face;
  ctx.fill();

  // 设置描边宽度（根据半径自适应，线宽 = 半径 × 20%）
  ctx.lineWidth = Math.floor(radius * 0.2);

  // 设置描边颜色
  ctx.strokeStyle = theme.stroke;

  // 绘制表盘外圈边框
  ctx.stroke();

  // 恢复画布状态
  ctx.restore();
};

export default renderClockDial;
