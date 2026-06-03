import generateMoves from '@/lib/ai/planner/generate-moves.js';
import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';
import advanceSnapshot from '@/lib/ai/simulator/advance-snapshot.js';
import simulateClearResult from '@/lib/ai/simulator/simulate-clear-result.js';
import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';

/**
 * # 自弈决策（Self-Play）— 多步前瞻 + Beam Search 剪枝 + 计分奖励 + Hold 支持
 *
 * AI 的核心决策函数。基于当前游戏状态快照，生成所有可能的移动（包括 Hold 方块候选），通过递归前瞻评估每个候选的长期价值，返回最优移动。
 *
 * ## 零拷贝优化
 *
 * 候选移动不再携带完整的棋盘副本，而是通过 `move.evaluate(callback)` 延迟评分。 评分时内部执行"原地放置 → 回调评分 →
 * 回滚棋盘"，避免每次放置都深拷贝棋盘， 大幅减少 GC 压力和内存分配。
 *
 * ## 决策流程
 *
 * ### depth = 1（只看当前方块）
 *
 * 1. `generateMoves(snapshot)` — 生成所有候选移动（含 Hold 候选）
 * 2. 对每个候选调 `move.evaluate(callback)` 在消行后棋盘上评分
 * 3. 选评分最高的返回
 *
 * ### depth > 1（多步前瞻）
 *
 * 1. `generateMoves(snapshot)` — 生成候选移动
 * 2. Beam Search 剪枝（候选数超过 beam 时保留 top N）
 * 3. 对每个保留的候选： a. `advanceSnapshot(snapshot, move)` — 推进到下一个方块（内部深拷贝） b.
 *    `selfPlay(nextSnapshot, weights, depth - 1, beam)` — 递归决策 c. 对递归返回的棋盘评分
 * 4. 选评分最高的返回
 *
 * ## Hold 奖励
 *
 * 当候选移动的动作序列包含 `'HOLD'` 时，额外 +2 分。 足以打破平局，但不会让 AI 无脑 Hold。
 *
 * ## 设计原则
 *
 * 所有评分都在消行后的棋盘上进行。AI 看不到"留井不消"的选项， 只能看到"消行后棋盘多好"，自然倾向于消行。
 *
 * @param {object} snapshot - 游戏状态快照（由 createSnapshot 创建）
 * @param {object} weights - 评估权重配置（由 AIDifficulty 提供）
 * @param {number} [depth=1] - 前瞻深度。默认 1. Default is `1`
 * @param {number} [beam=5] - Beam Search 剪枝宽度。默认 5. Default is `5`
 * @returns {object | null} 最佳移动对象 `{ evaluate, actions, y }`
 */
const selfPlay = (snapshot, weights, depth = 1, beam = 5) => {
  // 生成所有候选移动：当前方块 + Hold 方块（如果有）
  const moves = generateMoves(snapshot);

  if (moves.length === 0) {
    return null;
  }

  /**
   * ======== Beam Search 剪枝 ========
   *
   * 候选数超过 beam 时，在消行后棋盘上快速评分（含 Hold 奖励）， 只保留 top N 进入深层递归。
   *
   * 剪枝评分使用 `move.evaluate(callback)` 延迟评分， 内部原地放置 + 消行 + 评分 + 回滚，不产生棋盘副本。
   */
  if (depth > 1 && moves.length > beam) {
    const scored = moves.map((move) => {
      // 延迟评分：原地放置 → 消行 → 评分 → 回滚
      let score = move.evaluate((board) => {
        const clearedBoard = clearFullLines(board);
        const afterClearResult = simulateClearResult(clearedBoard, snapshot);
        return evaluateBoard(clearedBoard, weights, afterClearResult);
      });

      // Hold 奖励
      if (move.actions.includes('HOLD')) {
        score += 2;
      }

      return { move, score };
    });

    // 按评分降序排列
    scored.sort((a, b) => b.score - a.score);

    // 清空原数组，只保留 top `beam` 个候选
    moves.length = 0;
    moves.push(...scored.slice(0, beam).map((s) => s.move));
  }

  let best = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    let score;

    if (depth <= 1) {
      /**
       * ======== 最深一层：只在消行后棋盘上评分 ========
       *
       * 使用延迟评分：原地放置 → 消行 → 评分 → 回滚。 不产生棋盘副本，GC 零压力。
       */
      score = move.evaluate((board) => {
        const clearedBoard = clearFullLines(board);
        const afterClearResult = simulateClearResult(clearedBoard, snapshot);
        return evaluateBoard(clearedBoard, weights, afterClearResult);
      });
    } else {
      /**
       * ======== 递归前瞻 ========
       *
       * 1. AdvanceSnapshot 内部深拷贝棋盘（只此一处拷贝）， 放置方块 → 消行 → 推进到下一个方块
       * 2. 递归调用 selfPlay
       * 3. 对递归返回的棋盘评分
       */
      const nextSnapshot = advanceSnapshot(snapshot, move);
      const nextBest = selfPlay(nextSnapshot, weights, depth - 1, beam);

      score = nextBest
        ? nextBest.evaluate((board) => {
            const nextClearResult = simulateClearResult(board, nextSnapshot);
            return evaluateBoard(board, weights, nextClearResult);
          })
        : move.evaluate((board) => {
            const clearedBoard = clearFullLines(board);
            const afterClearResult = simulateClearResult(
              clearedBoard,
              snapshot,
            );
            return evaluateBoard(clearedBoard, weights, afterClearResult);
          });
    }

    /** Hold 奖励：当候选包含 HOLD 动作时额外 +2 分 */
    if (move.actions.includes('HOLD')) {
      score += 2;
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
