import collision from '@/lib/game/logic/collision.js';
import applyRotation from '@/lib/game/logic/rotate/apply-rotation.js';
import resetLockDelay from '@/lib/game/logic/rotate/reset-lock-delay.js';

/**
 * # 尝试原地旋转（无偏移）
 *
 * 当 SRS 墙踢的所有偏移位置都失败后，在方块当前位置尝试直接旋转（偏移为 0, 0）。
 *
 * 这是墙踢失败后的兜底方案。如果原地旋转也失败，则放弃本次旋转操作， 方块保持原有形状和位置不变。
 *
 * ## 与 tryKickRotation 的关系
 *
 * | 函数                | 偏移     | 优先级 | 说明               |
 * | ------------------- | -------- | ------ | ------------------ |
 * | `tryKickRotation`   | SRS 偏移 | 先     | 遍历 5 个偏移位置  |
 * | `tryNormalRotation` | (0, 0)   | 后     | 墙踢全部失败后尝试 |
 *
 * @param {object} runtime - 游戏运行时对象
 * @param {object} runtime.Store - 游戏状态存储实例
 * @param {object} curr - 旋转前的方块对象
 * @param {number[][]} rotated - 旋转后的形状矩阵
 * @param {number} newRotation - 新的旋转状态值（0-3）
 * @returns {boolean} 是否成功应用旋转
 */
const tryNormalRotation = (runtime, curr, rotated, newRotation) => {
  /*
   * ==================== 原地碰撞检测 ====================
   *
   * 在当前位置（偏移 0, 0）检测旋转后的形状是否与棋盘或边界碰撞
   */
  if (!collision(runtime, 0, 0, rotated)) {
    /*
     * ==================== 应用旋转 ====================
     *
     * 原地旋转合法，更新方块形状和旋转状态（坐标保持不变）
     */
    applyRotation(runtime.Store, curr, rotated, newRotation);

    /*
     * ==================== 重置锁定延迟 ====================
     *
     * 旋转成功后重置锁定计时器，延长玩家可操作时间
     */
    resetLockDelay(runtime);
    return true;
  }

  /*
   * ==================== 原地旋转失败 ====================
   *
   * 当前位置也无法旋转，放弃本次旋转操作
   */
  return false;
};

export default tryNormalRotation;
