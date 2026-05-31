import simulatePlacement from '@/lib/ai/simulator/simulate-placement.js';
import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';

/**
 * # 推进快照（Advance Snapshot）
 *
 * 在 AI 前瞻搜索中，模拟"执行一个移动后游戏进入的下一个状态"。 这是 lookahead（多步前瞻）的核心衔接函数。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作                | 说明                           |
 * | ---- | ------------------- | ------------------------------ |
 * | 1    | `simulatePlacement` | 将当前方块放置到棋盘指定位置   |
 * | 2    | `clearFullLines`    | 清除棋盘中的满行               |
 * | 3    | 从 `snapshot.bag`   | 消费下一个方块（确定性前瞻）   |
 * | 4    | 构建新快照          | 合并清理后的棋盘、新方块等信息 |
 *
 * ## 确定性前瞻
 *
 * 与旧版使用 `randomShape()` 不同，现在从快照中的 `bag` 数组消费方块。 这确保了同一 bag 状态下多次前瞻会得到完全相同的结果，
 * 大幅提升 AI 决策的稳定性和准确性。
 *
 * ## 不可变性
 *
 * 函数通过扩展运算符 `{ ...snapshot }` 创建新对象， 不会修改传入的原始 `snapshot`。
 *
 * @example
 *   const snapshot = createSnapshot(state);
 *   const moves = generateMoves(snapshot);
 *   const nextSnapshot = advanceSnapshot(snapshot, moves[0]);
 *
 * @function advanceSnapshot
 * @param {object} snapshot - 当前游戏状态快照（由 `createSnapshot` 创建）
 * @param {object} move - 要执行的移动（由 `simulateDrop` 返回）
 * @returns {object} 执行移动后的新快照
 */
const advanceSnapshot = (snapshot, move) => {
  // 1. 将当前方块放置到棋盘上
  const board = simulatePlacement(
    snapshot.board,
    snapshot.piece.shape,
    snapshot.piece.position.x,
    move.y,
  );

  // 2. 清除满行
  const clearedBoard = clearFullLines(board);

  /**
   * 3. 从快照的 bag 中消费下一个方块
   *
   * 使用快照中的 bag 副本，确保前瞻路径是确定性的。 如果 bag 已空，退回到 snapshot.next（真实预览块）。
   */
  const bag = snapshot.bag ? [...snapshot.bag] : [];
  const nextPiece =
    bag.length > 0
      ? bag.shift()
      : snapshot.next || {
          shape: [[1, 1, 1, 1]],
          type: 'I',
          rotation: 0,
          colorIndex: 0,
        };

  // 继续消费 bag 中的下一个作为预览
  let nextNext = null;
  if (bag.length > 0) {
    nextNext = bag.shift();
  }

  // 4. 构建新方块信息
  const newPiece = {
    shape: nextPiece.shape,
    position: {
      x: Math.floor(10 / 2) - Math.floor(nextPiece.shape[0].length / 2),
      y: 0,
    },
  };

  // 5. 构建并返回推进后的新快照
  return {
    ...snapshot,
    board: clearedBoard,
    piece: newPiece,
    cur: nextPiece,
    next: nextNext,
    bag, // 更新后的 bag（已消费 1-2 个）
  };
};

export default advanceSnapshot;
