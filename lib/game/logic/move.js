import collision from '@/lib/game/logic/collision.js';

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
 * 1. 获取当前方块坐标 (cx, cy)
 * 2. 调用 `collision(game, ox, oy)` 检测目标位置是否合法
 * 3. 无碰撞 → 更新坐标 + 播放移动音效 → 返回 true
 * 4. 有碰撞 → 不更新坐标 → 返回 false
 *
 * ## 返回值用途
 *
 * 返回值用于通知调用方移动是否成功：
 *
 * - `drop()` 根据返回值判断是否继续下落
 * - `tick()` 根据返回值判断是否需要锁定方块
 *
 * @example
 *   // 左移
 *   move(game, -1, 0);
 *
 *   // 下移（软降）
 *   move(game, 0, 1);
 *
 * @function move
 * @param {object} game - 游戏执行上下文
 * @param {number} ox - X 轴偏移量（-1 左移，1 右移，0 不动）
 * @param {number} oy - Y 轴偏移量（1 下移，0 不动）
 * @returns {boolean} 移动成功返回 true，碰撞无法移动返回 false
 */
const move = (game, ox, oy) => {
  const { Store } = game;
  const state = Store.getState();
  let { cx, cy } = state;

  // 无碰撞 → 可以移动
  if (!collision(game, ox, oy)) {
    // 更新坐标
    cx += ox;
    cy += oy;

    Store.setState({
      cx,
      cy,
    });

    // 播放移动音效
    game.emit('audio:resume:sound', { sound: 'MOVE' });

    return true;
  }

  // 发生碰撞，无法移动
  return false;
};

export default move;
