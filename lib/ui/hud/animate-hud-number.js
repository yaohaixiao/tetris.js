/**
 * # HUD 数值动画器（基于 requestAnimationFrame）
 *
 * 用于在 UI 中对数值进行平滑过渡动画，例如：
 *
 * - Score 增长动画
 * - Level 切换动画
 * - Combo / counter 动画
 *
 * 实现方式：
 *
 * - 基于 requestAnimationFrame
 * - 使用线性插值（lerp）
 * - 支持 duration 控制动画时长
 *
 * @function animateHUDNumber
 * @param {number} from - 起始数值
 * @param {number} to - 目标数值
 * @param {number} duration - 动画持续时间（ms）
 * @param {Function} onUpdate - 每帧回调 (value, rafId)
 * @param {Function} [onComplete] - 动画完成回调
 * @returns {{ cancel: Function } | null} - 可取消动画的控制器
 */
const animateHUDNumber = (from, to, duration, onUpdate, onComplete) => {
  let rafId = null;

  // ======== 无变化直接退出 ========
  if (from === to) {
    return null;
  }

  let elapsed = 0;
  let lastTimestamp = 0;

  const step = (timestamp) => {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    elapsed += delta;

    // ======== 进度（0 ~ 1） ========
    const progress = Math.min(elapsed / duration, 1);

    // ======== 线性插值 ========
    const value = Math.floor(from + (to - from) * progress);

    // ======== 每帧更新 ========
    onUpdate(value, rafId);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      cancelAnimationFrame(rafId);
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(step);

  // ======== 返回控制器（可取消动画） ========
  return {
    cancel: () => cancelAnimationFrame(rafId),
  };
};

export default animateHUDNumber;
