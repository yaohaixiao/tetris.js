import generateMoves from '@/lib/ai/planner/generate-moves.js';
import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';
import advanceSnapshot from '@/lib/ai/simulator/advance-snapshot.js';
import simulateClearResult from '@/lib/ai/simulator/simulate-clear-result.js';
import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';
import cloneBoard from '@/lib/ai/utils/clone-board.js';

/**
 * ============================================================
 *
 * # 自弈决策 — 多步前瞻 + Beam Search + 分支复制
 *
 * ============================================================
 *
 * AI 的核心决策函数。基于当前游戏状态快照， 生成所有可能的移动（包括 Hold 候选）， 通过递归前瞻评估每个候选的长期价值，返回最优移动。
 *
 * ## 分支复制模型
 *
 * 每个候选移动都在原始棋盘的独立浅拷贝上执行， 不同分支的棋盘完全隔离，无需回滚操作。 深拷贝只在 advanceSnapshot 中执行。
 *
 * ## 决策流程
 *
 * 1. GenerateMoves(snapshot) — 生成所有候选（含 Hold）
 * 2. Beam Search 剪枝 — 候选数超过 beam 时保留 top N
 * 3. 对每个保留的候选：分支复制 → 放置 → 统计新增满行 → 消行 → 评分
 * 4. Depth > 1 时递归前瞻
 * 5. 选评分最高的返回
 *
 * ## 对战模式 (versus) 与生存模式 (survival)
 *
 * Mode 参数贯穿整个决策链，最终传递到 evaluateBoard：
 *
 * - Survival：只关心自己棋盘的存活，标准权重
 * - Versus：额外考虑攻击力奖励，引导 AI 追求多行消除
 *
 * @function selfPlay
 * @param {object} snapshot - 游戏状态快照
 * @param {object} weights - 评估权重配置
 * @param {number} [depth=1] - 前瞻深度. Default is `1`
 * @param {number} [beam=5] - Beam Search 剪枝宽度. Default is `5`
 * @param {string} [mode='survival'] - AI 模式：survival 或 versus. Default is
 *   `'survival'`
 * @returns {object | null} 最佳移动对象，无可用移动时返回 null
 */
const selfPlay = (
  snapshot,
  weights,
  depth = 1,
  beam = 5,
  mode = 'survival',
) => {
  // 步骤 1：生成所有候选移动
  const moves = generateMoves(snapshot);

  if (moves.length === 0) {
    return null;
  }

  // 步骤 2：计算基准满行数
  const baseCleared = snapshot.board.filter((row) =>
    row.every((c) => c !== 0),
  ).length;

  // 步骤 3：Beam Search 剪枝
  if (depth > 1 && moves.length > beam) {
    const scored = moves.map((move) => {
      const board = cloneBoard(snapshot.board);
      move.placeOn(board);

      const afterTotal = board.filter((row) =>
        row.every((c) => c !== 0),
      ).length;
      const newCleared = afterTotal - baseCleared;

      const afterBoard = clearFullLines(board);
      const result = simulateClearResult(afterBoard, snapshot, newCleared);

      let score = evaluateBoard(afterBoard, weights, result, mode);

      // Hold 候选额外 +2 分，确保不被误剪
      if (move.actions.includes('HOLD')) {
        score += 2;
      }

      return { move, score };
    });

    scored.sort((a, b) => b.score - a.score);

    moves.length = 0;
    moves.push(...scored.slice(0, beam).map((s) => s.move));
  }

  // 步骤 4：评分循环
  let best = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    const board = cloneBoard(snapshot.board);
    move.placeOn(board);

    const afterTotal = board.filter((row) => row.every((c) => c !== 0)).length;
    const newCleared = afterTotal - baseCleared;

    const afterBoard = clearFullLines(board);
    const result = simulateClearResult(afterBoard, snapshot, newCleared);

    let score;

    if (depth <= 1) {
      // 最深一层：直接评分
      score = evaluateBoard(afterBoard, weights, result, mode);
    } else {
      // 递归前瞻
      const nextSnapshot = advanceSnapshot(snapshot, move);
      const nextBest = selfPlay(nextSnapshot, weights, depth - 1, beam, mode);

      if (nextBest) {
        const nextCleared = nextSnapshot.board.filter((r) =>
          r.every((c) => c !== 0),
        ).length;
        const nextResult = simulateClearResult(
          nextSnapshot.board,
          nextSnapshot,
          nextCleared,
        );
        score = evaluateBoard(nextSnapshot.board, weights, nextResult, mode);
      } else {
        // 下一步无可用移动（Game Over），退回评估当前消行后的棋盘
        score = evaluateBoard(afterBoard, weights, result, mode);
      }
    }

    // Hold 候选额外 +2 分
    if (move.actions.includes('HOLD')) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }

  // 步骤 5：返回最佳移动
  return best;
};

export default selfPlay;
