import Canvas from '@/lib/ui/core/canvas.js';

const renderFireworks = (state) => {
  const { gameBoardContext: ctx } = Canvas;

  /* ======== 绘制烟花（五颜六色）======== */
  for (const fire of state.fireworks) {
    ctx.globalAlpha = fire.alpha;
    ctx.fillStyle = fire.color;
    ctx.beginPath();
    ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
    ctx.fill();

    // 粒子向外扩散，形成中心爆炸效果
    fire.x += fire.vx;
    fire.y += fire.vy;
    fire.alpha -= 0.024;
  }
};

export default renderFireworks;
