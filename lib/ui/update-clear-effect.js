import Effects from './effects.js';

/**
 * # 更新消除行闪烁动画状态
 *
 * 控制每行严格闪烁 3 次（亮 → 暗 → 亮 → 暗 → 亮 → 暗）
 *
 * @function updateClearEffect
 * @returns {boolean} - 所有行闪烁动画是否全部完成，true 表示全部结束
 */
const updateClearEffect = () => {
  const effect = Effects.clear;
  // 标记：所有闪烁动画是否完成
  let allDone = true;

  // 遍历所有正在闪烁的行
  for (const line of effect.lines) {
    // 计算当前动画阶段：每 0.12 秒切换一次亮/暗
    const phase = Math.floor(line.timer / 0.12);

    // 偶数阶段显示（alpha=1），奇数阶段隐藏（alpha=0），实现闪烁效果
    line.alpha = phase % 2 === 0 ? 1 : 0;

    // 推进动画时间（固定 16ms，对应 60fps 游戏帧率）
    line.timer += 0.016;

    // 总时长 0.72 秒 = 0.12s × 6段，刚好完成 3 次完整闪烁
    if (line.timer < 0.72) {
      // 只要有一行未完成，整体标记为未完成
      allDone = false;
    }
  }

  // 返回动画是否全部结束
  return allDone;
};

export default updateClearEffect;
