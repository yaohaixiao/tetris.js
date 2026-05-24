/**
 * # 查找所有满行
 *
 * 从底部向上扫描棋盘，检测所有被完全填满的行。
 *
 * ## 检测逻辑
 *
 * 1. 从棋盘底部（最后一行）向上遍历
 * 2. 对每一行，检查是否所有格子都被占用（`!!cell` 为 true）
 * 3. 如果该行所有格子都有值，将行号加入待消除队列
 * 4. 返回所有满行的行号数组
 *
 * ## 为什么从底部向上扫描？
 *
 * 消行时从底部开始处理可以避免行号偏移问题。 当上方的行下移填补被消除的行时，已经处理过的底部行不会受影响。
 *
 * ## 与消行动画的关系
 *
 * | 步骤 | 函数              | 说明                           |
 * | ---- | ----------------- | ------------------------------ |
 * | 1    | `findFullLines`   | 检测并返回满行行号             |
 * | 2    | `clearLines`      | 将行号存入 Store，触发闪烁动画 |
 * | 3    | 动画系统          | 播放 720ms 闪烁特效            |
 * | 4    | `applyClearLines` | 执行真正的消行、更新分数和等级 |
 *
 * @example
 *   // 假设第 18 行和第 19 行被填满
 *   const lines = findFullLines(runtime);
 *   // lines = [19, 18]
 *
 * @function findFullLines
 * @param {object} runtime - 游戏运行时对象
 * @returns {number[]} 所有满行的行号数组（从底部向上排列）
 */
const findFullLines = (runtime) => {
  const { Elements, Store } = runtime;
  const state = Store.getState();
  const { rows } = Elements.Main;

  /**
   * 存储需要消除的行号
   *
   * @type {number[]}
   */
  const linesToClear = [];

  /**
   * ======== 从底部向上扫描 ========
   *
   * 从最后一行开始向上遍历，`every(!!cell)` 判断该行是否全部有值。 满行加入待消除队列。
   */
  for (let y = rows - 1; y >= 0; y--) {
    const isLineFull = state.board[y].every((cell) => !!cell);

    if (isLineFull) {
      linesToClear.push(y);
    }
  }

  return linesToClear;
};

export default findFullLines;
