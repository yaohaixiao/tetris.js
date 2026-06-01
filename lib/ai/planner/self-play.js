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
 * ## 决策流程
 *
 * ### depth = 1（只看当前方块，不做深层推演）
 *
 * 1. 调用 `generateMoves(snapshot)` 生成所有候选移动
 *
 *    - 当前方块：4 个旋转状态 × 合法水平位置
 *    - Hold 方块（如果有）：同样遍历所有旋转和位置
 * 2. 对每个候选，先模拟消行（`clearFullLines`），在消行后的棋盘上评分
 *
 *    - 消行后的棋盘更低、更干净，评分更准确
 * 3. Hold 候选获得 +2 分额外奖励，鼓励 AI 在合适时机使用 Hold
 * 4. 选评分最高的候选返回
 *
 * ### depth > 1（多步前瞻，递归推演）
 *
 * 1. 调用 `generateMoves(snapshot)` 生成候选移动
 * 2. **Beam Search 剪枝**：候选数超过 `beam` 限制时，先对所有候选在消行后 棋盘上快速评分（含 Hold 奖励），只保留评分最高的
 *    top N 进入深层递归。 这大幅减少计算量，depth=4 也能在毫秒级完成。
 * 3. 对每个保留的候选，执行三步递归： a. `advanceSnapshot(snapshot, move)` — 模拟放置方块 → 消除满行 → 从
 *    7-bag 消费下一个方块 → 更新 combo/backToBack 状态 b. `selfPlay(nextSnapshot, weights,
 *    depth - 1, beam)` — 递归调用自身， 对新方块做同样的决策（深度 -1） c. 对递归返回的最佳棋盘，重新调用
 *    `simulateClearResult` 计算消行结果， 然后传给 `evaluateBoard` 评分
 * 4. 选评分最高的候选返回（含 Hold 奖励）
 *
 * ## Hold 奖励
 *
 * 当候选移动的动作序列包含 `'HOLD'` 时，额外获得 **+2 分**。
 *
 * 设计理由：
 *
 * - Hold 是一种有价值的资源——它能换一个方块
 * - 2 分足以打破平局（当两个落点评分相同时，AI 倾向用 Hold）
 * - 2 分不会太大，AI 不会无脑 Hold 而忽略更好的直接落点
 *
 * 典型场景：当前方块放哪都差，Hold 方块是 I 块正好能填井消 Tetris。 Hold 候选的评分 = 消行后棋盘评分 + 2（Hold
 * 奖励），很可能超过所有 当前方块的候选评分，AI 就会选择 Hold。
 *
 * ## Beam Search 剪枝
 *
 * 只影响搜索宽度，不影响搜索深度。
 *
 * 以 depth=4、beam=3 为例：
 *
 * - 第一层：约 30 个候选 → 快速评分 → 保留 3 个进入递归
 * - 第二层：每个约 30 个 → 各保留 3 个 → 9 个
 * - 第三层：每个约 30 个 → 各保留 3 个 → 27 个
 * - 第四层：27 个直接评分
 * - 总评估次数：约 30 + 3×30 + 9×30 + 27 ≈ 400 次
 * - 无剪枝：约 30⁴ = 810,000 次
 *
 * 剪枝评分同样在消行后的棋盘上进行，与最终决策评分保持一致。 Hold 奖励在剪枝评分中也生效，确保好的 Hold 候选不会在第一层就被剪掉。
 *
 * ## 确定性前瞻
 *
 * `advanceSnapshot` 使用 `snapshot.bag`（7-bag 队列）消费方块， 确保同一 bag 状态下多次前瞻得到完全相同的结果。
 * 这消除了随机性对 AI 决策的干扰，让 depth=4 的前瞻真正可靠。
 *
 * @param {object} snapshot - 游戏状态快照（由 createSnapshot 创建），包含：
 *   board、piece、hold、bag、combo、backToBack、tSpin 等字段
 * @param {object} weights - 评估权重配置（由 AIDifficulty 提供），包含：
 *   holes、height、bumpiness、completeLines 四个可配权重
 * @param {number} [depth=1] - 前瞻深度。1=只看当前方块，2=多看一步， 3=多看两步，4=多看三步。默认 1. Default
 *   is `1`
 * @param {number} [beam=5] - Beam Search 剪枝宽度。候选数超过此值时只保留 top N 进入深层搜索。默认 5.
 *   Default is `5`
 * @returns {object | null} 最佳移动对象 `{ board, actions, y }`， 无可用移动时返回 null
 */
const selfPlay = (snapshot, weights, depth = 1, beam = 5) => {
  // 生成所有候选移动：当前方块 + Hold 方块（如果有）
  const moves = generateMoves(snapshot);

  // 没有可用移动（游戏结束或棋盘已满）
  if (moves.length === 0) {
    return null;
  }

  /**
   * ======== Beam Search 剪枝 ========
   *
   * 仅在"还需要继续递归"且"候选数超过 beam 限制"时执行。
   *
   * 剪枝策略：
   *
   * 1. 对每个候选先模拟消行（clearFullLines + simulateClearResult）
   * 2. 在消行后的棋盘上调用 evaluateBoard 快速评分
   * 3. Hold 候选额外 +2 分
   * 4. 按评分降序排列，只保留前 beam 个候选
   * 5. 其余候选直接丢弃，不再进入深层递归
   *
   * 这确保了"好的 Hold 候选"不会在第一层就被剪掉。
   */
  if (depth > 1 && moves.length > beam) {
    const scored = moves.map((move) => {
      // 先在消行后的棋盘上评分
      const clearedBoard = clearFullLines(move.board);
      const afterClearResult = simulateClearResult(clearedBoard, snapshot);
      let score = evaluateBoard(clearedBoard, weights, afterClearResult);

      // Hold 候选额外奖励
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

  // 最佳移动及其评分
  let best = null;
  let bestScore = -Infinity;

  // 遍历所有候选移动（已剪枝或未剪枝）
  for (const move of moves) {
    let score;

    if (depth <= 1) {
      /**
       * ======== 最深一层：只在消行后棋盘上评分 ========
       *
       * 不评估放置后、消行前的棋盘状态。这强制 AI 只能看到 "消行后的棋盘有多好"，避免了"留井看起来也不错"的干扰。
       *
       * 消行后的低棋盘 + 消行奖励 > 留井的高棋盘。
       */
      const clearedBoard = clearFullLines(move.board);
      const afterClearResult = simulateClearResult(clearedBoard, snapshot);
      score = evaluateBoard(clearedBoard, weights, afterClearResult);
    } else {
      /**
       * ======== 还需往下看：递归前瞻 ========
       *
       * 1. 推进快照：模拟放置当前方块 → 消除满行 → 推进到下一个方块 advanceSnapshot 内部会：
       *
       *    - 放置方块到棋盘
       *    - 消除满行
       *    - 计算消行计分结果
       *    - 从 7-bag 消费下一个方块
       *    - 更新 combo/backToBack 状态
       *    - 传递 clearResult 到下一层
       * 2. 递归调用 selfPlay，对新方块做决策（depth - 1）
       * 3. 如果递归返回了最佳移动（nextBest），对其棋盘重新计算 消行结果后评分。如果递归返回 null（下一步无可用移动），
       *    退回到直接评估当前消行后的棋盘。
       */
      const nextSnapshot = advanceSnapshot(snapshot, move);
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

    /**
     * Hold 奖励：当候选包含 HOLD 动作时额外 +2 分
     *
     * 这个奖励在每层评分后都生效，确保：
     *
     * - Depth=1 时：Hold 候选能公平竞争
     * - Depth>1 时：递归返回的评分也可能来自 Hold 路径
     *
     * 2 分的量级：
     *
     * - 远小于 Tetris 消行奖励（80 分）→ 不会无脑 Hold
     * - 大于 bumpiness 惩罚的典型差异（~1 分）→ 能打破平局
     */
    if (move.actions.includes('HOLD')) {
      score += 2;
    }

    // 更新最佳选择
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }

  /**
   * 返回当前方块的最佳移动
   *
   * 注意：返回的 actions 始终是当前方块的操作序列。 如果是 Hold 候选，actions 的第一项是 'HOLD'。
   * 后续步骤只用于辅助评分，不返回它们的最佳移动。
   */
  return best;
};

export default selfPlay;
