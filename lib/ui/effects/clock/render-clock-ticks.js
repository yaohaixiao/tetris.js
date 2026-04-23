import Canvas from '@/lib/ui/core/canvas.js';

const renderClockTicks = (radius, theme) => {
  const { gameBoardContext: ctx } = Canvas;

  const dotRadius = Math.floor(radius * 0.06);
  const dotDistance = radius - Math.floor(radius * 0.25);

  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 6);

    ctx.beginPath();
    ctx.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = theme.stroke;
    ctx.fill();

    ctx.restore();
  }
};

export default renderClockTicks;
