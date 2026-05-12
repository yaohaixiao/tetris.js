/**
 * # 渲染烟花粒子效果（Fireworks Particle Renderer）
 *
 * 该函数负责绘制并推进烟花粒子动画：
 *
 * - 绘制圆形粒子
 * - 更新粒子位置（vx / vy）
 * - 衰减透明度（alpha）
 *
 * 特点：
 *
 * - 视觉 + 状态更新耦合（当前实现）
 * - 基于 Canvas 2D API
 * - 用于游戏特效层（FX layer）
 *
 * @function renderFireworks
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {Array} fireworks - 烟花粒子数组
 * @returns {void}
 */
const renderFireworks = (canvas, fireworks) => {
  const { gameBoardContext: ctx } = canvas;

  // ======== 绘制 + 更新粒子 ========
  for (const fire of fireworks) {
    // 临时设置透明效果
    ctx.globalAlpha = fire.alpha;
    ctx.fillStyle = fire.color;

    ctx.beginPath();
    ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
    ctx.fill();

    // ======== 粒子运动（扩散）========
    fire.x += fire.vx;
    fire.y += fire.vy;

    // ======== 衰减透明度 ========
    fire.alpha -= 0.024;
  }

  // 避免污染后续绘制
  ctx.globalAlpha = 1;
};

export default renderFireworks;
