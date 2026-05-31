/**
 * ## 应用旋转到 Store，并重置锁定延迟计时器
 *
 * 将旋转后的形状、rotation 状态以及可选的坐标偏移写入 Store， 然后重置方块上的锁定延迟计时器 `_lockTimer`。
 *
 * 旋转成功后调用，为 Lock Delay 机制提供重置功能， 延长方块触底后的可操作时间。
 *
 * @param {object} Store - 游戏状态存储
 * @param {object} curr - 旋转前的方块对象
 * @param {number[][]} rotated - 旋转后的形状矩阵
 * @param {number} newRotation - 新的 rotation 状态值（0-3）
 * @param {number} [cx] - 墙踢偏移后的 X 坐标，原地旋转时不传
 * @param {number} [cy] - 墙踢偏移后的 Y 坐标，原地旋转时不传
 * @returns {void}
 */
const applyRotation = (Store, curr, rotated, newRotation, cx, cy) => {
  /**
   * 构建 setState 的更新对象
   *
   * 基础更新：展开原方块对象，替换 shape 和 rotation。
   */
  const updates = {
    curr: { ...curr, shape: rotated, rotation: newRotation },
  };

  /** 墙踢偏移成功时，同步更新方块的棋盘坐标。 原地旋转时 cx/cy 为 undefined，跳过坐标更新。 */
  if (cx !== undefined) {
    updates.cx = cx;
  }

  if (cy !== undefined) {
    updates.cy = cy;
  }

  // 将旋转结果写入 Store
  Store.setState(updates);
};

export default applyRotation;
