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
 *     BattleState（纯数据结构/模板）
 *       ↓ structuredClone（深拷贝）
 *     BattleStore.state（运行时状态）
 *       ↓ 通过方法读写
 *     BattleStore.setRunning() / getScore() / addGarbage() ...
 *
 * ## 垃圾行管理流程
 *
 *     玩家A消行 → 计算攻击力(lines) → offsetGarbage(玩家A, attackLines)
 *       ↓
 *     如果 attackLines > pendingGarbage[玩家A]：
 *       → 完全抵消 pending，剩余攻击力 = attackLines - pending
 *       → 调用 addGarbage(玩家B, 剩余攻击力) 发送给对手
 *     如果 attackLines <= pendingGarbage[玩家A]：
 *       → 只抵消对应数量的 pending，无垃圾行发送给对手
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
   * ### 执行顺序
   *
   * 1. 调用父类 Base 构造函数，将配置注入实例（this.games 可用）
   * 2. 调用 initialize() → _initialize() 深拷贝状态模板
   * 3. 遍历 games 数组，为每个玩家初始化分数和垃圾行
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
   * @param {object[]} options.games - Game 实例数组，用于初始化玩家状态 每个 Game 实例需要包含
   *   Player.name 和 Player.index
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，将配置对象中的所有属性注入实例
    // 完成后 this.games 即可访问 Game 实例数组
    super(options);

    // 所有配置就绪后，立即初始化状态数据
    this.initialize();
  }

  /**
   * ## 初始化状态（公共接口）
   *
   * 公共初始化接口，内部委托给 `_initialize()` 私有方法执行实际逻辑。
   *
   * ### 为什么分两层？
   *
   * - `initialize()`：清晰的公共 API，语义明确
   * - `_initialize()`：内部实现细节封装，可被 `reset()` 复用
   * - 遵循"接口与实现分离"原则
   *
   * ### 命名约定
   *
   * - 前缀 `_` 表示私有方法（JavaScript 无真正私有，这是约定俗成的）
   * - 外部调用者应使用 `initialize()` 或 `reset()`
   *
   * @returns {void}
   */
  initialize() {
    // 委托给内部实现
    this._initialize();
  }

  /**
   * ## 内部初始化实现
   *
   * 执行以下步骤完成状态初始化：
   *
   * 1. 通过 `structuredClone(BattleState)` 深拷贝初始状态模板
   * 2. 遍历所有 Game 实例，为每个玩家初始化分数和垃圾行数为 0
   *
   * ### 为什么用 structuredClone？
   *
   * - **深拷贝保证独立性**：每次初始化都创建全新的独立对象， 避免多个 BattleStore 实例共享同一份数据
   * - **性能优于 JSON**：比 `JSON.parse(JSON.stringify())` 性能更好， 且支持更多数据类型（如
   *   Date、Map、Set 等）
   * - **浏览器原生支持**：现代浏览器内置，无需额外 polyfill
   *
   * ### 为什么要为每个玩家初始化？
   *
   * - **确保条目存在**：所有玩家在 scores 和 pendingGarbage 中都有初始条目
   * - **避免 undefined**：后续访问如 `scores[playerId]` 不会返回 `undefined`
   * - **数据一致性**：初始化后数据结构完整，减少后续防御性检查
   *
   * @private
   * @returns {void}
   */
  _initialize() {
    // 从实例上解构 games 数组（由 Base 构造函数注入）
    const { games } = this;

    /**
     * 深拷贝初始状态模板：
     *
     * BattleState 定义了状态的初始结构：
     *
     * - Running: false — 对战未开始
     * - Winner: null — 尚无胜者
     * - RoundId: 0 — 回合编号从 0 开始
     * - Scores: {} — 空分数记录
     * - PendingGarbage: {} — 空垃圾行记录
     *
     * 通过 structuredClone 创建全新的独立副本。
     */
    this.state = structuredClone(BattleState);

    // 解构出需要初始化的子对象引用
    // 注意：这里解构的是引用，后续修改会直接影响 this.state
    const { scores, pendingGarbage } = this.state;

    // ======== 遍历所有 Game 实例，初始化玩家状态 ========
    for (const game of games) {
      /**
       * 生成玩家的唯一标识：
       *
       * GetPlayerId 会拼接 Player.name 和 Player.index， 例如 "human-0"、"ai-1"。
       */
      const playerId = this.getPlayerId(game);

      /**
       * 初始化该玩家的胜场数为 0：
       *
       * 设置 scores 对象中对应 playerId 的值为 0， 确保查询时不会返回 undefined。
       */
      scores[playerId] = 0;

      /**
       * 初始化该玩家的待处理垃圾行为 0：
       *
       * 设置 pendingGarbage 对象中对应 playerId 的值为 0， 表示该玩家当前没有待处理的垃圾行攻击。
       */
      pendingGarbage[playerId] = 0;
    }
  }

  /**
   * ## 设置对战运行状态
   *
   * 控制对战的开始和结束。这是对战生命周期的核心开关。
   *
   * ### 状态影响
   *
   * - `true`：游戏循环运行，玩家可以操作
   * - `false`：游戏逻辑暂停，等待 restart 或 reset
   *
   * ### 调用时机
   *
   * - `start()` 中调用 `setRunning(true)`
   * - `stop()` 中调用 `setRunning(false)`
   * - `reset()` 中间接调用（通过 `_initialize()` 重置为 false）
   *
   * @example
   *   store.setRunning(true); // 开始对战
   *   store.setRunning(false); // 暂停/结束对战
   *
   * @param {boolean} running - True 表示对战进行中，false 表示已结束或暂停
   */
  setRunning(running) {
    // 直接修改状态对象中的 running 字段
    this.state.running = running;
  }

  /**
   * ## 获取对战运行状态
   *
   * 查询对战是否正在进行中。这是一个纯查询方法，不产生副作用。
   *
   * ### 使用场景
   *
   * - 在 start() 中做幂等性检查（已在运行则不重复启动）
   * - 在 stop() 中做幂等性检查（已停止则不重复停止）
   * - 外部判断是否可以处理游戏输入
   *
   * @example
   *   if (store.isRunning()) {
   *     // 对战进行中，处理游戏逻辑
   *   }
   *
   * @returns {boolean} True 表示对战进行中，false 表示已结束或未开始
   */
  isRunning() {
    // 返回当前运行状态
    return this.state.running;
  }

  /**
   * ## 设置单局胜者
   *
   * 在单局游戏结束时调用，记录本局获胜的玩家。
   *
   * ### 与 updateScores 的区别
   *
   * - `setWinner`：记录"这一局谁赢了"（即时状态）
   * - `updateScores`：更新"总共赢了多少局"（累计数据）
   *
   * ### 重置时机
   *
   * - 每次 `update()` 调用前会被覆盖
   * - `reset()` 时被清空为 null
   *
   * @example
   *   store.setWinner(gameInstance);
   *   // 后续可通过 getWinner() 获取胜者信息
   *
   * @param {object} winner - 胜者的 Game 实例
   */
  setWinner(winner) {
    // 将胜者 Game 实例直接存储在状态中
    this.state.winner = winner;
  }

  /**
   * ## 获取单局胜者
   *
   * 查询当前单局的胜者。如果本局尚未结束或已重置，返回 null。
   *
   * ### 返回值说明
   *
   * - 返回 Game 实例：有确定的胜者
   * - 返回 null：本局尚未决出胜者，或状态已被重置
   *
   * @example
   *   const winner = store.getWinner();
   *   if (winner) {
   *     console.log('本局胜者是：', winner.Player.name);
   *   }
   *
   * @returns {object | null} 胜者的 Game 实例，未决出胜者时返回 null
   */
  getWinner() {
    // 返回存储的胜者引用
    return this.state.winner;
  }

  /**
   * ## 获取指定玩家的分数
   *
   * 查询某位玩家的累计胜场数。
   *
   * ### 分数含义
   *
   * - 每赢一局 +1
   * - 整场对战中累积
   * - 先达到 victoryScore 的玩家赢得整场对战
   *
   * @example
   *   const score = store.getScore('human-0');
   *   console.log(score); // 例如：3（表示赢了 3 局）
   *
   * @param {string} id - 玩家唯一标识，格式为 `{name}-{index}`，如 "human-0"
   * @returns {number} 玩家的胜场数，未初始化时可能为 undefined
   */
  getScore(id) {
    // 从 scores 对象中查询对应 id 的分数
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
   * - `Player.name`：玩家名称（如 "human"、"ai"、"Alice"）
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
   * ### 为什么需要统一方法？
   *
   * - **一致性**：所有地方使用相同的规则生成 ID
   * - **可维护性**：如果 ID 规则变化，只需修改一处
   * - **避免硬编码**：防止各处手动拼接导致的格式不一致
   *
   * @example
   *   const id = store.getPlayerId(game);
   *   console.log(id); // "human-0"
   *
   * @param {object} game - Game 实例
   * @param {object} game.Player - 玩家信息对象
   * @param {string} game.Player.name - 玩家名称
   * @param {number} game.Player.index - 玩家索引
   * @returns {string} 玩家唯一标识字符串
   */
  getPlayerId(game) {
    // 从 Game 实例中解构出玩家信息
    const { Player } = game;

    /**
     * 拼接生成唯一标识：
     *
     * 使用模板字符串将 name 和 index 用 "-" 连接。 例如：Player.name = "human", Player.index =
     * 0 → "human-0"
     */
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
   * - **败者**：胜场数不变，但如果当前值 ≤ 0，重置为 0
   *
   * ### 为什么败者分数要检查 ≤ 0？
   *
   * 理论上败者分数不会为负，这是一个**防御性检查**：
   *
   * - 防止外部错误调用或状态异常导致分数为负
   * - 确保数据完整性——胜场数永远是非负整数
   * - 在 reset() 后分数为 0，败者保持 0 是合理的
   *
   * ### 副作用
   *
   * 此方法会直接修改 `this.state.scores` 对象中的值。 调用后需要通过 `hud.updateScores()` 同步 UI。
   *
   * @example
   *   store.updateScores({
   *     winner: game1, // human 获胜
   *     loser: game2, // ai 落败
   *   });
   *   // human 胜场 +1，ai 胜场不变（如果 ≤ 0 则为 0）
   *
   * @param {object} options - 更新选项
   * @param {object} options.winner - 胜者的 Game 实例
   * @param {object} options.loser - 败者的 Game 实例
   */
  updateScores(options) {
    // 解构出胜者和败者实例
    const { winner, loser } = options;
    // 获取 scores 对象的引用（直接修改会影响 this.state）
    const { scores } = this.state;

    /* ========== 处理胜者分数 ========== */
    // 获取胜者唯一标识（如 "human-0"）
    const winnerId = this.getPlayerId(winner);
    // 获取胜者当前胜场数
    let winnerScore = scores[winnerId];

    /* ========== 处理败者分数 ========== */
    // 获取败者唯一标识（如 "ai-1"）
    const loserId = this.getPlayerId(loser);
    // 获取败者当前胜场数
    let loserScore = scores[loserId];

    /* ========== 更新分数 ========== */
    /**
     * 胜者胜场数 +1：
     *
     * 每赢一局加一分，累计到整场对战结束。 当胜者分数达到 victoryScore 时，整场对战结束。
     */
    winnerScore += 1;

    /**
     * 防御性检查：确保败者胜场数不为负数：
     *
     * 正常情况下败者分数不会为负，但如果状态异常 （如外部错误修改），这里会兜底重置为 0。
     */
    if (loserScore <= 0) {
      loserScore = 0;
    }

    /**
     * 将更新后的分数写回状态对象：
     *
     * 注意：scores 是 this.state.scores 的引用， 所以这里直接修改会影响 BattleStore 的状态。
     */
    scores[winnerId] = winnerScore;
    scores[loserId] = loserScore;
  }

  /**
   * ## 累加待处理垃圾行
   *
   * 当玩家受到攻击时，将攻击产生的垃圾行累加到该玩家的 `pendingGarbage` 中。这些垃圾行不会立即生效，而是等待 消行动画结束后通过
   * `flushGarbage` 实际应用到棋盘。
   *
   * ### 处理流程
   *
   *     对手消行产生攻击 → addGarbage(受攻击玩家, 垃圾行数)
   *       → pendingGarbage[受攻击玩家] += 垃圾行数
   *       → 等待受攻击玩家消行时可通过 offsetGarbage 抵消
   *
   * ### 为什么延迟处理？
   *
   * - **公平性**：给被攻击者一个反击/抵消的机会
   * - **策略性**：玩家可以通过快速消行来抵消即将到来的垃圾行
   * - **视觉流畅**：垃圾行在消行动画结束后才出现，不会视觉重叠
   *
   * ### 与其他方法的关系
   *
   * - 数据流入：`processAttack()` → `addGarbage()`
   * - 数据抵消：`offsetGarbage()` 减少 pending
   * - 数据流出：`flushGarbage()` 后调用 `clearGarbage()` 清零
   *
   * @example
   *   // human 受到 3 行垃圾攻击
   *   store.addGarbage(humanGame, 3);
   *   // pendingGarbage['human-0'] 现在增加了 3
   *
   * @param {object} game - 受到攻击的玩家 Game 实例
   * @param {number} amount - 要添加的垃圾行数量（正整数）
   */
  addGarbage(game, amount) {
    // 获取 pendingGarbage 对象的引用
    const { pendingGarbage } = this.state;

    // 获取受攻击玩家的唯一标识
    const playerId = this.getPlayerId(game);

    /**
     * 累加垃圾行：
     *
     * - (pendingGarbage[playerId] || 0)：获取当前待处理垃圾行数， 如果该键尚未初始化，默认使用 0
     * - - Amount：加上本次新增的垃圾行数量
     *
     * 使用 || 0 作为防御性编程： 虽然 _initialize() 中已为所有玩家初始化为 0， 但这里仍然做兜底处理，防止意外情况。
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
   * | pending | attackLines | 抵消后 pending | 返回值（发给对手） | 说明                 |
   * | ------- | ----------- | -------------- | ------------------ | -------------------- |
   * | 5       | 3           | 2              | 0                  | 攻击力不足，无法反击 |
   * | 3       | 5           | 0              | 2                  | 抵消后有剩余攻击力   |
   * | 0       | 4           | 0              | 4                  | 全部转为攻击         |
   * | 2       | 2           | 0              | 0                  | 刚好抵消             |
   *
   * ### 战术意义
   *
   * 这个机制赋予了消行**双重价值**：
   *
   * - **攻击**：没有 pending 时，消行直接产生攻击力
   * - **防御**：有 pending 时，消行优先用于抵消即将到来的伤害
   *
   * @example
   *   // ai 有 5 行待处理垃圾，消了 2 行（攻击力 1）
   *   const actualGarbage = store.offsetGarbage(aiGame, 1);
   *   // actualGarbage = 0（攻击力不足以完全抵消）
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
    // 获取 pendingGarbage 对象的引用
    const { pendingGarbage } = this.state;

    // 获取消行玩家的唯一标识
    const playerId = this.getPlayerId(game);

    /**
     * 获取该玩家当前的待处理垃圾行数：
     *
     * 使用 || 0 确保未初始化时默认值为 0。 虽然 _initialize() 已做了初始化，但这里仍然做防御性处理。
     */
    const pending = pendingGarbage[playerId] || 0;

    /**
     * 计算抵消后的剩余垃圾行数：
     *
     * Math.max(0, pending - attackLines)
     *
     * - Pending - attackLines：待处理垃圾行减去消行攻击力
     * - Math.max(0, ...)：确保结果不为负数
     *
     * 结果含义：
     *
     * - 0：攻击力足够完全抵消或超过 pending
     * - > 0：攻击力不足以完全抵消，还剩多少 pending
     */
    const remaining = Math.max(0, pending - attackLines);

    /**
     * 更新该玩家的待处理垃圾行数：
     *
     * 将抵消后的剩余值写回状态。 注意：pendingGarbage 是 this.state 的引用， 这里直接修改会影响 BattleStore
     * 的状态。
     */
    pendingGarbage[playerId] = remaining;

    /**
     * 计算实际能发送给对手的垃圾行数：
     *
     * 如果 remaining > 0（攻击力未能完全抵消）： → 返回 0，无剩余攻击力可发送
     *
     * 如果 remaining = 0（攻击力完全抵消或超过）： → 返回 attackLines - pending →
     * 该值为正时表示抵消后剩余的净攻击力 → 该值为 0 时表示刚好完全抵消
     *
     * 简化理解：
     *
     * - AttackLines > pending → 返回差值（净攻击力）
     * - AttackLines <= pending → 返回 0
     */
    return remaining > 0 ? 0 : attackLines - pending;
  }

  /**
   * ## 获取待处理垃圾行数
   *
   * 查询某位玩家当前累积的待处理垃圾行数量。
   *
   * ### 使用场景
   *
   * - `flushGarbage()` 中判断是否有垃圾行需要应用到棋盘
   * - UI 层显示垃圾行预警（如"即将受到 X 行攻击"）
   * - 调试和测试
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

    /**
     * 返回待处理垃圾行数：
     *
     * 使用 || 0 确保未初始化时返回 0 而非 undefined。 这简化了调用方的逻辑——始终得到一个数字。
     */
    return this.state.pendingGarbage[playerId] || 0;
  }

  /**
   * ## 清空待处理垃圾行
   *
   * 将某位玩家的待处理垃圾行数重置为 0。
   *
   * ### 使用场景
   *
   * - **垃圾行已应用**：`flushGarbage()` 将垃圾行写入棋盘后清零
   * - **游戏结束/重置**：清除所有待处理状态
   * - **特殊道具效果**：如"清除全部垃圾行"道具
   * - **调试和测试**：手动清理状态
   *
   * ### 注意事项
   *
   * - 此方法只清零 pending 计数器，不影响已经应用到棋盘的垃圾行
   * - 如果垃圾行尚未 flush 就调用此方法，攻击会被"吞掉"
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

    /**
     * 将该玩家的待处理垃圾行重置为 0：
     *
     * 直接赋值为 0，覆盖之前累积的所有垃圾行。 注意：pendingGarbage 是 this.state 的引用， 这里直接修改会影响
     * BattleStore 的状态。
     */
    this.state.pendingGarbage[playerId] = 0;
  }

  /**
   * ## 递增回合编号
   *
   * 每局对战结束后调用，将回合编号 +1。
   *
   * ### 用途
   *
   * - 动画系统使用 roundId 判断动画是否属于当前回合
   * - 如果动画的 roundId 与当前回合不一致，说明动画已过期
   * - 避免跨回合的动画残留
   *
   * ### 调用时机
   *
   * 在 `restart()` 中，清除双方动画之前调用。
   *
   * @returns {void}
   */
  increaseRound() {
    // 回合编号自增
    this.state.roundId += 1;
  }

  /**
   * ## 获取当前回合编号
   *
   * 返回当前对战的回合编号。
   *
   * ### 用途
   *
   * - 动画创建时记录当前 roundId
   * - 动画渲染时比对 roundId 判断是否过期
   * - 日志和调试
   *
   * @returns {number} 当前回合的唯一标识编号
   */
  getRoundId() {
    // 返回当前回合编号
    return this.state.roundId;
  }

  /**
   * ## 重置状态
   *
   * 将所有状态恢复到初始值。内部委托给 `_initialize()` 方法， 确保重置逻辑与初始化逻辑完全一致。
   *
   * ### 重置内容
   *
   * | 字段             | 重置后的值   |
   * | ---------------- | ------------ |
   * | `running`        | `false`      |
   * | `winner`         | `null`       |
   * | `roundId`        | `0`          |
   * | `scores`         | 所有玩家归零 |
   * | `pendingGarbage` | 所有玩家归零 |
   *
   * ### 设计优势
   *
   * 通过复用 `_initialize()` 实现重置：
   *
   * - **DRY 原则**：初始化逻辑只写一次
   * - **一致性保证**：重置后的状态与初始状态完全相同
   * - **维护性**：新增状态字段时只需修改一处
   *
   * ### 调用时机
   *
   * - 整场对战结束后，用户按 Enter 重赛
   * - 外部强制重置
   *
   * @example
   *   // 整场对战结束后，重置状态准备下一场
   *   store.reset();
   *   // 所有数据回到初始值，可以开始新的对战
   *
   * @returns {void}
   */
  reset() {
    /**
     * 复用 _initialize() 逻辑完成状态重置：
     *
     * _initialize() 会：
     *
     * 1. StructuredClone(BattleState) 创建全新的状态对象
     * 2. 遍历 games 重新初始化所有玩家的分数和垃圾行
     *
     * 这确保了重置后的状态与构造函数中初始化的状态完全一致。
     */
    this._initialize();
  }
}

export default BattleStore;
