import generateMoves from '@/lib/ai/planner/generate-moves.js';
import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';
import advanceSnapshot from '@/lib/ai/simulator/advance-snapshot.js';
import simulateClearResult from '@/lib/ai/simulator/simulate-clear-result.js';
import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';

/**
 * # 自弈决策（Self-Play）— 多步前瞻 + Beam Search 剪枝 + 计分奖励
 *
 * AI 的核心决策函数。基于当前游戏快照，生成所有可能的移动， 递归前瞻评估，返回最优移动。
 *
 * ## 决策流程
 *
 * ### depth = 1（只看当前方块）
 *
 * 1. `generateMoves(snapshot)` → 生成所有候选移动
 * 2. 对每个候选模拟消行（`clearFullLines`），在消行后的棋盘上评分
 * 3. 选评分最高的返回
 *
 * ### depth > 1（多步前瞻）
 *
 * 1. `generateMoves(snapshot)` → 生成候选移动
 * 2. Beam Search 剪枝：候选数超过 `beam` 时，在消行后棋盘上快速评分，保留 top N
 * 3. 对每个保留的候选： a. `advanceSnapshot(snapshot, move)` → 模拟放置 + 消行 + 推进到下一个方块 b.
 *    `selfPlay(nextSnapshot, weights, depth - 1, beam)` → 递归决策 c.
 *    对递归返回的棋盘重新计算消行结果后评分
 * 4. 选评分最高的返回
 *
 * ## 设计原则
 *
 * **所有评分都在消行后的棋盘上进行。** AI 看不到"留井不消"的选项，只能看到"消行后棋盘多好"。 这强制 AI 倾向于消行，避免死等 I
 * 块而不消的问题。
 *
 * ## Beam Search 剪枝
 *
 * 只影响搜索宽度，不影响搜索深度。 beam=5 时第一层约 30 个候选只保留 5 个进入递归，depth=4 也能流畅运行。
 * 剪枝评分同样在消行后的棋盘上进行，与决策评分保持一致。
 *
 * ## 确定性前瞻
 *
 * `advanceSnapshot` 使用 `snapshot.bag`（7-bag 队列）消费方块， 确保同一 bag 状态下多次前瞻得到完全相同的结果。
 *
 * @param {object} snapshot - 游戏状态快照（由 createSnapshot 创建）
 * @param {object} weights - 评估权重配置（由 AIDifficulty 提供）
 * @param {number} [depth=1] - 前瞻深度。默认 1. Default is `1`
 * @param {number} [beam=5] - Beam Search 剪枝宽度。默认 5. Default is `5`
 * @returns {object | null} 最佳移动对象 `{ board, actions, y }`，无可用移动时返回 null
 */
const selfPlay = (snapshot, weights, depth = 1, beam = 5) => {
  // 生成当前方块所有可能的移动（4 个旋转状态 × 合法水平位置）
  const moves = generateMoves(snapshot);

  if (moves.length === 0) return null;

  /**
   * Beam Search 剪枝
   *
   * 在消行后的棋盘上快速评分，只保留 top N 进入深层搜索。
   */
  if (depth > 1 && moves.length > beam) {
    const scored = moves.map((move) => {
      const clearedBoard = clearFullLines(move.board);
      const afterClearResult = simulateClearResult(clearedBoard, snapshot);
      return {
        move,
        score: evaluateBoard(clearedBoard, weights, afterClearResult),
      };
    });

    scored.sort((a, b) => b.score - a.score);

    moves.length = 0;
    moves.push(...scored.slice(0, beam).map((s) => s.move));
  }

  let best = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    let score;

    if (depth <= 1) {
      /**
       * 最深一层：只在消行后的棋盘上评分
       *
       * 不评估放置后、消行前的棋盘，确保 AI 不会因为"留井看起来也不错" 而放弃消行。消行后的低棋盘 + 消行奖励 > 留井的高棋盘。
       */
      const clearedBoard = clearFullLines(move.board);
      const afterClearResult = simulateClearResult(clearedBoard, snapshot);
      score = evaluateBoard(clearedBoard, weights, afterClearResult);
    } else {
      // 推进快照：模拟放置 → 消行 → 推进到下一个方块
      const nextSnapshot = advanceSnapshot(snapshot, move);

      // 递归：对新方块做决策
      const nextBest = selfPlay(nextSnapshot, weights, depth - 1, beam);

      if (nextBest) {
        // 对递归返回的棋盘重新计算消行结果后评分
        const nextClearResult = simulateClearResult(
          nextBest.board,
          nextSnapshot,
        );
        score = evaluateBoard(nextBest.board, weights, nextClearResult);
      } else {
        // 下一步无可用移动，退回评估当前消行后的棋盘
        const clearedBoard = clearFullLines(move.board);
        const afterClearResult = simulateClearResult(clearedBoard, snapshot);
        score = evaluateBoard(clearedBoard, weights, afterClearResult);
      }
    }

    // 更新最佳选择
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }

  return best;
};

export default selfPlay;
