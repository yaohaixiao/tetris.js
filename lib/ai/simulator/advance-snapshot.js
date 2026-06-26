import simulatePlacement from '@/lib/ai/simulator/simulate-placement.js';
import simulateClearResult from '@/lib/ai/simulator/simulate-clear-result.js';
import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';

/**
 * # 推进快照（Advance Snapshot）
 *
 * 在 AI 前瞻搜索中，模拟"执行一个移动后游戏进入的下一个状态"。 这是 lookahead（多步前瞻）的核心衔接函数。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作                  | 说明                               |
 * | ---- | --------------------- | ---------------------------------- |
 * | 1    | `simulatePlacement`   | 将当前方块放置到棋盘指定位置       |
 * | 2    | 统计新增满行数        | 消行前统计，用于计分               |
 * | 3    | `clearFullLines`      | 清除棋盘中的满行                   |
 * | 4    | `simulateClearResult` | 计算消行计分结果（传入真实消行数） |
 * | 5    | 从 `snapshot.bag`     | 消费下一个方块（确定性前瞻）       |
 * | 6    | 更新计分状态          | combo/backToBack/tSpin             |
 * | 7    | 构建新快照            | 合并所有更新，传递 clearResult     |
 *
 * ## 确定性前瞻
 *
 * 从快照中的 `bag` 数组消费方块，确保同一 bag 状态下多次前瞻得到完全相同的结果。 bag 为空时降级使用 `snapshot.next` 或默认
 * I 块。
 *
 * ## 计分状态传递
 *
 * 消行后更新 combo、backToBack，清空 tSpin。 `clearResult` 沿前瞻链传递到下一层，确保深层搜索也能看到消行价值。
 *
 * ## 不可变性
 *
 * 通过扩展运算符 `{ ...snapshot }` 创建新对象，不会修改传入的原始 `snapshot`。
 *
 * ## 关键修复
 *
 * - **move.x**：之前用 `snapshot.piece.position.x`（方块原始位置）， 忽略了移动产生的水平位移。现在用
 *   `move.x`（实际落地 X 坐标）， 前瞻模拟的棋盘位置与真实执行一致。
 * - **newCleared**：消行前统计新增满行数传入 simulateClearResult， 确保深层搜索能正确看到消行价值。
 *
 * @example
 *   const snapshot = createSnapshot(state);
 *   const moves = generateMoves(snapshot);
 *   const nextSnapshot = advanceSnapshot(snapshot, moves[0]);
 *
 * @function advanceSnapshot
 * @param {object} snapshot - 当前游戏状态快照（由 createSnapshot 创建）
 * @param {object} move - 要执行的移动（由 createCandidate 返回，含 x, y, placeOn, actions）
 * @returns {object} 执行移动后的新快照
 */
const advanceSnapshot = (snapshot, move) => {
  // 1. 将当前方块放置到棋盘上（深拷贝棋盘，不修改原始快照），使用 move.x（实际落地 X 坐标）而非 snapshot.piece.position.x
  const board = simulatePlacement(
    snapshot.board,
    snapshot.piece.shape,
    move.x ?? snapshot.piece.position.x,
    move.y,
  );

  /**
   * 2. 统计本次新增满行数。
   *
   * 必须在 clearFullLines 之前统计，因为消行后的棋盘满行已被清空。 用放置后满行数 - 放置前满行数 = 本次实际消行数。
   */
  const beforeCleared = snapshot.board.filter((row) =>
    row.every((c) => c !== 0),
  ).length;
  const afterTotal = board.filter((row) => row.every((c) => c !== 0)).length;
  const newCleared = afterTotal - beforeCleared;

  // 3. 清除满行
  const clearedBoard = clearFullLines(board);

  /**
   * 4. 计算消行计分结果。
   *
   * 传入本次实际消行数（newCleared）， 确保 clearScore、combo、backToBack 等字段基于真实消行数计算。
   */
  const clearResult = simulateClearResult(clearedBoard, snapshot, newCleared);

  // 5. 从快照的 bag 中消费下一个方块（确定性前瞻）
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

  // 6. 构建新方块信息（居中放置在棋盘顶部）
  const newPiece = {
    shape: nextPiece.shape,
    position: {
      x: Math.floor(10 / 2) - Math.floor(nextPiece.shape[0].length / 2),
      y: 0,
    },
  };

  /**
   * 7. 构建并返回推进后的新快照。
   *
   * 包含消行后的棋盘、新方块、更新后的计分状态、 以及传递给下一层的 clearResult。
   */
  return {
    ...snapshot,
    board: clearedBoard,
    piece: newPiece,
    cur: nextPiece,
    next: nextNext,
    bag,
    // 更新计分状态：combo 递增（如果有消行），否则清零
    combo: clearResult ? clearResult.combo : 0,
    // 更新 Back-to-Back：本次是大招则保留标记，否则继承原值
    backToBack: clearResult ? clearResult.isBigMove : snapshot.backToBack,
    // 清空 T-Spin 标记（每次锁定时重新检测）
    tSpin: null,
    // 传递消行结果到下一层，确保深层搜索能看到消行价值
    clearResult: clearResult || null,
  };
};

export default advanceSnapshot;
