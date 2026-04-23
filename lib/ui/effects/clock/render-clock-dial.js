import Canvas from '@/lib/ui/core/canvas.js';

const renderClockDial = (radius, theme) => {
  const { gameBoardContext: ctx } = Canvas;

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = theme.face;
  ctx.fill();

  ctx.lineWidth = Math.floor(radius * 0.2);
  ctx.strokeStyle = theme.stroke;
  ctx.stroke();
  ctx.restore();
};

export default renderClockDial;
