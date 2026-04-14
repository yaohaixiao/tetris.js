import Effects from './effects.js';
import Canvas from './canvas.js';

const drawFireworksEffect = () => {
  const effect = Effects.levelUp;
  const { gameBoardContext } = Canvas;

  /* ======== 绘制烟花（五颜六色）======== */
  for (const fire of effect.fireworks) {
    gameBoardContext.globalAlpha = fire.alpha;
    gameBoardContext.fillStyle = fire.color;
    gameBoardContext.beginPath();
    gameBoardContext.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
    gameBoardContext.fill();

    // 粒子向外扩散，形成中心爆炸效果
    fire.x += fire.vx;
    fire.y += fire.vy;
    fire.alpha -= 0.024;
  }
};

export default drawFireworksEffect;
