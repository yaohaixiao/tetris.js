import findFullLines from '@/lib/game/logic/find-full-lines.js';
import { GameEvents, UIEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 执行消行逻辑
 *
 * ============================================================
 *
 * 检测棋盘中的满行，触发消行动画特效。 实际的消行操作在动画完成后由 applyClearLines 执行。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作         | 说明                                |
 * | :--- | :----------- | :---------------------------------- |
 * | 1    | 查找满行     | 调用 findFullLines 获取所有满行行号 |
 * | 2    | 无满行则返回 | 没有可消除的行，直接退出            |
 * | 3    | 存入 Store   | 将满行行号写入 state.clearLines     |
 * | 4    | 触发消行动画 | 启动 ClearLinesAnimation 闪烁特效   |
 *
 * ## 与 applyClearLines 的关系
 *
 * | 函数            | 职责                     | 调用时机   |
 * | :-------------- | :----------------------- | :--------- |
 * | clearLines      | 检测满行 + 触发动画      | 方块锁定后 |
 * | applyClearLines | 执行消行 + 更新分数/等级 | 动画完成后 |
 *
 * 两者通过事件和动画系统连接：
 *
 * - ClearLines 检测满行 → emit START_CLEAR_LINES
 * - 动画 720ms 闪烁结束后 → dispose() → applyClearLines → 更新状态
 *
 * ## 调用时机
 *
 * - Tick 中方块无法下移后
 * - Drop 中方块落底后
 *
 * @function clearLines
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const clearLines = (runtime) => {
  const { id, Store } = runtime;

  // 步骤 1：查找满行
  const linesToClear = findFullLines(runtime);

  // 步骤 2：无满行则返回，重置 combo
  if (linesToClear.length === 0) {
    const UE = UIEvents(id);
    const hudState = { combo: 0 };

    Store.setState(hudState);
    runtime.emit(UE.UPDATE_HUD, hudState);

    return;
  }

  // 步骤 3：将满行行号存入 Store
  Store.setClearLines(linesToClear);

  // 步骤 4：触发消行动画
  const GE = GameEvents(id);
  runtime.emit(GE.START_CLEAR_LINES, { linesToClear });
};

export default clearLines;
