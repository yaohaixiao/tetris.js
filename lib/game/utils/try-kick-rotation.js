import collision from '@/lib/game/logic/collision.js';
import applyRotation from '@/lib/game/utils/apply-rotation.js';

/**
 * ## 尝试通过 SRS 墙踢偏移应用旋转
 *
 * 遍历 SRS 墙踢偏移表中的每个偏移位置， 使用旋转后的形状依次进行碰撞检测。 找到第一个无碰撞的位置后，应用旋转和坐标偏移。
 *
 * ## 坐标系转换
 *
 * SRS 标准中 Y 轴正方向向上，游戏坐标系中 Y 轴正方向向下。 因此每个偏移量的 Y 值需要取反：`offsetY = -oy`。
 *
 * ## 偏移尝试顺序
 *
 * 按照 tests 数组中的顺序依次尝试（通常 5 个）， 第一个通过碰撞检测的位置即为最终结果。 所有偏移都失败则返回 false。
 *
 * @param {object} runtime - 游戏运行时对象
 * @param {object} runtime.Store - 游戏状态存储
 * @param {object} curr - 旋转前的方块对象
 * @param {number[][]} rotated - 旋转后的形状矩阵
 * @param {number} newRotation - 新的 rotation 状态值（0-3）
 * @param {number[][]} tests - 墙踢偏移表，格式 [[ox, oy], ...]
 * @returns {boolean} 是否成功找到有效偏移并应用旋转
 */
const tryKickRotation = (runtime, curr, rotated, newRotation, tests) => {
  // 获取旋转前的棋盘坐标
  const { cx, cy } = runtime.Store.getState();

  for (const [ox, oy] of tests) {
    // SRS 标准 Y 轴向上，游戏坐标系 Y 轴向下，需取反
    const offsetX = ox;
    const offsetY = -oy;

    // 使用旋转后的形状检测偏移位置是否合法
    if (!collision(runtime, offsetX, offsetY, rotated)) {
      // 找到有效偏移，应用旋转和坐标更新
      applyRotation(
        runtime.Store,
        curr,
        rotated,
        newRotation,
        cx + offsetX,
        cy + offsetY,
      );
      return true;
    }
  }

  // 所有偏移位置都有碰撞
  return false;
};

export default tryKickRotation;
