import generateMoves from '@/lib/ai/planner/generate-moves.js';
import advanceSnapshot from '@/lib/ai/simulator/advance-snapshot.js';
import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';
import MCTSNode from '@/lib/ai/mcts/mcts-node.js';

/**
 * # 蒙特卡洛树搜索（MCTS）
 *
 * 基于模拟的决策算法，通过大量随机推演来评估每种走法的长期价值。 与 `selfPlay` 不同，MCTS **不需要手工设计评估函数的全部细节**，
 * 而是通过"试到游戏结束看结果"来自然发现最优策略。
 *
 * ## MCTS 的四个阶段
 *
 * 每次迭代执行以下四步：
 *
 *     Selection → Expansion → Simulation → Backpropagation
 *
 * | 阶段                | 说明                                                                 |
 * | ------------------- | -------------------------------------------------------------------- |
 * | **Selection**       | 从根节点开始，按 UCB1 公式选最有潜力的分支，一直走到叶子节点         |
 * | **Expansion**       | 在叶子节点上，从未尝试的移动中随机选一个，创建新子节点               |
 * | **Simulation**      | 从新节点开始，随机快速模拟到游戏结束（或达到最大深度），得到一个评分 |
 * | **Backpropagation** | 把模拟评分反向传播，更新路径上所有节点的访问次数和累计评分           |
 *
 * ## 与 selfPlay 的对比
 *
 * | 特性     | selfPlay                   | MCTS                   |
 * | -------- | -------------------------- | ---------------------- |
 * | 决策方式 | 全量搜索 + 启发式评估      | 随机采样 + 统计推断    |
 * | 评估来源 | 手工设计的 `evaluateBoard` | 模拟到结束的实际结果   |
 * | 计算量   | 确定的（depth × beam）     | 可调节的（iterations） |
 * | 适合场景 | 确定性前瞻                 | 不确定性强的长期规划   |
 * | 扩展性   | 受限于 depth 和 beam       | 加 iterations 就能变强 |
 *
 * ## 为什么用访问次数而非平均评分？
 *
 * MCTS 最终选择**访问次数最多**的子节点，而不是**平均评分最高**的。 原因：访问次数多意味着 MCTS 认为这个分支"值得反复探索"，
 * 它既考虑了评分高低，也考虑了评估的置信度。 平均评分高但只被访问了 1 次的节点可能只是"运气好"。
 *
 * ## 参数调优
 *
 * | 参数        | 建议值  | 说明                                      |
 * | ----------- | ------- | ----------------------------------------- |
 * | iterations  | 200-500 | 越高决策越准，但计算时间线性增长          |
 * | maxSimDepth | 10-20   | 模拟深度，超过后直接用 evaluateBoard 截断 |
 *
 * ## 参考论文
 *
 * - **AlphaGo 论文**（DeepMind, 2016）：MCTS + 神经网络的鼻祖
 * - **Browne et al., "A Survey of Monte Carlo Tree Search Methods"（2012）**： 纯
 *   MCTS 的综述，适合深入理解
 *
 * @function mcts
 * @param {object} snapshot - 游戏状态快照（由 `createSnapshot` 创建）
 * @param {object} weights - 评估权重配置（由 `AIDifficulty` 提供）
 * @param {number} [iterations=200] - MCTS 迭代次数，越高决策越准但越慢. Default is `200`
 * @param {number} [maxSimDepth=10] - 每次随机模拟的最大深度， 防止单次模拟时间过长. Default is `10`
 * @returns {object | null} 最佳移动对象 `{ board, actions, y }`，无可用移动时返回 `null`
 */
const mcts = (snapshot, weights, iterations = 200, maxSimDepth = 10) => {
  // 生成根节点的所有候选移动
  const moves = generateMoves(snapshot);

  // 没有可用移动（游戏结束或棋盘已满）
  if (moves.length === 0) {
    return null;
  }

  /*
   * ======== 1. 创建根节点 ========
   *
   * 根节点代表当前游戏状态，没有父节点和父移动
   */
  const root = new MCTSNode(snapshot);

  // 初始化根节点的"未尝试移动"列表
  root.untriedMoves = [...moves];

  /*
   * ======== 2. MCTS 主循环 ========
   *
   * 每次迭代完成 Selection → Expansion → Simulation → Backpropagation 四个阶段
   */
  for (let i = 0; i < iterations; i++) {
    // 从根节点开始
    let node = root;

    /** 当前快照的深拷贝，用于在 Selection 阶段逐步推进。 每次迭代都从原始快照开始，确保各次迭代之间互不干扰。 */
    let currentSnapshot = {
      ...snapshot,
      board: snapshot.board.map((row) => [...row]),
    };

    /**
     * ======== Selection（选择） ========
     *
     * 从根节点开始，沿着 UCB1 值最高的分支一路向下， 直到找到一个"还有未尝试移动"或"没有子节点"的叶子节点。
     *
     * 退出条件：
     *
     * - `untriedMoves.length > 0`：还有未展开的移动，进入 Expansion
     * - `children.length === 0`：叶子节点，直接进入 Simulation
     */
    while (node.untriedMoves.length === 0 && node.children.length > 0) {
      // 选 UCB1 最高的子节点
      node = node.selectBestChild();

      // 推进快照到子节点对应的状态
      currentSnapshot = advanceSnapshot(currentSnapshot, node.move);
    }

    /**
     * ======== Expansion（展开） ========
     *
     * 如果当前节点还有未尝试的移动，随机选一个创建新子节点。 这样 MCTS 会逐步扩展搜索树，覆盖越来越多的可能性。
     */
    if (node.untriedMoves.length > 0) {
      // 从未尝试移动中随机选一个
      const randomIndex = Math.floor(Math.random() * node.untriedMoves.length);
      const move = node.untriedMoves.splice(randomIndex, 1)[0];

      // 推进快照到新子节点对应的状态
      const nextSnapshot = advanceSnapshot(currentSnapshot, move);

      // 创建新子节点，挂到当前节点下
      const child = new MCTSNode(nextSnapshot, move, node);
      node.children.push(child);

      // 将焦点移到新创建的子节点，准备进入 Simulation
      node = child;
    }

    /**
     * ======== Simulation（模拟） ========
     *
     * 从当前节点开始，**随机选择移动**快速模拟到游戏结束 （或达到最大深度 `maxSimDepth`）。
     *
     * 模拟过程中的随机性让 MCTS 能够探索不同的游戏走向， 从而对当前节点的"长期价值"做出统计推断。
     */
    let simSnapshot = {
      ...node.snapshot,
      board: node.snapshot.board.map((row) => [...row]),
    };
    let depth = 0;

    while (depth < maxSimDepth) {
      // 生成当前模拟状态的所有候选移动
      const simMoves = generateMoves(simSnapshot);

      // 没有可用移动（游戏结束），提前终止模拟
      if (simMoves.length === 0) {
        break;
      }

      // 随机选一个移动（这是 MCTS "Monte Carlo" 的核心）
      const randomMove = simMoves[Math.floor(Math.random() * simMoves.length)];

      // 推进模拟快照
      simSnapshot = advanceSnapshot(simSnapshot, randomMove);
      depth++;
    }

    // 用评估函数对模拟的最终棋盘打分
    const score = evaluateBoard(simSnapshot.board, weights);

    /**
     * ======== Backpropagation（反向传播） ========
     *
     * 把模拟结果的评分沿着"从当前节点到根节点"的路径 逐层向上传播，更新每个祖先节点的访问次数和累计评分。
     *
     * 这样，经过大量迭代后，每个节点的 `totalScore / visits` 就能反映出"走这个分支大概能得多少分"。
     */
    while (node) {
      // 访问次数 +1
      node.visits++;

      // 累计评分增加
      node.totalScore += score;

      // 向上追溯到父节点
      node = node.parent;
    }
  }

  /**
   * ======== 3. 选择最佳移动 ========
   *
   * MCTS 选择**访问次数最多**的子节点（而非平均评分最高）。
   *
   * 原因：访问次数多 = MCTS 认为这个分支"值得反复探索"， 说明它既有较高的评分，又有较高的置信度。 平均评分高但只被访问了 1
   * 次的节点可能是运气好， 下次换一种随机模拟路径评分可能就很低。
   */
  const bestChild = root.children.reduce((best, child) =>
    child.visits > best.visits ? child : best,
  );

  // 返回最佳子节点对应的移动（包含 actions、board、y 等字段）
  return bestChild.move;
};

export default mcts;
