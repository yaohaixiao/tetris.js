/**
 * # MCTS 搜索树节点
 *
 * 蒙特卡洛树搜索（Monte Carlo Tree Search）的核心数据结构。 每个节点代表游戏的一个状态（快照），并记录该状态被访问的次数
 * 和累计评分，用于 UCB1 公式计算。
 *
 * ## 核心概念
 *
 * ### UCB1（Upper Confidence Bound 1）
 *
 * UCB1 公式用于在"利用已知好走法"和"探索未知走法"之间取得平衡：
 *
 *     UCB1 = (totalScore / visits) + C × √(ln(parentVisits) / visits)
 *        \_____ exploitation _____/   \________ exploration _________/
 *
 * - **Exploitation（利用）**：平均评分越高，越倾向选它
 * - **Exploration（探索）**：被访问次数越少，越倾向选它（给冷门走法机会）
 * - **C（explorationConstant）**：控制探索的激进程度，默认 √2
 *
 * ### 节点的四种角色
 *
 * | 属性           | 说明                                         |
 * | -------------- | -------------------------------------------- |
 * | `snapshot`     | 该节点对应的游戏状态快照                     |
 * | `move`         | 从父节点到达此节点的移动（根节点为 null）    |
 * | `parent`       | 父节点引用，用于反向传播（backpropagation）  |
 * | `children`     | 已展开的子节点列表                           |
 * | `untriedMoves` | 尚未展开的候选移动列表                       |
 * | `visits`       | 该节点被 MCTS 访问的总次数                   |
 * | `totalScore`   | 该节点累计的评分总和（除以 visits = 平均分） |
 *
 * ## 参考论文
 *
 * - **AlphaGo 论文**（DeepMind, 2016）：MCTS + 神经网络的鼻祖
 * - **Browne et al., "A Survey of Monte Carlo Tree Search Methods"（2012）**： 纯
 *   MCTS 的综述，适合深入理解
 *
 * @class MCTSNode
 */
class MCTSNode {
  /**
   * ## 创建 MCTS 节点
   *
   * @param {object} snapshot - 该节点对应的游戏状态快照
   * @param {object | null} [move=null] - 从父节点到达此节点的移动对象， 根节点为 null。默认值为 `null`.
   *   Default is `null`
   * @param {MCTSNode | null} [parent=null] - 父节点引用， 根节点为 null。默认值为 `null`.
   *   Default is `null`
   */
  constructor(snapshot, move = null, parent = null) {
    /**
     * ## 游戏状态快照
     *
     * 该节点对应的棋盘、方块等完整状态。
     *
     * @type {object}
     */
    this.snapshot = snapshot;

    /**
     * ## 到达此节点的移动
     *
     * 包含 `{ board, actions, y }` 等字段。 根节点没有父移动，值为 `null`。
     *
     * @type {object | null}
     */
    this.move = move;

    /**
     * ## 父节点引用
     *
     * 用于在反向传播（backpropagation）时向上追溯更新祖先节点的统计信息。
     *
     * @type {MCTSNode | null}
     */
    this.parent = parent;

    /**
     * ## 已展开的子节点列表
     *
     * 每个子节点对应一个已被 MCTS 展开的候选移动。
     *
     * @type {MCTSNode[]}
     */
    this.children = [];

    /**
     * ## 该节点被访问的总次数
     *
     * 每次反向传播经过此节点时 +1。 用于 UCB1 公式的分母。
     *
     * @default 0
     * @type {number}
     */
    this.visits = 0;

    /**
     * ## 累计评分
     *
     * 每次反向传播时将模拟结果的评分累加到此字段。 `totalScore / visits` = 该节点的平均评分。
     *
     * @default 0
     * @type {number}
     */
    this.totalScore = 0;

    /**
     * ## 尚未展开的候选移动
     *
     * 初始化时包含该状态下所有可能的移动。 MCTS 在 Expansion 阶段从此列表中取出一个移动创建新子节点。
     *
     * @type {object[]}
     */
    this.untriedMoves = [];
  }

  /**
   * ## 计算 UCB1 值
   *
   * UCB1（Upper Confidence Bound 1）公式用于在 MCTS 的 Selection 阶段 选择最有潜力的子节点进行探索。
   *
   * ### 公式
   *
   *     UCB1 = exploitation + C × exploration
   *     exploitation = totalScore / visits
   *     exploration = √(ln(parentVisits) / visits)
   *
   * ### 特殊情况
   *
   * - **visits = 0**：从未被访问过的节点，返回 `Infinity`， 确保它在首次 Selection 时被优先选中（鼓励探索）。
   *
   * @param {number} [explorationConstant=Math.SQRT2] - 探索常数 C，
   *   值越大越倾向探索未知走法。默认值为 `√2 ≈ 1.414`. Default is `Math.SQRT2`
   * @returns {number} UCB1 值，越高越有潜力
   */
  ucb1(explorationConstant = Math.SQRT2) {
    // 从未被访问过的节点，给予最高优先级（鼓励探索）
    if (this.visits === 0) {
      return Infinity;
    }

    /** Exploitation（利用）：平均每次访问获得的评分。 值越大说明该节点的历史表现越好。 */
    const exploitation = this.totalScore / this.visits;

    /**
     * Exploration（探索）：对被访问次数少的节点给予补偿。 父节点被访问次数越多、本节点被访问次数越少，exploration 值越大。
     * 这确保了 MCTS 不会永远只走"看起来最好"的走法， 而是会偶尔尝试那些"还没怎么试过"的走法。
     */
    const exploration =
      explorationConstant *
      Math.sqrt(Math.log(this.parent.visits) / this.visits);

    // UCB1 = 利用 + 探索
    return exploitation + exploration;
  }

  /**
   * ## 选择 UCB1 值最高的子节点
   *
   * 在 MCTS 的 Selection 阶段使用。 遍历所有已展开的子节点，返回 UCB1 值最高的那个。
   *
   * ### 前置条件
   *
   * 调用此方法前，调用方已确保 `children.length > 0`。 `reduce` 的初始值设为 `this.children[0]`， 满足
   * linter 对 `reduce` 需要初始值的要求。
   *
   * @returns {MCTSNode} UCB1 值最高的子节点
   */
  selectBestChild() {
    return this.children.reduce(
      (best, child) => (child.ucb1() > best.ucb1() ? child : best),
      this.children[0] || null,
    );
  }
}

export default MCTSNode;
