import collision from '@/lib/game/logic/collision.js';

/**
 * ============================================================
 *
 * # 计算 Ghost 方块投影位置
 *
 * ============================================================
 *
 * 从当前方块位置 (cx, cy) 开始逐行向下检测碰撞， 找到能到达的最底行，作为半透明 Ghost 方块的渲染 Y 坐标。
 *
 * Ghost 方块是俄罗斯方块的常见辅助功能， 用半透明样式显示方块将落到的位置，帮助玩家预判落点。
 *
 * ## 算法
 *
 * 从当前 cy 开始，每次向下移动一行， 调用 collision(0, 1) 检测碰撞， 直到碰撞为止。 碰撞前最后一个合法位置即为 ghostY。
 *
 * ## 边界情况
 *
 * - 无活动方块（curr 为 null）时返回 null
 * - 方块已触底时 ghostY 等于当前 cy
 *
 * @function getGhostPosition
 * @param {object} runtime - 游戏运行时对象
 * @returns {{ cx: number; cy: number } | null} Ghost 方块的坐标，无活动方块时返回 null
 */
const getGhostPosition = (runtime) => {
  const { Store } = runtime;
  const state = Store.getState();
  const { curr, cx, cy } = state;

  // 无活动方块，返回 null
  if (!curr) {
    return null;
  }

  // 逐行下移检测碰撞
  let ghostY = cy;

  while (!collision(runtime, 0, ghostY - cy + 1)) {
    ghostY++;
  }

  // 返回 Ghost 坐标
  return { cx, cy: ghostY };
};

export default getGhostPosition;
