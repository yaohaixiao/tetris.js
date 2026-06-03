import generateMoves from '@/lib/ai/planner/generate-moves.js';
import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';
import advanceSnapshot from '@/lib/ai/simulator/advance-snapshot.js';
import simulateClearResult from '@/lib/ai/simulator/simulate-clear-result.js';
import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';
import cloneBoard from '@/lib/ai/utils/clone-board.js';

/**
 * # 自弈决策 — 多步前瞻 + Beam Search + 分支复制
 *
 * AI 的核心决策函数。基于当前游戏状态快照，生成所有可能的移动 （包括 Hold 候选），通过递归前瞻评估每个候选的长期价值， 返回最优移动。
 *
 * ## 分支复制模型
 *
 * 每个候选移动都在原始棋盘的**独立浅拷贝**上执行：
 *
 *     snapshot.board（原始，只读）
 *       ├── 候选A → cloneBoard → placeOn → clearFullLines → 评分
 *       ├── 候选B → cloneBoard → placeOn → clearFullLines → 评分
 *       └── 候选C → cloneBoard → placeOn → clearFullLines → 评分
 *
 * 浅拷贝（board.map(row => [...row])）在 selfPlay 分支点执行。 不同分支的棋盘完全隔离，无需回滚操作，消除了共享可变状态
 * 在递归树搜索中的回滚顺序错位风险。
 *
 * 深拷贝只在 advanceSnapshot 中执行（用于快照传递到下一层）。
 *
 * ## 决策流程
 *
 * 1. GenerateMoves(snapshot) — 生成所有候选（含 Hold）
 * 2. Beam Search 剪枝 — 候选数超过 beam 时保留 top N
 * 3. 对每个保留的候选：分支复制 → 放置 → 消行 → 评分
 * 4. Depth>1 时递归前瞻
 * 5. 选评分最高的返回
 *
 * ## 设计原则
 *
 * 所有评分都在消行后的棋盘上进行。AI 看不到"留井不消"的选项， 只能看到"消行后棋盘多好"，自然倾向于消行。
 *
 * @param {object} snapshot - 游戏状态快照（由 createSnapshot 创建）
 * @param {object} weights - 评估权重配置（由 AIDifficulty 提供）
 * @param {number} [depth=1] - 前瞻深度。1=只看当前方块，2=多看一步。默认 1. Default is `1`
 * @param {number} [beam=5] - Beam Search 剪枝宽度。候选数超过此值时只保留 top N。默认 5. Default
 *   is `5`
 * @returns {object | null} 最佳移动对象 { placeOn, actions, y }，无可用移动时返回 null
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
   * 1. 对每个候选做分支复制（cloneBoard），在独立棋盘上放置方块
   * 2. 消行后在消行后的棋盘上调用 evaluateBoard 快速评分
   * 3. Hold 候选额外 +2 分，确保好的 Hold 候选不会被剪掉
   * 4. 按评分降序排列，只保留前 beam 个候选进入深层递归
   * 5. 其余候选直接丢弃
   */
  if (depth > 1 && moves.length > beam) {
    const scored = moves.map((move) => {
      // 分支复制：每个候选在原始棋盘的独立副本上操作
      const branchBoard = cloneBoard(snapshot.board);
      move.placeOn(branchBoard);

      // 消行后在消行后的棋盘上评分
      const clearedBoard = clearFullLines(branchBoard);
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

  /**
   * ======== 评分循环 ========
   *
   * 遍历所有候选移动（已剪枝或未剪枝），对每个候选：
   *
   * 1. 分支复制：从原始棋盘浅拷贝一份独立副本
   * 2. 放置方块到副本上（placeOn）
   * 3. 消除满行（clearFullLines）
   * 4. 计算消行结果（simulateClearResult）
   * 5. Depth=1 时直接评分，depth>1 时递归前瞻
   * 6. 更新最佳选择
   */
  for (const move of moves) {
    /**
     * 分支复制：每个候选在原始棋盘的独立副本上操作。
     *
     * CloneBoard 执行浅拷贝（board.map(row => [...row])）， 不同分支的棋盘完全隔离。placeOn
     * 原地修改这个副本， 不污染原始棋盘和其他分支的棋盘。
     */
    const branchBoard = cloneBoard(snapshot.board);
    move.placeOn(branchBoard);

    // 消除满行
    const clearedBoard = clearFullLines(branchBoard);

    // 计算消行计分结果（用于 evaluateBoard 的计分奖励）
    const afterClearResult = simulateClearResult(clearedBoard, snapshot);

    let score;

    if (depth <= 1) {
      /**
       * ======== 最深一层：直接在消行后棋盘上评分 ========
       *
       * 不评估放置后、消行前的棋盘状态。这强制 AI 只能看到 "消行后的棋盘有多好"，避免了"留井看起来也不错"的干扰。 消行后的低棋盘 +
       * 消行奖励 > 留井的高棋盘。
       */
      score = evaluateBoard(clearedBoard, weights, afterClearResult);
    } else {
      /**
       * ======== 还需往下看：递归前瞻 ========
       *
       * 1. AdvanceSnapshot 推进快照到下一个方块：
       *
       *    - 深拷贝棋盘（只此一处深拷贝）
       *    - 放置当前方块 → 消除满行
       *    - 从 7-bag 消费下一个方块
       *    - 更新 combo/backToBack 状态
       *    - 传递 clearResult 到下一层
       * 2. 递归调用 selfPlay，对新方块做决策（depth - 1）
       * 3. 如果递归返回了最佳移动（nextBest），使用 nextSnapshot.board（advanceSnapshot 已消行并更新棋盘）
       *    计算消行结果后评分。nextBest 结构为 { placeOn, actions, y }， 不包含 board
       *    字段，棋盘数据由快照携带。
       *
       *    如果递归返回 null（下一步无可用移动，即 Game Over）， 退回到直接评估当前消行后的棋盘。
       */
      const nextSnapshot = advanceSnapshot(snapshot, move);
      const nextBest = selfPlay(nextSnapshot, weights, depth - 1, beam);

      if (nextBest) {
        /**
         * 对递归返回的棋盘重新计算消行结果后评分。
         *
         * 注意：使用 nextSnapshot.board 而非 nextBest.board。 nextBest 是 selfPlay 的返回值
         * { placeOn, actions, y }， 不包含 board 字段。nextSnapshot.board 由
         * advanceSnapshot 在内部深拷贝并消行后更新，是正确的评分对象。
         */
        const nextClearResult = simulateClearResult(
          nextSnapshot.board,
          nextSnapshot,
        );
        score = evaluateBoard(nextSnapshot.board, weights, nextClearResult);
      } else {
        // 下一步无可用移动，退回评估当前消行后的棋盘
        score = evaluateBoard(clearedBoard, weights, afterClearResult);
      }
    }

    /**
     * Hold 奖励：当候选包含 HOLD 动作时额外 +2 分。
     *
     * 这个奖励在每层评分后都生效。2 分的量级：
     *
     * - 远小于 Tetris 消行奖励（80 分），不会无脑 Hold
     * - 大于 bumpiness 惩罚的典型差异（~1 分），能打破平局
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
   * 返回当前方块的最佳移动。
   *
   * 注意：返回的 actions 始终是当前方块的操作序列。 如果是 Hold 候选，actions 的第一项是 'HOLD'。
   * 后续步骤只用于辅助评分，不返回它们的最佳移动。
   */
  return best;
};

export default selfPlay;
