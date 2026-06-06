import spawn from '@/lib/game/logic/spawn.js';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * # 暂存方块（Hold）
 *
 * 将当前活动方块存入暂存区，取出之前暂存的方块（如有）。 每个方块在一局游戏中只能被 Hold 一次，通过 `_held` 标记防止重复 Hold。
 *
 * ## 交换规则
 *
 * | 情况      | hold 槽 | curr.\_held | 操作                       |
 * | --------- | ------- | ----------- | -------------------------- |
 * | 首次 Hold | null    | false       | curr → hold 槽，生成新方块 |
 * | 交换      | 有值    | false       | curr 与 hold 槽交换        |
 * | 禁止      | 任意    | true        | 什么都不做（已 Hold 过）   |
 *
 * ## 交换后的处理
 *
 * - 交换后新 curr 会被居中放置在棋盘顶部（`cx` 居中，`cy` 归零）
 * - 被 Hold 的方块保留原有的形状和颜色，但位置信息不保留
 * - 操作完成后触发 `RENDER_HOLD_PIECE` 事件更新暂存预览
 *
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const hold = (runtime) => {
  /*
   * ==================== 获取游戏状态 ====================
   *
   * 从 Store 中提取当前方块和暂存方块，从 Elements 中获取棋盘列数
   */
  const { Store, Elements, id } = runtime;
  const state = Store.getState();
  const { curr, hold } = state;
  const { cols } = Elements.Canvas;

  /*
   * ==================== 前置检查：是否允许 Hold ====================
   *
   * 以下情况禁止 Hold：
   * - curr 不存在（没有活动方块）
   * - curr._held 为 true（当前方块已经被 Hold 过）
   */
  if (!curr || curr._held) return;

  /*
   * ==================== Hold 槽有方块：执行交换 ====================
   *
   * 将当前方块与暂存方块互换：
   * - 原 hold 变为新 curr（居中放置，标记 _held 防止立即再次 Hold）
   * - 原 curr 变为新 hold（标记 _held，下次换出时仍然有效）
   */
  if (hold) {
    const newCurr = { ...hold, _held: true };
    const newHold = { ...curr, _held: true };

    Store.setState({
      curr: newCurr,
      hold: newHold,
      /*
       * ==================== 居中放置新方块 ====================
       *
       * X 坐标 = 棋盘宽度的一半 - 方块宽度的一半
       * Y 坐标 = 0（从顶部开始）
       */
      cx: Math.floor(cols / 2) - Math.floor(newCurr.shape[0].length / 2),
      cy: 0,
    });
  } else {
    /*
     * ==================== Hold 槽为空：首次暂存 ====================
     *
     * 将当前方块放入暂存区（标记 _held），然后生成新方块
     */
    Store.setState({
      hold: { ...curr, _held: true },
    });
    spawn(runtime);
  }

  /*
   * ==================== 触发暂存预览更新 ====================
   *
   * 通知 UI 层更新暂存区的方块渲染
   */
  const events = UIEvents(id);
  runtime.emit(events.RENDER_HOLD_PIECE);
};

export default hold;
