import Canvas from '@/lib/ui/core/canvas.js';

const renderClockCenter = (radius, theme) => {
  const { gameBoardContext: ctx } = Canvas;

  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = theme.secondHand;
  ctx.arc(0, 0, Math.floor(radius * 0.05), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export default renderClockCenter;
