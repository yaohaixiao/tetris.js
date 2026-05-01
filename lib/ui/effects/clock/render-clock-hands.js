import Canvas from '@/lib/ui/core/canvas.js';

/**
 * # 渲染时钟指针（Hour / Minute / Second Hands）
 *
 * 根据角度绘制三根指针：
 *
 * - 时针（Hour hand）
 * - 分针（Minute hand）
 * - 秒针（Second hand）
 *
 * 每根指针使用独立的 canvas transform 状态，避免相互影响。
 *
 * @function renderClockHands
 * @param {number} radius - 时钟半径（用于计算指针长度）
 * @param {object} angles - 各指针角度
 * @param {number} angles.hAng - 时针角度（弧度）
 * @param {number} angles.mAng - 分针角度（弧度）
 * @param {number} angles.sAng - 秒针角度（弧度）
 * @param {object} theme - 主题配置
 * @param {string} theme.stroke - 时针/分针颜色
 * @param {string} theme.secondHand - 秒针颜色
 * @returns {void}
 */
const renderClockHands = (radius, angles, theme) => {
  const { gameBoardContext: ctx } = Canvas;
  const { hAng, mAng, sAng } = angles;

  // 时针
  ctx.save();

  // 旋转到时针角度
  ctx.rotate(hAng);

  // 样式配置
  ctx.lineWidth = 5;
  ctx.strokeStyle = theme.stroke;

  // 绘制路径
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.4);
  ctx.stroke();

  ctx.restore();

  // 分针
  ctx.save();
  ctx.rotate(mAng);
  ctx.lineWidth = 4;
  ctx.strokeStyle = theme.stroke;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.65);
  ctx.stroke();

  ctx.restore();

  // 秒针
  ctx.save();
  ctx.rotate(sAng);
  ctx.lineWidth = 2;
  ctx.strokeStyle = theme.secondHand;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.75);
  ctx.stroke();

  ctx.restore();
};

export default renderClockHands;
