import Base from '@/lib/core';
import BattleState from '@/lib/battle/battle-state.js';

/**
 * # 对战状态管理器
 *
 * 负责管理对战模式下的所有状态数据，包括运行状态、胜负结果、 双方分数和待处理垃圾行数。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                        |
 * | ---------------- | ------------------------------------------- |
 * | **运行状态管理** | 控制对战的开始/结束状态（running / winner） |
 * | **分数管理**     | 记录和更新双方玩家的胜场数                  |
 * | **垃圾行管理**   | 管理待处理垃圾行的累加、抵消、查询和清空    |
 * | **状态重置**     | 提供 reset() 方法恢复初始状态               |
 * | **玩家标识**     | 提供 getPlayerId() 统一生成 playerId        |
 *
 * ## 设计原则
 *
 * BattleStore 是**数据 + 逻辑**的组合：
 *
 * - 数据存储在 `this.state` 中，初始化时通过 `structuredClone(BattleState)` 深拷贝
 * - 所有状态变更都通过实例方法进行，保证数据访问的一致性
 * - 不包含任何 UI 逻辑或事件处理
 *
 * ## 与 BattleState 的关系
 *
 *     BattleState（纯数据结构）
 *       ↓ structuredClone
 *     BattleStore.state（运行时状态）
 *       ↓ 通过方法读写
 *     BattleStore.setRunning() / getScore() / addGarbage() ...
 *
 * ## 垃圾行管理流程
 *
 *     玩家A消行 → 计算攻击力(lines) → offsetGarbage(玩家B, attackLines)
 *       ↓
 *     如果 attackLines > pendingGarbage[玩家B]：
 *       → 抵消全部 pending，剩余攻击力 = 实际发送的垃圾行
 *       → 调用 addGarbage(玩家A, 剩余攻击力) 发送给对手
 *     如果 attackLines <= pendingGarbage[玩家B]：
 *       → 只抵消对应数量的 pending，无垃圾行发送
 *
 * ## 典型使用场景
 *
 * ```javascript
 * const store = new BattleStore({ games: [game1, game2] });
 *
 * // 游戏运行中
 * store.setRunning(true);
 *
 * // 玩家消行时处理攻击
 * const attackLines = calculateGarbage(lines);
 * const actualGarbage = store.offsetGarbage(opponent, attackLines);
 * if (actualGarbage > 0) {
 *   store.addGarbage(player, actualGarbage);
 * }
 *
 * // 游戏结束
 * store.setWinner(winnerGame);
 * store.updateScores({ winner: winnerGame, loser: loserGame });
 *
 * // 重置
 * store.reset();
 * ```
 *
 * @augments Base
 * @class BattleStore
 */
class BattleStore extends Base {
  /**
   * ## 构造函数
   *
   * 初始化对战状态管理器，接收 Game 实例数组。 构造完成后立即调用 initialize() 初始化所有状态字段。
   *
   * @example
   *   const store = new BattleStore({
   *     games: [
   *       { Player: { name: 'Alice', index: 0 } },
   *       { Player: { name: 'Bob', index: 1 } },
   *     ],
   *   });
   *
   * @param {object} options - 配置选项
   * @param {object[]} options.games - Game 实例数组，用于初始化玩家状态
   */
  constructor(options) {
    // 调用父类构造函数，传递配置选项（依赖注入）
    super(options);

    // 立即初始化状态
    this.initialize();
  }

  /**
   * ## 初始化状态
   *
   * 公共初始化接口，内部委托给 `_initialize()` 私有方法。
   *
   * 这样设计的目的是：
   *
   * - 提供清晰的公共 API（`initialize`）
   * - 内部实现细节封装在 `_initialize` 中
   * - `reset()` 可以复用 `_initialize` 逻辑
   *
   * @returns {void}
   */
  initialize() {
    this._initialize();
  }

  /**
   * ## 内部初始化实现
   *
   * 执行以下步骤：
   *
   * 1. 通过 `structuredClone(BattleState)` 深拷贝初始状态模板
   * 2. 遍历所有 Game 实例，为每个玩家初始化分数和垃圾行数为 0
   *
   * ### 为什么用 structuredClone？
   *
   * - 深拷贝保证每次初始化都是全新的独立对象
   * - 避免多个 BattleStore 实例共享同一份数据
   * - 比 JSON.parse(JSON.stringify()) 性能更好，且支持更多类型
   *
   * ### 为什么要为每个玩家初始化？
   *
   * - 确保所有玩家在 scores 和 pendingGarbage 中都有条目
   * - 避免后续访问时出现 `undefined`
   * - 保证数据结构的一致性
   *
   * @private
   * @returns {void}
   */
  _initialize() {
    // 从配置中获取 Game 实例数组
    const { games } = this;

    /**
     * 深拷贝初始状态模板：
     *
     * - Running: false
     * - Winner: null
     * - Scores: {}
     * - PendingGarbage: {}
     */
    this.state = structuredClone(BattleState);

    // 解构出需要初始化的子对象
    const { scores, pendingGarbage } = this.state;

    // ======== 遍历所有 Game 实例，初始化玩家状态 ========
    for (const game of games) {
      // 生成玩家的唯一标识（如 "human-0"、"ai-1"）
      const playerId = this.getPlayerId(game);

      // 初始化该玩家的胜场数为 0
      scores[playerId] = 0;

      // 初始化该玩家的待处理垃圾行为 0
      pendingGarbage[playerId] = 0;
    }
  }

  /**
   * ## 设置对战运行状态
   *
   * 控制对战的开始和结束。
   *
   * @example
   *   store.setRunning(true); // 开始对战
   *   store.setRunning(false); // 结束对战
   *
   * @param {boolean} running - True 表示对战进行中，false 表示已结束
   */
  setRunning(running) {
    this.state.running = running;
  }

  /**
   * ## 获取对战运行状态
   *
   * 查询对战是否正在进行中。
   *
   * @example
   *   if (store.isRunning()) {
   *     // 处理游戏逻辑
   *   }
   *
   * @returns {boolean} True 表示对战进行中，false 表示已结束或未开始
   */
  isRunning() {
    return this.state.running;
  }

  /**
   * ## 设置单局胜者
   *
   * 在单局游戏结束时调用，记录获胜的玩家。
   *
   * @example
   *   store.setWinner(gameInstance);
   *
   * @param {object} winner - 胜者的 Game 实例
   */
  setWinner(winner) {
    this.state.winner = winner;
  }

  /**
   * ## 获取单局胜者
   *
   * 查询当前单局的胜者。
   *
   * @example
   *   const winner = store.getWinner();
   *   if (winner) {
   *     console.log('胜者是：', winner.Player.name);
   *   }
   *
   * @returns {object | null} 胜者的 Game 实例，未决出胜者时返回 null
   */
  getWinner() {
    return this.state.winner;
  }

  /**
   * ## 获取指定玩家的分数
   *
   * 查询某位玩家的胜场数。
   *
   * @example
   *   const score = store.getScore('human-0');
   *   console.log(score); // 例如：3
   *
   * @param {string} id - 玩家唯一标识，格式为 `{name}-{index}`
   * @returns {number} 玩家的胜场数
   */
  getScore(id) {
    return this.state.scores[id];
  }

  /**
   * ## 获取玩家唯一标识
   *
   * 根据 Game 实例生成玩家的唯一标识 ID。
   *
   * ### ID 生成规则
   *
   *     {Player.name}-{Player.index}
   *
   * - `Player.name`：玩家名称（如 "human"、"ai"）
   * - `Player.index`：玩家索引（如 0 或 1）
   * - 连接符：`-`
   *
   * ### 示例
   *
   * | Player.name | Player.index | 生成的 ID |
   * | ----------- | ------------ | --------- |
   * | human       | 0            | `human-0` |
   * | ai          | 1            | `ai-1`    |
   * | Alice       | 0            | `Alice-0` |
   *
   * @example
   *   const id = store.getPlayerId(game);
   *   console.log(id); // "human-0"
   *
   * @param {object} game - Game 实例
   * @param {object} game.Player - 玩家信息
   * @param {string} game.Player.name - 玩家名称
   * @param {number} game.Player.index - 玩家索引
   * @returns {string} 玩家唯一标识
   */
  getPlayerId(game) {
    // 从 Game 实例中解构出玩家信息
    const { Player } = game;

    // 拼接名称和索引生成唯一标识
    return `${Player.name}-${Player.index}`;
  }

  /**
   * ## 更新双方胜场数
   *
   * 在一局对战结束后调用，给胜者增加 1 个胜场， 同时确保败者的胜场数不会变成负数。
   *
   * ### 更新规则
   *
   * - **胜者**：胜场数 +1
   * - **败者**：胜场数不变（但如果 ≤ 0，重置为 0）
   *
   * ### 为什么败者分数可能为负？
   *
   * 理论上败者分数不会为负，这是一个**防御性检查**：
   *
   * - 防止外部错误调用导致分数异常
   * - 确保数据完整性
   *
   * @example
   *   store.updateScores({
   *     winner: game1, // human 获胜
   *     loser: game2, // ai 落败
   *   });
   *   // human 胜场 +1，ai 胜场不变
   *
   * @param {object} options - 更新选项
   * @param {object} options.winner - 胜者的 Game 实例
   * @param {object} options.loser - 败者的 Game 实例
   */
  updateScores(options) {
    // 解构出胜者和败者实例
    const { winner, loser } = options;
    const { scores } = this.state;

    /* ========== 处理胜者分数 ========== */
    // 获取胜者唯一标识
    const winnerId = this.getPlayerId(winner);
    // 获取胜者当前胜场数
    let winnerScore = scores[winnerId];

    /* ========== 处理败者分数 ========== */
    // 获取败者唯一标识
    const loserId = this.getPlayerId(loser);
    // 获取败者当前胜场数
    let loserScore = scores[loserId];

    /* ========== 更新分数 ========== */
    // 胜者胜场数 +1
    winnerScore += 1;

    /**
     * 防御性检查：确保败者胜场数不为负数
     *
     * 如果败者分数 ≤ 0，重置为 0。 这保证了分数的非负性，避免数据异常。
     */
    if (loserScore <= 0) {
      loserScore = 0;
    }

    // 将更新后的分数写回状态对象
    scores[winnerId] = winnerScore;
    scores[loserId] = loserScore;
  }

  /**
   * ## 累加待处理垃圾行
   *
   * 当玩家受到攻击时，将攻击产生的垃圾行累加到该玩家的 `pendingGarbage` 中。这些垃圾行不会立即生效，而是等待
   * 该玩家消行时尝试用攻击力抵消。
   *
   * ### 处理流程
   *
   *     对手消行产生攻击 → addGarbage(受攻击玩家, 垃圾行数)
   *       → pendingGarbage[受攻击玩家] += 垃圾行数
   *       → 等待受攻击玩家消行时通过 offsetGarbage 抵消
   *
   * ### 为什么延迟处理？
   *
   * - **公平性**：给被攻击者一个反击的机会
   * - **策略性**：玩家可以通过快速消行来抵消即将到来的垃圾行
   * - **视觉流畅**：垃圾行在消行动画结束后才出现
   *
   * @example
   *   // human 受到 3 行垃圾攻击
   *   store.addGarbage(humanGame, 3);
   *   // pendingGarbage['human-0'] 现在增加了 3
   *
   * @param {object} game - 受到攻击的玩家 Game 实例
   * @param {number} amount - 要添加的垃圾行数量
   */
  addGarbage(game, amount) {
    const { pendingGarbage } = this.state;

    // 获取受攻击玩家的唯一标识
    const playerId = this.getPlayerId(game);

    /**
     * 累加垃圾行：
     *
     * - (pendingGarbage[playerId] || 0)：获取当前值，未初始化时默认为 0
     * - - Amount：加上新增的垃圾行数量
     *
     * 使用 || 0 作为防御性编程，确保即使键不存在也能正常工作。
     */
    pendingGarbage[playerId] = (pendingGarbage[playerId] || 0) + amount;
  }

  /**
   * ## 用消行攻击抵消待处理垃圾行
   *
   * 当玩家消行时，用产生的攻击力抵消自己累积的待处理垃圾行。 返回实际能够发送给对手的垃圾行数量。
   *
   * ### 抵消逻辑
   *
   *     玩家消行（attackLines） vs 待处理垃圾行（pending）
   *
   *     情况 1：attackLines > pending
   *       → 完全抵消 pending
   *       → pending 清零
   *       → 返回 attackLines - pending（剩余攻击力发给对手）
   *
   *     情况 2：attackLines <= pending
   *       → 抵消对应数量的 pending
   *       → pending 减少 attackLines
   *       → 返回 0（无剩余攻击力发送给对手）
   *
   *     情况 3：pending = 0
   *       → 无垃圾行需要抵消
   *       → 返回 attackLines（全部攻击力发给对手）
   *
   * ### 举例说明
   *
   * | pending | attackLines | 抵消后 pending | 返回值（发给对手） |
   * | ------- | ----------- | -------------- | ------------------ |
   * | 5       | 3           | 2              | 0（攻击力不足）    |
   * | 3       | 5           | 0              | 2（剩余攻击力）    |
   * | 0       | 4           | 0              | 4（全部攻击）      |
   * | 2       | 2           | 0              | 0（刚好抵消）      |
   *
   * @example
   *   // ai 有 5 行待处理垃圾，消了 2 行（攻击力 1）
   *   const actualGarbage = store.offsetGarbage(aiGame, 1);
   *   // actualGarbage = 0（攻击力不足以抵消）
   *   // pendingGarbage['ai-1'] 现在 = 4
   *
   * @example
   *   // ai 有 2 行待处理垃圾，消了 4 行（攻击力 3）
   *   const actualGarbage = store.offsetGarbage(aiGame, 3);
   *   // actualGarbage = 1（抵消 2 行后剩余 1 行攻击力）
   *   // pendingGarbage['ai-1'] 现在 = 0
   *
   * @param {object} game - 消行的玩家 Game 实例（拥有 pendingGarbage 的一方）
   * @param {number} attackLines - 本次消行产生的攻击力（垃圾行数）
   * @returns {number} 抵消后剩余的攻击力，即可实际发送给对手的垃圾行数
   */
  offsetGarbage(game, attackLines) {
    const { pendingGarbage } = this.state;

    // 获取消行玩家的唯一标识
    const playerId = this.getPlayerId(game);

    // 获取该玩家当前的待处理垃圾行数（未初始化时默认为 0）
    const pending = pendingGarbage[playerId] || 0;

    /**
     * 计算抵消后的剩余垃圾行数： Math.max(0, pending - attackLines)
     *
     * - Pending - attackLines：待处理垃圾行减去攻击力
     * - Math.max(0, ...)：确保结果不为负数
     */
    const remaining = Math.max(0, pending - attackLines);

    // 更新该玩家的待处理垃圾行数
    pendingGarbage[playerId] = remaining;

    /**
     * 计算实际能发送给对手的垃圾行数：
     *
     * - 如果 remaining > 0：攻击力不足以完全抵消 pending，返回 0
     * - 如果 remaining = 0：攻击力完全抵消或超过 pending，返回剩余攻击力
     *
     * 返回值 = attackLines - pending（仅在 attackLines > pending 时为正） = 0（当
     * attackLines <= pending 时）
     */
    return remaining > 0 ? 0 : attackLines - pending;
  }

  /**
   * ## 获取待处理垃圾行数
   *
   * 查询某位玩家当前累积的待处理垃圾行数量。
   *
   * @example
   *   const pending = store.getPendingGarbage(game);
   *   console.log(`你有 ${pending} 行垃圾待处理`);
   *
   * @param {object} game - 要查询的玩家 Game 实例
   * @returns {number} 待处理的垃圾行数量，未初始化时返回 0
   */
  getPendingGarbage(game) {
    // 获取玩家唯一标识
    const playerId = this.getPlayerId(game);

    // 返回待处理垃圾行数，未初始化时返回 0
    return this.state.pendingGarbage[playerId] || 0;
  }

  /**
   * ## 清空待处理垃圾行
   *
   * 将某位玩家的待处理垃圾行数重置为 0。
   *
   * ### 使用场景
   *
   * - 游戏结束/重置时，清除所有待处理状态
   * - 特殊道具效果（如清除全部垃圾行）
   * - 调试和测试
   *
   * @example
   *   // 清除 human 的所有待处理垃圾
   *   store.clearGarbage(humanGame);
   *   // pendingGarbage['human-0'] 现在 = 0
   *
   * @param {object} game - 要清空垃圾行的玩家 Game 实例
   */
  clearGarbage(game) {
    // 获取玩家唯一标识
    const playerId = this.getPlayerId(game);

    // 将该玩家的待处理垃圾行重置为 0
    this.state.pendingGarbage[playerId] = 0;
  }

  /**
   * ## 重置状态
   *
   * 将所有状态恢复到初始值。内部委托给 `_initialize()` 方法， 确保重置逻辑与初始化逻辑完全一致。
   *
   * ### 重置内容
   *
   * - `running` → false
   * - `winner` → null
   * - `scores` → 所有玩家归零
   * - `pendingGarbage` → 所有玩家归零
   *
   * @example
   *   // 整场对战结束后，重置状态准备下一场
   *   store.reset();
   *
   * @returns {void}
   */
  reset() {
    // 复用初始化逻辑完成状态重置
    this._initialize();
  }
}

export default BattleStore;
