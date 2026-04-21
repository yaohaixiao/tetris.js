import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import getClockAngles from '@/lib/ui/effects/utils/get-clock-angles.js';
import renderChineseHourAnimalImage from '@/lib/ui/image/render-chinese-hour-animal-image.js';

/**
 * # 渲染模拟时钟（Analog Clock）
 *
 * 特点：
 *
 * - 表盘 + 刻度 + 三指针
 * - HUD 风格视觉组件
 */
const renderAnalogClock = () => {
  const time = new Date();

  const { hAng, mAng, sAng } = getClockAngles(time);

  const { TEAL, RGBA_TEAL, ORANGE } = COLORS;
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;

  const centerX = width / 2;
  const centerY = height / 2.2;
  const radius = Math.floor(width * 0.3);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.lineCap = 'round';

  /* ===== 表盘 ===== */
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = RGBA_TEAL;
  ctx.fill();

  ctx.lineWidth = Math.floor(width * 0.06);
  ctx.strokeStyle = TEAL;
  ctx.stroke();

  /* ===== 12 时辰文字 ===== */
  renderChineseHourAnimalImage();

  /* ===== 刻度 ===== */
  const dotRadius = Math.floor(width * 0.016);
  const dotDistance = radius - Math.floor(width * 0.08);

  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 6);
    ctx.beginPath();
    ctx.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = TEAL;
    ctx.fill();
    ctx.restore();
  }

  /* ===== 时针 ===== */
  ctx.save();
  ctx.rotate(hAng);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.4);
  ctx.stroke();
  ctx.restore();

  /* ===== 分针 ===== */
  ctx.save();
  ctx.rotate(mAng);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.65);
  ctx.stroke();
  ctx.restore();

  /* ===== 秒针 ===== */
  ctx.save();
  ctx.rotate(sAng);
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.75);
  ctx.stroke();
  ctx.restore();

  /* ===== 中心点 ===== */
  ctx.beginPath();
  ctx.fillStyle = ORANGE;
  ctx.arc(0, 0, Math.floor(width * 0.014), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export default renderAnalogClock;
