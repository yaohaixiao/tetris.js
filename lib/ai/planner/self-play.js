import generateMoves from '@/lib/ai/planner/generate-moves.js';
import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';
import advanceSnapshot from '@/lib/ai/simulator/advance-snapshot.js';

/**
 * # 自弈决策（Self-Play）— 支持多步前瞻
 *
 * AI 的核心决策函数。基于当前游戏快照， 生成所有可能的移动，递归前瞻评估，返回最优移动。
 *
 * ## 决策流程
 *
 * ### depth = 1（基础模式，和你原来的 selfPlay 一样）
 *
 * 1. `generateMoves(snapshot)` → 生成所有候选移动
 * 2. 对每个候选的结果棋盘调 `evaluateBoard` 评分
 * 3. 选评分最高的返回
 *
 * ### depth > 1（前瞻模式）
 *
 * 1. `generateMoves(snapshot)` → 生成当前方块的候选移动
 * 2. 对每个候选： a. `advanceSnapshot(snapshot, move)` → 模拟放置 + 消行 + 生成新方块 b.
 *    `selfPlay(nextSnapshot, depth - 1)` → **递归**：对新方块再做决策 c.
 *    用递归返回的最佳棋盘评分作为当前候选的评分
 * 3. 选评分最高的返回
 *
 * ## 为什么叫 Self-Play？
 *
 * 这个函数模拟了"AI 自己和自己下棋"的决策过程： 在脑海中推演所有可能的走法，然后预判对手（其实是自己）
 * 下一步会怎么走，从中选择对多步后最有利的那一步。
 *
 * ## 参数说明
 *
 * `snapshot` 是游戏的当前状态快照，由 `createSnapshot` 生成。
 * 这是一个**只读**操作，不会修改快照本身（`advanceSnapshot` 返回新对象）。
 *
 * `depth` 是前瞻深度，由难度配置决定：
 *
 * - EASY: depth=1
 * - NORMAL: depth=2
 * - HARD/EXPERT: depth=3
 *
 * ## 性能注意事项
 *
 * | depth | 候选数（约） | 评估次数 |
 * | ----- | ------------ | -------- |
 * | 1     | ~30          | ~30      |
 * | 2     | ~30          | ~900     |
 * | 3     | ~30          | ~27,000  |
 *
 * Depth=3 时可能卡顿，后续可加剪枝优化（只保留 top N 进入下一层）。
 *
 * ## 返回值
 *
 * 返回的是**当前方块**的最佳移动对象：
 *
 * ```js
 * {
 *   board: number[][],    // 模拟放置后的结果棋盘
 *   actions: string[],    // 动作序列，如 ['ROTATE', 'MOVE_LEFT', 'DROP']
 *   y: number             // 下落到的 Y 坐标
 * }
 * ```
 *
 * 注意：不管 depth 是多少，返回的 actions 始终是**当前方块**的操作序列。 后续步骤只是用来辅助评估，不会返回它们的最佳移动。
 *
 * @example
 *   // 简单模式：只看当前方块
 *   const best = selfPlay(snapshot, 1);
 *
 *   // 前瞻模式：多看一步
 *   const best = selfPlay(snapshot, 2);
 *
 * @function selfPlay
 * @param {object} snapshot - 游戏状态快照（由 `createSnapshot` 创建）
 * @param {number} [depth=1] - 前瞻深度，1=只看当前方块，2=多看一步，3=多看两步. Default is `1`
 * @returns {object | null} 最佳移动对象 `{ board, actions, y }`，无可用移动时返回 `null`
 */
const selfPlay = (snapshot, depth = 1) => {
  // 生成当前方块所有可能的移动
  const moves = generateMoves(snapshot);

  // 没有可用移动（例如游戏结束）
  if (moves.length === 0) return null;

  let best = null;
  let bestScore = -Infinity;

  // 遍历所有候选移动
  for (const move of moves) {
    let score;

    if (depth <= 1) {
      /* ======== 最深一层：直接评估 ======== */
      // 不再往下看，直接用评估函数对放置后的棋盘打分
      score = evaluateBoard(move.board);
    } else {
      /* ======== 还需要往下看：递归前瞻 ======== */
      // 1. 推进快照：模拟放置当前方块 + 消行 + 生成新方块
      const nextSnapshot = advanceSnapshot(snapshot, move);

      // 2. 递归调用 selfPlay，对新方块做决策
      const nextBest = selfPlay(nextSnapshot, depth - 1);

      // 3. 用下一步的最佳结果作为当前步的评分，如果下一步也没有可用移动，退回到直接评估当前棋盘
      score = nextBest
        ? evaluateBoard(nextBest.board)
        : evaluateBoard(move.board);
    }

    // 更新最佳选择（评分越高越好，最接近 0）
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }

  // 返回当前方块的最佳移动
  return best;
};

export default selfPlay;
