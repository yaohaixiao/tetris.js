import collision from '@/lib/game/logic/collision.js';
import applyRotation from '@/lib/game/logic/rotate/apply-rotation.js';
import resetLockDelay from '@/lib/game/logic/rotate/reset-lock-delay.js';

/**
 * # 尝试通过 SRS 墙踢偏移应用旋转
 *
 * 遍历 SRS 墙踢偏移表中的每个偏移位置，使用旋转后的形状依次进行碰撞检测。 找到第一个无碰撞的位置后，应用旋转和坐标偏移，并重置锁定延迟。
 *
 * ## 坐标系转换
 *
 * SRS 标准中 Y 轴正方向向上，游戏坐标系中 Y 轴正方向向下。 因此每个偏移量的 Y 值需要取反：`offsetY = -oy`。
 *
 * ## 偏移尝试顺序
 *
 * 按照 tests 数组中的顺序依次尝试（通常 5 个偏移位置）， 第一个通过碰撞检测的位置即为最终结果。 所有偏移都失败则返回 false，旋转不生效。
 *
 * @param {object} runtime - 游戏运行时对象
 * @param {object} runtime.Store - 游戏状态存储实例
 * @param {object} curr - 旋转前的方块对象
 * @param {number} curr.cx - 方块的 X 坐标（在 tryKickRotation 内部从 Store 重新获取）
 * @param {number} curr.cy - 方块的 Y 坐标（在 tryKickRotation 内部从 Store 重新获取）
 * @param {number[][]} rotated - 旋转后的形状矩阵
 * @param {number} newRotation - 新的旋转状态值（0-3）
 * @param {number[][]} tests - 墙踢偏移表，格式 [[ox, oy], ...]
 * @returns {boolean} 是否成功找到有效偏移并应用旋转
 */
const tryKickRotation = (runtime, curr, rotated, newRotation, tests) => {
  /*
   * ==================== 获取当前方块坐标 ====================
   *
   * 从 Store 中读取旋转前的方块坐标，作为偏移计算的基准位置
   */
  const { cx, cy } = runtime.Store.getState();

  /*
   * ==================== 遍历墙踢偏移表 ====================
   *
   * 按 SRS 标准顺序依次尝试每个偏移位置，
   * 找到第一个无碰撞的位置后立即应用并返回
   */
  for (const [ox, oy] of tests) {
    /*
     * ==================== 坐标系转换 ====================
     *
     * SRS 标准 Y 轴向上为正，游戏坐标系 Y 轴向下为正，需取反
     */
    const offsetX = ox;
    const offsetY = -oy;

    /*
     * ==================== 碰撞检测 ====================
     *
     * 使用旋转后的形状检测偏移后的位置是否合法
     */
    if (!collision(runtime, offsetX, offsetY, rotated)) {
      /*
       * ==================== 应用旋转 ====================
       *
       * 找到有效偏移位置，更新方块形状、旋转状态和坐标
       */
      applyRotation(
        runtime.Store,
        curr,
        rotated,
        newRotation,
        cx + offsetX,
        cy + offsetY,
      );

      /*
       * ==================== 重置锁定延迟 ====================
       *
       * 旋转成功后重置锁定计时器，延长玩家可操作时间
       */
      resetLockDelay(runtime);
      return true;
    }
  }

  /*
   * ==================== 所有偏移位置均失败 ====================
   *
   * 墙踢表全部尝试完毕，无合法位置，旋转失败
   */
  return false;
};

export default tryKickRotation;
