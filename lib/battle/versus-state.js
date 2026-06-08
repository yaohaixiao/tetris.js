import Base from '@/lib/core';

/**
 * # 对战状态管理器
 *
 * 负责管理对战模式下的所有**状态数据**，包括运行状态、胜负结果、 双方分数和待处理垃圾行数。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                        |
 * | ---------------- | ------------------------------------------- |
 * | **运行状态管理** | 控制对战的开始/结束状态（running / winner） |
 * | **分数管理**     | 记录和更新双方玩家的胜场数                  |
 * | **垃圾行管理**   | 管理待处理垃圾行的累加、抵消、查询和清空    |
 * | **状态重置**     | 提供 reset() 方法恢复初始状态               |
 *
 * ## 设计原则
 *
 * VersusState 是一个**纯状态容器**，只负责数据的存储和简单计算， 不包含任何 UI 逻辑或事件处理。所有状态变更都是同步的。
 *
 * ## 数据结构
 *
 * ```javascript
 * {
 *   "running": false, // 对战是否进行中
 *   "winner": null, // 胜者 Game 实例（游戏结束时设置）
 *   "scores": {
 *     // 双方胜场数
 *     "Player1-0": 0,
 *     "Player2-1": 0
 *   },
 *   "pendingGarbage": {
 *     // 双方待处理的垃圾行数
 *     "Player1-0": 0, // 尚未发送给对手的垃圾行
 *     "Player2-1": 0 // 受到攻击后等待消行时抵消
 *   }
 * }
 * ```
 *
 * ## 玩家标识规则
 *
 * 使用 `{PlayerName}-{PlayerIndex}` 作为唯一标识：
 *
 * - 示例：`Alice-0`、`Bob-1`
 * - 用于 scores 和 pendingGarbage 的键
 * - 通过 `getPlayerId(game)` 方法生成
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
 * const state = new VersusState({ games: [game1, game2] });
 *
 * // 游戏运行中
 * state.setRunning(true);
 *
 * // 玩家消行时处理攻击
 * const attackLines = calculateGarbage(lines);
 * const actualGarbage = state.offsetGarbage(opponent, attackLines);
 * if (actualGarbage > 0) {
 *   state.addGarbage(player, actualGarbage);
 * }
 *
 * // 游戏结束
 * state.setWinner(winnerGame);
 * state.updateScores({ winner: winnerGame, loser: loserGame });
 * ```
 *
 * @augments Base
 * @class VersusState
 */
class VersusState extends Base {
  /**
   * ## 构造函数
   *
   * 初始化对战状态管理器，接收 Game 实例数组。 构造完成后立即调用 initialize() 初始化所有状态字段。
   *
   * @example
   *   const state = new VersusState({
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
    // 调用父类构造函数，传递配置选项
    super(options);

    // 立即初始化状态字段
    this.initialize();
  }

  /**
   * ## 初始化状态
   *
   * 公共初始化接口，内部委托给 `_initialize()` 私有方法。 这样设计的目的是：
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
   * 设置所有状态的初始值：
   *
   * 1. 设置 `running` 为 false（未开始）
   * 2. 清空 `winner`（无胜者）
   * 3. 初始化 `scores` 为空对象
   * 4. 初始化 `pendingGarbage` 为空对象
   * 5. 遍历所有 Game 实例，为每个玩家设置初始分数和垃圾行数为 0
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

    /** ======== 初始化核心状态字段 ======== */

    // 对战是否正在进行中
    this.running = false;

    // 胜者 Game 实例（null 表示尚未决出胜者）
    this.winner = null;

    // 双方胜场数记录（key: playerId, value: 胜场数）
    this.scores = {};

    /**
     * 待处理垃圾行记录：
     *
     * - Key: playerId（将要**接收**垃圾行的玩家）
     * - Value: 累积的垃圾行数量
     *
     * 注意：pendingGarbage[playerId] 表示该玩家**尚未处理**的垃圾行， 这些垃圾行在当前消行时可以被攻击力抵消。
     */
    this.pendingGarbage = {};

    // ======== 遍历所有 Game 实例，初始化玩家状态 ========

    for (const game of games) {
      // 生成玩家的唯一标识（如 "Alice-0"）
      const playerId = this.getPlayerId(game);

      // 初始化该玩家的胜场数为 0
      this.scores[playerId] = 0;

      // 初始化该玩家的待处理垃圾行为 0
      this.pendingGarbage[playerId] = 0;
    }
  }

  /**
   * ## 设置对战运行状态
   *
   * 控制对战的开始和结束。
   *
   * @example
   *   state.setRunning(true); // 开始对战
   *   state.setRunning(false); // 结束对战
   *
   * @param {boolean} running - True 表示对战进行中，false 表示已结束
   */
  setRunning(running) {
    this.running = running;
  }

  /**
   * ## 获取对战运行状态
   *
   * 查询对战是否正在进行中。
   *
   * @example
   *   if (state.isRunning()) {
   *     // 处理游戏逻辑
   *   }
   *
   * @returns {boolean} True 表示对战进行中，false 表示已结束或未开始
   */
  isRunning() {
    return this.running;
  }

  /**
   * ## 设置胜者
   *
   * 在游戏结束时调用，记录获胜的玩家。
   *
   * @example
   *   state.setWinner(gameInstance);
   *
   * @param {object} winner - 胜者的 Game 实例
   */
  setWinner(winner) {
    this.winner = winner;
  }

  /**
   * ## 获取胜者
   *
   * 查询当前对战的胜者。
   *
   * @example
   *   const winner = state.getWinner();
   *   if (winner) {
   *     console.log('胜者是：', winner.Player.name);
   *   }
   *
   * @returns {object | null} 胜者的 Game 实例，未决出胜者时返回 null
   */
  getWinner() {
    return this.winner;
  }

  /**
   * ## 获取指定玩家的分数
   *
   * 查询某位玩家的胜场数。
   *
   * @example
   *   const score = state.getScore('Alice-0');
   *   console.log(score); // 例如：3
   *
   * @param {string} id - 玩家唯一标识，格式为 `{name}-{index}`
   * @returns {number} 玩家的胜场数
   */
  getScore(id) {
    return this.scores[id];
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
   * - `Player.name`：玩家名称（如 "Alice"）
   * - `Player.index`：玩家索引（如 0 或 1）
   * - 连接符：`-`
   *
   * ### 示例
   *
   * | Player.name | Player.index | 生成的 ID |
   * | ----------- | ------------ | --------- |
   * | Alice       | 0            | `Alice-0` |
   * | Bob         | 1            | `Bob-1`   |
   *
   * @example
   *   const id = state.getPlayerId(game);
   *   console.log(id); // "Alice-0"
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
   *   state.updateScores({
   *     winner: game1, // Alice 获胜
   *     loser: game2, // Bob 落败
   *   });
   *   // Alice 胜场 +1，Bob 胜场不变
   *
   * @param {object} options - 更新选项
   * @param {object} options.winner - 胜者的 Game 实例
   * @param {object} options.loser - 败者的 Game 实例
   */
  updateScores(options) {
    // 解构出胜者和败者实例
    const { winner, loser } = options;

    // ========== 处理胜者分数 ==========

    // 获取胜者唯一标识
    const winnerId = this.getPlayerId(winner);

    // 获取胜者当前胜场数
    let winnerScore = this.scores[winnerId];

    // ========== 处理败者分数 ==========

    // 获取败者唯一标识
    const loserId = this.getPlayerId(loser);

    // 获取败者当前胜场数
    let loserScore = this.scores[loserId];

    // ========== 更新分数 ==========

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
    this.scores[winnerId] = winnerScore;
    this.scores[loserId] = loserScore;
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
   *   // Alice 受到 3 行垃圾攻击
   *   state.addGarbage(aliceGame, 3);
   *   // pendingGarbage['Alice-0'] 现在增加了 3
   *
   * @param {object} game - 受到攻击的玩家 Game 实例
   * @param {number} amount - 要添加的垃圾行数量
   */
  addGarbage(game, amount) {
    // 获取受攻击玩家的唯一标识
    const playerId = this.getPlayerId(game);

    /**
     * 累加垃圾行：
     *
     * - (this.pendingGarbage[playerId] || 0)：获取当前值，未初始化时默认为 0
     * - - Amount：加上新增的垃圾行数量
     *
     * 使用 || 0 作为防御性编程，确保即使键不存在也能正常工作。
     */
    this.pendingGarbage[playerId] =
      (this.pendingGarbage[playerId] || 0) + amount;
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
   *   // Bob 有 5 行待处理垃圾，消了 2 行（攻击力 1）
   *   const actualGarbage = state.offsetGarbage(bobGame, 1);
   *   // actualGarbage = 0（攻击力不足以抵消）
   *   // pendingGarbage['Bob-1'] 现在 = 4
   *
   * @example
   *   // Bob 有 2 行待处理垃圾，消了 4 行（攻击力 3）
   *   const actualGarbage = state.offsetGarbage(bobGame, 3);
   *   // actualGarbage = 1（抵消 2 行后剩余 1 行攻击力）
   *   // pendingGarbage['Bob-1'] 现在 = 0
   *
   * @param {object} game - 消行的玩家 Game 实例（拥有 pendingGarbage 的一方）
   * @param {number} attackLines - 本次消行产生的攻击力（垃圾行数）
   * @returns {number} 抵消后剩余的攻击力，即可实际发送给对手的垃圾行数
   */
  offsetGarbage(game, attackLines) {
    // 获取消行玩家的唯一标识
    const playerId = this.getPlayerId(game);

    // 获取该玩家当前的待处理垃圾行数（未初始化时默认为 0）
    const pending = this.pendingGarbage[playerId] || 0;

    /**
     * 计算抵消后的剩余垃圾行数： Math.max(0, pending - attackLines)
     *
     * - Pending - attackLines：待处理垃圾行减去攻击力
     * - Math.max(0, ...)：确保结果不为负数
     *
     * 例如：
     *
     * - Pending=5, attackLines=3 → remaining=2（还有 2 行垃圾未抵消）
     * - Pending=3, attackLines=5 → remaining=0（完全抵消）
     */
    const remaining = Math.max(0, pending - attackLines);

    // 更新该玩家的待处理垃圾行数
    this.pendingGarbage[playerId] = remaining;

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
   *   const pending = state.getPendingGarbage(game);
   *   console.log(`你有 ${pending} 行垃圾待处理`);
   *
   * @param {object} game - 要查询的玩家 Game 实例
   * @returns {number} 待处理的垃圾行数量，未初始化时返回 0
   */
  getPendingGarbage(game) {
    // 获取玩家唯一标识
    const playerId = this.getPlayerId(game);

    // 返回待处理垃圾行数，未初始化时返回 0
    return this.pendingGarbage[playerId] || 0;
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
   *   // 清除 Alice 的所有待处理垃圾
   *   state.clearGarbage(aliceGame);
   *   // pendingGarbage['Alice-0'] 现在 = 0
   *
   * @param {object} game - 要清空垃圾行的玩家 Game 实例
   */
  clearGarbage(game) {
    // 获取玩家唯一标识
    const playerId = this.getPlayerId(game);

    // 将该玩家的待处理垃圾行重置为 0
    this.pendingGarbage[playerId] = 0;
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
   *   // 一局对战结束后，重置状态准备下一局
   *   state.reset();
   *
   * @returns {void}
   */
  reset() {
    // 复用初始化逻辑完成状态重置
    this._initialize();
  }
}

export default VersusState;
