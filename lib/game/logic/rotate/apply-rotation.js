/**
 * ============================================================
 *
 * # 应用旋转到 Store
 *
 * ============================================================
 *
 * 将旋转后的形状、rotation 状态以及可选的坐标偏移写入 Store。
 *
 * 旋转成功后调用，为 Lock Delay 机制提供重置功能， 延长方块触底后的可操作时间。
 *
 * @function applyRotation
 * @param {object} Store - 游戏状态存储
 * @param {object} curr - 旋转前的方块对象
 * @param {number[][]} rotated - 旋转后的形状矩阵
 * @param {number} newRotation - 新的 rotation 状态值（0-3）
 * @param {number} [cx] - 墙踢偏移后的 X 坐标
 * @param {number} [cy] - 墙踢偏移后的 Y 坐标
 * @returns {void}
 */
const applyRotation = (Store, curr, rotated, newRotation, cx, cy) => {
  // 构建 setState 的更新对象
  const updates = {
    curr: { ...curr, shape: rotated, rotation: newRotation },
  };

  // 墙踢偏移成功时，同步更新方块的棋盘坐标
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
