import Canvas from '@/lib/ui/core/canvas.js';

const renderClockHands = (radius, angles, theme) => {
  const { gameBoardContext: ctx } = Canvas;
  const { hAng, mAng, sAng } = angles;

  // 时针
  ctx.save();
  ctx.rotate(hAng);
  ctx.lineWidth = 5;
  ctx.strokeStyle = theme.stroke;
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
