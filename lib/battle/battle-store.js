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

    // 解构出需要初始化的子对象引用，后续修改会直接影响 this.state
    const { scores, pendingGarbage } = this.state;

    // ======== 遍历所有 Game 实例，初始化玩家状态 ========
    for (const game of games) {
      /**
       * 生成玩家的唯一标识： getPlayerId 会拼接 Player.name 和 Player.index， 例如
       * "human-0"、"ai-1"。
       */
      const playerId = this.getPlayerId(game);

      /** 初始化该玩家的胜场数为 0： 设置 scores 对象中对应 playerId 的值为 0， 确保查询时不会返回 undefined。 */
      scores[playerId] = 0;

      /**
       * 初始化该玩家的待处理垃圾行为 0： 设置 pendingGarbage 对象中对应 playerId 的值为 0，
       * 表示该玩家当前没有待处理的垃圾行攻击。
       */
      pendingGarbage[playerId] = 0;
    }
  }

  /**
   * ## 设置对战运行状态
   *
   * 控制对战的开始和结束。这是对战生命周期的核心开关。
   *
   * @param {boolean} running - True 表示对战进行中，false 表示已结束或暂停
   */
  setRunning(running) {
    this.state.running = running;
  }

  /**
   * ## 获取对战运行状态
   *
   * 查询对战是否正在进行中。
   *
   * @returns {boolean} True 表示对战进行中，false 表示已结束或未开始
   */
  isRunning() {
    return this.state.running;
  }

  /**
   * ## 设置单局胜者
   *
   * 在单局游戏结束时调用，记录本局获胜的玩家。
   *
   * @param {object} winner - 胜者的 Game 实例
   */
  setWinner(winner) {
    this.state.winner = winner;
  }

  /**
   * ## 获取单局胜者
   *
   * 查询当前单局的胜者。如果本局尚未结束或已重置，返回 null。
   *
   * @returns {object | null} 胜者的 Game 实例，未决出胜者时返回 null
   */
  getWinner() {
    return this.state.winner;
  }

  /**
   * ## 获取指定玩家的分数
   *
   * 查询某位玩家的累计胜场数。
   *
   * @param {string} id - 玩家唯一标识，格式为 `{name}-{index}`，如 "human-0"
   * @returns {number} 玩家的胜场数，未初始化时可能为 undefined
   */
  getScore(id) {
    return this.state.scores[id];
  }

  /**
   * ## 设置指定玩家的分数
   *
   * 直接设置玩家的胜场数。用于认输场景中直接将对手分数设为 victoryScore。
   *
   * @param {string} id - 玩家唯一标识
   * @param {number} score - 要设置的分数值
   * @returns {void}
   */
  setScore(id, score) {
    this.state.scores[id] = score;
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
   * | Player.name | Player.index | 生成的 ID |
   * | ----------- | ------------ | --------- |
   * | human       | 0            | `human-0` |
   * | ai          | 1            | `ai-1`    |
   * | Alice       | 0            | `Alice-0` |
   *
   * @param {object} game - Game 实例
   * @returns {string} 玩家唯一标识字符串
   */
  getPlayerId(game) {
    const { Player } = game;
    return `${Player.name}-${Player.index}`;
  }

  /**
   * ## 更新双方胜场数
   *
   * 在一局对战结束后调用，给胜者增加 1 个胜场， 同时确保败者的胜场数不会变成负数。
   *
   * @param {object} options - 更新选项
   * @param {object} options.winner - 胜者的 Game 实例
   * @param {object} options.loser - 败者的 Game 实例
   */
  updateScores(options) {
    const { winner, loser } = options;
    const { scores } = this.state;

    const winnerId = this.getPlayerId(winner);
    let winnerScore = scores[winnerId];

    const loserId = this.getPlayerId(loser);
    let loserScore = scores[loserId];

    winnerScore += 1;

    if (loserScore <= 0) {
      loserScore = 0;
    }

    scores[winnerId] = winnerScore;
    scores[loserId] = loserScore;
  }

  /**
   * ## 累加待处理垃圾行
   *
   * 当玩家受到攻击时，将攻击产生的垃圾行累加到该玩家的 `pendingGarbage` 中。这些垃圾行不会立即生效，而是等待 消行动画结束后通过
   * `flushGarbage` 实际应用到棋盘。
   *
   * @param {object} game - 受到攻击的玩家 Game 实例
   * @param {number} amount - 要添加的垃圾行数量（正整数）
   */
  addGarbage(game, amount) {
    const { pendingGarbage } = this.state;
    const playerId = this.getPlayerId(game);
    pendingGarbage[playerId] = (pendingGarbage[playerId] || 0) + amount;
  }

  /**
   * ## 用消行攻击抵消待处理垃圾行
   *
   * 当玩家消行时，用产生的攻击力抵消自己累积的待处理垃圾行。 返回实际能够发送给对手的垃圾行数量。
   *
   * @param {object} game - 消行的玩家 Game 实例
   * @param {number} attackLines - 本次消行产生的攻击力（垃圾行数）
   * @returns {number} 抵消后剩余的攻击力，即可实际发送给对手的垃圾行数
   */
  offsetGarbage(game, attackLines) {
    const { pendingGarbage } = this.state;
    const playerId = this.getPlayerId(game);
    const pending = pendingGarbage[playerId] || 0;
    const remaining = Math.max(0, pending - attackLines);
    pendingGarbage[playerId] = remaining;
    return remaining > 0 ? 0 : attackLines - pending;
  }

  /**
   * ## 获取待处理垃圾行数
   *
   * @param {object} game - 要查询的玩家 Game 实例
   * @returns {number} 待处理的垃圾行数量，未初始化时返回 0
   */
  getPendingGarbage(game) {
    const playerId = this.getPlayerId(game);
    return this.state.pendingGarbage[playerId] || 0;
  }

  /**
   * ## 清空待处理垃圾行
   *
   * 将某位玩家的待处理垃圾行数重置为 0。
   *
   * @param {object} game - 要清空垃圾行的玩家 Game 实例
   */
  clearGarbage(game) {
    const playerId = this.getPlayerId(game);
    this.state.pendingGarbage[playerId] = 0;
  }

  /**
   * ## 递增回合编号
   *
   * 每局对战结束后调用，将回合编号 +1。
   */
  increaseRound() {
    this.state.roundId += 1;
  }

  /**
   * ## 获取当前回合编号
   *
   * @returns {number} 当前回合的唯一标识编号
   */
  getRoundId() {
    return this.state.roundId;
  }

  /**
   * ## 重置状态
   *
   * 将所有状态恢复到初始值。内部委托给 `_initialize()` 方法， 确保重置逻辑与初始化逻辑完全一致。
   */
  reset() {
    this._initialize();
  }
}

export default BattleStore;
