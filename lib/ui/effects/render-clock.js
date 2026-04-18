import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';

const renderClock = () => {
  const time = new Date();
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();

  const { TEAL, RGBA_TEAL, ORANGE } = COLORS;
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;
  const centerX = width / 2;
  const centerY = height / 2.2;
  const radius = Math.floor(width * 0.25);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.lineCap = 'round';

  ctx.strokeStyle = TEAL;
  ctx.fillStyle = TEAL;

  /* ======== 绘制内圈（青色）======== */
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = Math.floor(width * 0.064);
  ctx.stroke();
  ctx.restore();

  /* ======== 绘制表盘（青色半透明）======== */
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  // 半透明：rgba(青色, 透明度0.1~0.5 都好看)
  ctx.fillStyle = RGBA_TEAL;
  ctx.fill();
  ctx.restore();

  /* ======== 绘制12个刻度（青色：小圆点样式 + 内缩间距）======== */
  const dotRadius = Math.floor(width * 0.016); // 圆点大小
  const dotMargin = Math.floor(width * 0.08); // 圆点离开内圈的间距（可自行调整）
  const dotDistance = radius - dotMargin; // 圆点到中心的距离

  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 6);
    // 画实心小圆点
    ctx.beginPath();
    ctx.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ======== 绘制时针（青色）======== */
  const hAng = ((h % 12) + m / 60 + s / 3600) * ((2 * Math.PI) / 12);

  ctx.save();
  ctx.rotate(hAng);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.4);
  ctx.stroke();
  ctx.restore();

  /* ======== 绘制分针（青色）======== */
  const mAng = (m + s / 60) * ((2 * Math.PI) / 60);

  ctx.save();
  ctx.rotate(mAng);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.65);
  ctx.stroke();
  ctx.restore();

  /* ======== 绘制秒针（橙色）======== */
  const sAng = s * ((2 * Math.PI) / 60);
  ctx.save();
  ctx.rotate(sAng);
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.75);
  ctx.stroke();
  ctx.restore();

  /* ======== 绘制中心圆点（青色）======== */
  const pointRadius = Math.floor(width * 0.014);
  ctx.save();
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.arc(0, 0, pointRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
};

export default renderClock;
