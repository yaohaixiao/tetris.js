import getNextPiece from '@/lib/game/utils/get-next-piece.js';
import collision from '@/lib/game/logic/collision.js';
import over from '@/lib/game/core/over.js';

/**
 * # 生成新方块（Spawn）
 *
 * 将预览方块变为当前活动方块，生成新的预览方块， 并检测出生点是否碰撞（碰撞则游戏结束）。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作            | 说明                                    |
 * | ---- | --------------- | --------------------------------------- |
 * | 1    | 获取方块        | 从预览队列获取当前和下一个方块          |
 * | 2    | 更新状态        | 设置 curr、next、cx（居中）、cy（顶部） |
 * | 3    | 碰撞检测        | 检测出生点是否与已有方块重叠            |
 * | 4    | 碰撞 → 游戏结束 | 调用 over() 结束游戏                    |
 * | 5    | 渲染预览        | 更新右侧预览方块界面                    |
 * | 6    | 录制回放        | 将方块数据写入回放序列                  |
 *
 * ## 方块居中逻辑
 *
 * 新方块的 X 坐标计算公式：
 *
 *     cx = Math.floor(cols / 2) - Math.floor(shape[0].length / 2);
 *
 * 即：棋盘中心 - 方块宽度的一半，确保方块在视觉上居中。
 *
 * ## 出生碰撞
 *
 * 如果新方块在出生点（顶部居中）就与已有方块重叠， 说明棋盘已被堆满，无法继续游戏，触发 Game Over。
 *
 * ## 调用时机
 *
 * - 游戏开始时（begin）
 * - 每次消行完成后（clearLines → applyClearLines → spawn）
 * - 硬降完成后（drop）
 * - 自动下落锁定后（tick → lock → spawn）
 *
 * @function spawn
 * @param {object} game - 游戏执行上下文
 * @returns {void}
 */
const spawn = (game) => {
  const { id, Elements, Store } = game;
  const { cols } = Elements.Main;

  /*
   * 获取当前方块和下一个预览方块
   * curr：下一个要操作的方块
   * next：新生成的预览方块
   */
  const { curr, next } = getNextPiece(game);

  if (!curr) {
    return;
  }

  // 1. 更新游戏状态信息
  Store.setState({
    // 将预览方块设置为当前活动方块
    curr,
    // 随机生成新的预览方块
    next,
    // 水平居中：屏幕中间 - 方块宽度的一半
    cx: Math.floor(cols / 2) - Math.floor(curr.shape[0].length / 2),
    // 垂直位置从顶部开始（第 0 行）
    cy: 0,
  });

  const state = Store.getState();

  // 2. 出生点碰撞检测：如果新方块在出生点就与已有方块重叠 → 游戏结束
  if (collision(game, 0, 0)) {
    over(game);
    return;
  }

  // 3. 更新右侧预览方块界面
  game.emit(`ui:${id}:render:next:piece`, { state });

  // 4. 录制回放：将方块数据写入回放序列，确保回放时能还原相同的方块顺序
  game.emit(`replay:${id}:add:piece`, state.curr);
};

export default spawn;
