/**
 * ============================================================
 *
 * # 渲染烟花粒子效果
 *
 * ============================================================
 *
 * 绘制所有烟花粒子并更新其运动状态。 每个粒子以圆形呈现，向外扩散并逐渐淡出。
 *
 * ## 粒子属性
 *
 * | 属性   | 说明                           |
 * | :----- | :----------------------------- |
 * | x, y   | 粒子当前坐标                   |
 * | vx, vy | 粒子速度分量                   |
 * | radius | 粒子半径                       |
 * | color  | 粒子颜色                       |
 * | alpha  | 透明度（1=不透明，0=完全透明） |
 *
 * ## 注意事项
 *
 * - 视觉绘制和状态更新耦合在一起
 * - 渲染结束后恢复 globalAlpha 为 1，避免污染后续绘制
 *
 * @function renderFireworks
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object[]} fireworks - 烟花粒子数组
 * @returns {void}
 */
const renderFireworks = (canvas, fireworks) => {
  const { gameBoardContext: ctx } = canvas;

  // 遍历所有烟花粒子
  for (const fire of fireworks) {
    // 设置粒子透明度和颜色
    ctx.globalAlpha = fire.alpha;
    ctx.fillStyle = fire.color;

    // 绘制圆形粒子
    ctx.beginPath();
    ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
    ctx.fill();

    // 更新粒子位置（向外扩散）
    fire.x += fire.vx;
    fire.y += fire.vy;

    // 衰减透明度（淡出效果）
    fire.alpha -= 0.024;
  }

  // 恢复全局透明度，避免污染后续绘制
  ctx.globalAlpha = 1;
};

export default renderFireworks;
