import findFullLines from '@/lib/game/logic/find-full-lines.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 执行消行逻辑
 *
 * 检测棋盘中的满行，触发消行动画特效。 实际的消行操作在动画完成后由 `applyClearLines` 执行。
 *
 * ## 处理流程
 *
 * 1. 调用 `findFullLines` 查找所有被填满的行
 * 2. 如果没有满行，直接返回
 * 3. 将满行行号存入 Store（供动画和后续处理使用）
 * 4. 触发消行动画特效（闪烁 3 次）
 * 5. 动画结束后由 `ClearLinesAnimation` 触发实际的消行操作
 *
 * ## 与 applyClearLines 的关系
 *
 * | 函数              | 职责                     | 调用时机   |
 * | ----------------- | ------------------------ | ---------- |
 * | `clearLines`      | 检测满行 + 触发动画      | 方块锁定后 |
 * | `applyClearLines` | 执行消行 + 更新分数/等级 | 动画完成后 |
 *
 * 两者通过事件 `game:<id>:start:clear:lines` 和动画系统连接。
 *
 * @function clearLines
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const clearLines = (runtime) => {
  const { id, Store } = runtime;

  // 获取所有被填满的行号
  const linesToClear = findFullLines(runtime);

  // 没有满行，无需消行
  if (linesToClear.length === 0) {
    return;
  }

  // 将满行行号存入 Store，供动画和 applyClearLines 使用
  Store.setClearLines(linesToClear);

  const events = GameEvents(id);

  // 触发消行动画（闪烁 3 次），动画完成后会调用 applyClearLines
  runtime.emit(events.START_CLEAR_LINES, { linesToClear });
};

export default clearLines;
