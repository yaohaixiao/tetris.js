import getNextPiece from '@/lib/game/utils/get-next-piece.js';
import collision from '@/lib/game/logic/collision.js';
import over from '@/lib/game/core/over.js';
import { ReplayEvents, UIEvents } from '@/lib/events/event-catalog.js';

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
 * - 游戏开始时（`begin`）
 * - 每次消行完成后（`clearLines` → `applyClearLines` → `spawn`）
 * - 硬降完成后（`drop`）
 * - 自动下落锁定后（`tick` → `lock` → `spawn`）
 *
 * @function spawn
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const spawn = (runtime) => {
  const { id, Elements, Store } = runtime;
  const { cols } = Elements.Main;

  /**
   * ======== 步骤 1：获取方块 ========
   *
   * 从预览队列中取出下一个方块作为当前活动方块， 同时生成新的预览方块。
   */
  const { curr, next } = getNextPiece(runtime);

  // 无可用方块时直接返回
  if (!curr) {
    return;
  }

  /**
   * ======== 步骤 2：更新状态 ========
   *
   * 设置当前方块和预览方块， X 坐标居中对齐，Y 坐标从顶部（第 0 行）开始。
   */
  Store.setState({
    curr,
    next,
    cx: Math.floor(cols / 2) - Math.floor(curr.shape[0].length / 2),
    cy: 0,
  });

  const state = Store.getState();

  /**
   * ======== 步骤 3：出生碰撞检测 ========
   *
   * 新方块在出生点就与已有方块重叠，说明棋盘已堆满。
   */
  if (collision(runtime, 0, 0)) {
    /** ======== 步骤 4：游戏结束 ======== */
    over(runtime);
    return;
  }

  const UE = UIEvents(id);
  const RE = ReplayEvents(id);

  /**
   * ======== 步骤 5：渲染预览 ========
   *
   * 通知 UI 层更新右侧预览方块显示。
   */
  runtime.emit(UE.RENDER_NEXT_PIECE, { state });

  /**
   * ======== 步骤 6：录制回放 ========
   *
   * 将方块数据写入回放序列，确保回放时能还原相同的方块顺序。
   */
  runtime.emit(RE.ADD_PIECE, state.curr);
};

export default spawn;
