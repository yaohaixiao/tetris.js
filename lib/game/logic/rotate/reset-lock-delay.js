/**
 * ============================================================
 *
 * # 重置锁定延迟计时器
 *
 * ============================================================
 *
 * 从 Store 中读取当前活动方块的 _lockTimer 并将其归零， 为 Lock Delay 机制提供重置功能。
 *
 * Lock Delay 是俄罗斯方块的核心机制之一：方块落地后不会立即锁定， 而是在一段延迟时间内允许玩家继续移动或旋转。
 * 每次成功移动或旋转后需要重置此计时器，延长可操作时间。
 *
 * @function resetLockDelay
 * @param {object} runtime - 运行时对象
 * @returns {void}
 */
const resetLockDelay = (runtime) => {
  // 从 Store 中读取更新后的 curr 对象
  const { curr: updatedCurr } = runtime.Store.getState();

  // 重置锁定计时器
  if (updatedCurr?._lockTimer) {
    updatedCurr._lockTimer = 0;
  }
};

export default resetLockDelay;
