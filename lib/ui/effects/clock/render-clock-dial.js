import Canvas from '@/lib/ui/core/canvas.js';

/**
 * # 渲染时钟表盘（Dial）
 *
 * 绘制时钟的主体表盘，包括：
 *
 * - 外圆填充
 * - 外圈描边
 *
 * @function renderClockDial
 * @param {number} radius - 表盘半径
 * @param {object} theme - 主题配置
 * @param {string} theme.face - 表盘填充颜色
 * @param {string} theme.stroke - 表盘边框颜色
 * @returns {void}
 */
const renderClockDial = (radius, theme) => {
  const { gameBoardContext: ctx } = Canvas;

  // 保存当前画布状态，避免污染外部绘制
  ctx.save();

  // 开始路径绘制
  ctx.beginPath();

  // 绘制圆形表盘
  ctx.arc(0, 0, radius, 0, Math.PI * 2);

  // 填充表盘背景色
  ctx.fillStyle = theme.face;
  ctx.fill();

  // 设置描边宽度（根据半径自适应）
  ctx.lineWidth = Math.floor(radius * 0.2);

  // 设置描边颜色
  ctx.strokeStyle = theme.stroke;

  // 绘制表盘边框
  ctx.stroke();

  // 恢复画布状态
  ctx.restore();
};

export default renderClockDial;
