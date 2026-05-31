/**
 * ## 重置锁定延迟计时器
 *
 * 从 Store 读取更新后的 curr 对象， 将其 _lockTimer 归零，为 Lock Delay 机制提供重置。
 *
 * @param {object} runtime - 运行时对象
 */
const resetLockDelay = (runtime) => {
  const { curr: updatedCurr } = runtime.Store.getState();

  if (updatedCurr?._lockTimer) {
    updatedCurr._lockTimer = 0;
  }
};

export default resetLockDelay;
