import collision from '@/lib/game/logic/collision.js';
import { AudioEvents } from '@/lib/events/event-catalog.js';

/**
 * # 移动当前方块
 *
 * 尝试将当前活动方块按指定的偏移量移动（左右/下）。 移动前会进行碰撞检测，只有无碰撞时才执行实际移动并更新坐标。
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
 * ## 软降计分
 *
 * 垂直向下移动（`oy > 0`）且非硬降时，每次移动 +1 分。 硬降另有独立的计分逻辑，此处通过 `isHardDrop` 参数排除。
 *
 * @param {object} runtime - 游戏运行时对象
 * @param {object} runtime.Store - 状态管理 Store 实例
 * @param {Function} runtime.Store.getState - 获取当前状态的方法
 * @param {Function} runtime.Store.setState - 更新状态的方法
 * @param {Function} runtime.Store.getScore - 获取当前分数的方法
 * @param {Function} runtime.emit - 事件发射方法
 * @param {number} ox - X 轴偏移量（-1 左移，1 右移，0 不动）
 * @param {number} oy - Y 轴偏移量（1 下移，0 不动）
 * @param {boolean} [isHardDrop=false] - 是否为硬降移动，为 true 时不重复计算软降分数. Default is
 *   `false`
 * @returns {boolean} 移动成功返回 true，碰撞无法移动返回 false
 */
const move = (runtime, ox, oy, isHardDrop = false) => {
  /*
   * ==================== 获取当前坐标 ====================
   *
   * 从 Store 中读取方块当前位置
   */
  const { Store } = runtime;
  const state = Store.getState();
  const AE = AudioEvents();
  let { cx, cy } = state;

  /*
   * ==================== 碰撞检测 ====================
   *
   * 检查目标位置是否合法。无碰撞则更新坐标，有碰撞则放弃移动
   */
  if (!collision(runtime, ox, oy)) {
    /*
     * ==================== 更新坐标 ====================
     *
     * 将偏移量应用到当前坐标
     */
    cx += ox;
    cy += oy;

    Store.setState({ cx, cy });

    /*
     * ==================== 软降计分 ====================
     *
     * 仅垂直向下移动（oy > 0）且非硬降时，每次 +1 分
     */
    if (oy > 0 && !isHardDrop) {
      Store.setState({ score: Store.getScore() + 1 });
    }

    /*
     * ==================== 重置锁定延迟计时器 ====================
     *
     * 移动成功后重置 _lockTimer，方块触底后通过左右移动可延长可操作时间
     * （Lock Delay 机制）
     */
    const { curr } = Store.getState();

    if (curr._lockTimer) {
      curr._lockTimer = 0;
    }

    /*
     * ==================== 播放移动音效 ====================
     *
     * 通知音频系统播放方块移动的声音效果
     */
    runtime.emit(AE.PLAY_SOUND, { sound: 'MOVE' });

    return true;
  }

  /*
   * ==================== 移动失败 ====================
   *
   * 目标位置发生碰撞，无法移动，返回 false
   */
  return false;
};

export default move;
