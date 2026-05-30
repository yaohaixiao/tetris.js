import spawn from '@/lib/game/logic/spawn.js';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * # 暂存方块（Hold）
 *
 * 将当前活动方块存入暂存区，取出之前暂存的方块（如有）。 每个方块一局只能 hold 一次。
 *
 * ## 交换规则
 *
 * | 情况      | holdPiece | curr.\_held | 操作                           |
 * | --------- | --------- | ----------- | ------------------------------ |
 * | 首次 hold | null      | false       | curr → holdPiece，spawn 新方块 |
 * | 交换      | 有值      | false       | curr ↔ holdPiece               |
 * | 禁止      | 任意      | true        | 什么都不做                     |
 *
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const hold = (runtime) => {
  const { Store, Elements, id } = runtime;
  const state = Store.getState();
  const { curr, hold } = state;
  const { cols } = Elements.Canvas;

  // 已 hold 过或没有当前方块，禁止操作
  if (!curr || curr._held) return;

  if (hold) {
    // 交换：暂存区方块和当前方块互换
    const newCurr = { ...hold, _held: true };
    const newHold = { ...curr, _held: true };

    Store.setState({
      curr: newCurr,
      hold: newHold,
      cx: Math.floor(cols / 2) - Math.floor(newCurr.shape[0].length / 2),
      cy: 0,
    });
  } else {
    // 首次 hold：暂存当前方块，生成新方块
    Store.setState({
      hold: { ...curr, _held: true },
    });
    spawn(runtime);
  }

  // 更新暂存预览
  const events = UIEvents(id);
  runtime.emit(events.RENDER_HOLD_PIECE);
};

export default hold;
