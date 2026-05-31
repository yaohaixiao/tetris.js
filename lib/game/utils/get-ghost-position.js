import collision from '@/lib/game/logic/collision.js';

/**
 * # 计算 Ghost 方块投影位置
 *
 * 从当前方块位置 (cx, cy) 开始逐行向下检测碰撞， 找到能到达的最底行，作为半透明 Ghost 的渲染 Y 坐标。
 *
 * ## 算法
 *
 * 从 cy 开始，每次 cy+1 调用 collision(0, 1)，直到碰撞为止。 碰撞前最后一个合法位置即为 ghostY。
 *
 * @function getGhostPosition
 * @param {object} runtime - 游戏运行时对象
 * @returns {{ cx: number; cy: number } | null} Ghost 的 (cx, cy)，无活动方块时返回 null
 */
const getGhostPosition = (runtime) => {
  const { Store } = runtime;
  const state = Store.getState();
  const { curr, cx, cy } = state;

  if (!curr) {
    return null;
  }

  let ghostY = cy;

  // 逐行下移直到碰撞
  while (!collision(runtime, 0, ghostY - cy + 1)) {
    ghostY++;
  }

  return { cx, cy: ghostY };
};

export default getGhostPosition;
