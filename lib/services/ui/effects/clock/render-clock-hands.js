/**
 * # 渲染时钟指针（Hour / Minute / Second Hands）
 *
 * 根据角度绘制模拟时钟的三根指针。 每根指针使用独立的 Canvas 变换状态，避免相互影响。
 *
 * ## 指针规格
 *
 * | 指针 | 长度（半径比例） | 线宽 | 颜色             |
 * | ---- | ---------------- | ---- | ---------------- |
 * | 时针 | 40%              | 5px  | theme.stroke     |
 * | 分针 | 65%              | 4px  | theme.stroke     |
 * | 秒针 | 75%              | 2px  | theme.secondHand |
 *
 * ## 绘制方式
 *
 * 每根指针从圆心（0, 0）向 12 点方向（-y）绘制， 通过 `ctx.rotate()` 旋转到对应角度。
 *
 * @function renderClockHands
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {number} radius - 时钟半径（像素），用于计算指针长度
 * @param {object} angles - 各指针的角度（弧度）
 * @param {object} theme - 主题配置对象
 * @returns {void}
 */
const renderClockHands = (canvas, radius, angles, theme) => {
  const { gameBoardContext: ctx } = canvas;
  const { hAng, mAng, sAng } = angles;

  // ===== 时针 =====
  ctx.save();
  // 旋转到时针角度
  ctx.rotate(hAng);
  // 线宽 5px
  ctx.lineWidth = 5;
  ctx.strokeStyle = theme.stroke;
  // 从圆心向 12 点方向绘制，长度 = 半径 × 40%
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.4);
  ctx.stroke();
  ctx.restore();

  // ===== 分针 =====
  ctx.save();
  // 旋转到分针角度
  ctx.rotate(mAng);
  // 线宽 4px
  ctx.lineWidth = 4;
  ctx.strokeStyle = theme.stroke;
  // 从圆心向 12 点方向绘制，长度 = 半径 × 65%
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.65);
  ctx.stroke();
  ctx.restore();

  // ===== 秒针 =====
  ctx.save();
  // 旋转到秒针角度
  ctx.rotate(sAng);
  // 线宽 2px
  ctx.lineWidth = 2;
  // 使用独立的秒针颜色
  ctx.strokeStyle = theme.secondHand;
  // 从圆心向 12 点方向绘制，长度 = 半径 × 75%
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.75);
  ctx.stroke();
  ctx.restore();
};

export default renderClockHands;
