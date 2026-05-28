// lib/game/logic/move.js

import collision from '@/lib/game/logic/collision.js';
import { AudioEvents } from '@/lib/events/event-catalog.js';

/**
 * # 移动当前方块
 *
 * 尝试将当前活动方块按指定的偏移量移动（左右/下）。 移动前会进行碰撞检测，只有无碰撞时才执行实际移动。
 *
 * ## 移动方向
 *
 * | ox  | oy  | 方向 | 说明                          |
 * | --- | --- | ---- | ----------------------------- |
 * | -1  | 0   | 左移 | 玩家按 ← 键                   |
 * | 1   | 0   | 右移 | 玩家按 → 键                   |
 * | 0   | 1   | 下移 | 玩家按 ↓ 键（软降）或自动下落 |
 * | 0   | 0   | 不动 | 无实际操作                    |
 *
 * ## 处理流程
 *
 * | 步骤 | 操作         | 说明                           |
 * | ---- | ------------ | ------------------------------ |
 * | 1    | 获取当前坐标 | 读取 Store 中的 cx、cy         |
 * | 2    | 碰撞检测     | 调用 `collision` 检查目标位置  |
 * | 3    | 无碰撞       | 更新坐标 + 重置锁定延迟 + 音效 |
 * | 4    | 有碰撞       | 不更新坐标 → 返回 false        |
 *
 * ## 锁定延迟重置
 *
 * 移动成功后，重置方块上的锁定延迟计时器 `curr._lockTimer`， 给予玩家更多的操作时间（用于 Lock Delay 机制）。
 *
 * @example
 *   move(game, -1, 0); // 左移
 *   move(game, 0, 1); // 下移（软降）
 *
 * @function move
 * @param {object} runtime - 游戏运行时对象
 * @param {number} ox - X 轴偏移量（-1 左移，1 右移，0 不动）
 * @param {number} oy - Y 轴偏移量（1 下移，0 不动）
 * @returns {boolean} 移动成功返回 true，碰撞无法移动返回 false
 */
const move = (runtime, ox, oy) => {
  const { Store } = runtime;
  const state = Store.getState();
  const AE = AudioEvents();
  let { cx, cy } = state;

  /**
   * ======== 碰撞检测 ========
   *
   * 检查目标位置是否合法。无碰撞则更新坐标，有碰撞则放弃移动。
   */
  if (!collision(runtime, ox, oy)) {
    // 更新坐标
    cx += ox;
    cy += oy;

    Store.setState({ cx, cy });

    /**
     * 移动成功，重置锁定延迟计时器。
     *
     * 方块触底后通过左右移动可以延长可操作时间（Lock Delay 机制）。
     */
    const { curr } = Store.getState();
    if (curr._lockTimer) {
      curr._lockTimer = 0;
    }

    // 播放移动音效
    runtime.emit(AE.PLAY_SOUND, { sound: 'MOVE' });

    return true;
  }

  // 发生碰撞，无法移动
  return false;
};

export default move;
