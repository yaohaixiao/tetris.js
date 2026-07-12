import simulatePlacement from '@/lib/ai/simulator/simulate-placement.js';
import simulateClearResult from '@/lib/ai/simulator/simulate-clear-result.js';
import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';

/**
 * ============================================================
 *
 * # 推进快照
 *
 * ============================================================
 *
 * 在 AI 前瞻搜索中，模拟"执行一个移动后游戏进入的下一个状态"。 这是 lookahead（多步前瞻）的核心衔接函数。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作                 | 说明                           |
 * | :--- | :------------------- | :----------------------------- |
 * | 1    | simulatePlacement    | 将当前方块放置到棋盘指定位置   |
 * | 2    | 统计新增满行数       | 消行前统计，用于计分           |
 * | 3    | clearFullLines       | 清除棋盘中的满行               |
 * | 4    | simulateClearResult  | 计算消行计分结果               |
 * | 5    | 从 snapshot.bag 消费 | 消费下一个方块（确定性前瞻）   |
 * | 6    | 更新计分状态         | combo / backToBack / tSpin     |
 * | 7    | 构建新快照           | 合并所有更新，传递 clearResult |
 *
 * ## 确定性前瞻
 *
 * 从快照中的 bag 数组消费方块，确保同一 bag 状态下多次前瞻得到完全相同的结果。 bag 为空时降级使用 snapshot.next 或默认 I
 * 块。
 *
 * ## 不可变性
 *
 * 通过扩展运算符创建新对象，不会修改传入的原始 snapshot。
 *
 * @function advanceSnapshot
 * @param {object} snapshot - 当前游戏状态快照
 * @param {object} move - 要执行的移动
 * @returns {object} 执行移动后的新快照
 */
const advanceSnapshot = (snapshot, move) => {
  // 1. 将当前方块放置到棋盘上（深拷贝棋盘，使用实际落地 X 坐标）
  const board = simulatePlacement(
    snapshot.board,
    snapshot.piece.shape,
    move.x ?? snapshot.piece.position.x,
    move.y,
  );

  // 2. 统计本次新增满行数
  const beforeCleared = snapshot.board.filter((row) =>
    row.every((c) => c !== 0),
  ).length;
  const afterTotal = board.filter((row) => row.every((c) => c !== 0)).length;
  const newCleared = afterTotal - beforeCleared;

  // 3. 清除满行
  const clearedBoard = clearFullLines(board);

  // 4. 计算消行计分结果
  const clearResult = simulateClearResult(clearedBoard, snapshot, newCleared);

  // 5. 从快照的 bag 中消费下一个方块
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

  // 7. 构建并返回推进后的新快照
  return {
    ...snapshot,
    board: clearedBoard,
    piece: newPiece,
    cur: nextPiece,
    next: nextNext,
    bag,
    combo: clearResult ? clearResult.combo : 0,
    backToBack: clearResult ? clearResult.isBigMove : snapshot.backToBack,
    tSpin: null,
    clearResult: clearResult || null,
  };
};

export default advanceSnapshot;
