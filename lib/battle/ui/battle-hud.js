import Base from '@/lib/core/index.js';

/**
 * # 对战 HUD 控制器
 *
 * 负责管理和更新对战模式下的**抬头显示信息**（HUD - Heads-Up Display）， 主要处理双方玩家的分数显示。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                    |
 * | ---------------- | --------------------------------------- |
 * | **DOM 元素管理** | 在初始化时查找并缓存双方的分数 DOM 元素 |
 * | **分数更新**     | 根据游戏状态更新 DOM 中显示的分数       |
 * | **元素查找**     | 提供统一的元素获取接口                  |
 *
 * ## 设计原则
 *
 * BattleHUD 只负责**对战相关的 UI 更新**，不处理具体的游戏逻辑或状态计算。 分数数据从 BattleStore 实例获取，DOM
 * 操作仅限于更新 textContent。
 *
 * ## 依赖关系
 *
 *     BattleHUD
 *       ├── games[] → 获取 Player 信息（name + index）
 *       ├── store (BattleStore) → 通过 getScore(playerId) 获取分数
 *       └── DOM → 通过 document.querySelector 缓存分数元素
 *
 * ## DOM 结构约定
 *
 * 分数元素的 ID 遵循固定命名规则：
 *
 *     {PlayerName}-{PlayerIndex}-tetris-battle-score
 *
 * 例如：
 *
 * - `human-0-tetris-battle-score`（P1）
 * - `human-1-tetris-battle-score`（P2）
 *
 * ## 典型使用场景
 *
 * ```javascript
 * const hud = new BattleHUD({
 *   games: [game1, game2],
 *   store: battleStore, // BattleStore 实例
 * });
 *
 * // 单局结束时更新双方分数
 * hud.updateScores(winner, loser);
 * ```
 *
 * @augments Base
 * @class BattleHUD
 */
class BattleHUD extends Base {
  /**
   * ## 构造函数
   *
   * 初始化对战 HUD，接收 Game 实例数组和 BattleStore 实例。 构造完成后立即调用 initialize() 缓存 DOM 元素。
   *
   * ### 参数说明
   *
   * - `games`：用于遍历生成 playerId，定位 DOM 元素
   * - `store`：BattleStore 实例，提供 `getScore(playerId)` 方法获取最新分数
   *
   * @example
   *   const hud = new BattleHUD({
   *     games: [
   *       { Player: { name: 'Alice', index: 0 } },
   *       { Player: { name: 'Bob', index: 1 } },
   *     ],
   *     store: battleStore,
   *   });
   *
   * @param {object} options - 配置选项
   * @param {object[]} options.games - Game 实例数组，每个实例包含 Player 信息（name + index）
   * @param {object} options.store - BattleStore 实例，提供 getScore 等方法
   */
  constructor(options) {
    // 调用父类构造函数，将配置注入实例（this.games、this.store 可用）
    super(options);

    /**
     * 立即执行初始化：
     *
     * - 遍历 games 数组
     * - 查找并缓存每个玩家的分数 DOM 元素到 this.elements
     */
    this.initialize();
  }

  /**
   * ## 初始化 DOM 元素缓存
   *
   * 在构造函数中自动调用，执行以下步骤：
   *
   * 1. 初始化空的元素缓存对象 `this.elements`
   * 2. 遍历所有 Game 实例
   * 3. 根据 `{PlayerName}-{PlayerIndex}-tetris-battle-score` 规则生成元素 ID
   * 4. 通过 `document.querySelector` 查找 DOM 元素
   * 5. 将找到的元素（或 null）缓存到 `this.elements` 中
   *
   * ### 为什么缓存 DOM 元素？
   *
   * - **性能优化**：避免每次更新分数时都重新查询 DOM
   * - **容错处理**：如果元素不存在，缓存 null 而不是在运行时报错
   * - **统一访问**：通过 `getEl()` 方法统一获取元素引用
   *
   * @private
   * @returns {void}
   */
  initialize() {
    // 从配置中获取 Game 实例数组（由 Base 构造函数注入）
    const { games } = this;

    /**
     * 初始化元素缓存对象：
     *
     * - Key: 玩家唯一标识（如 "Alice-0"）
     * - Value: DOM 元素引用或 null（元素不存在时）
     */
    this.elements = {};

    // 遍历所有 Game 实例，为每个玩家缓存分数 DOM 元素
    for (const game of games) {
      // 获取玩家的身份信息（name 和 index）
      const { Player } = game;

      /**
       * 生成玩家唯一标识 ID： 格式：{name}-{index} 例如：human-0、ai-1、Alice-0、Bob-1
       *
       * 这个 ID 同时用作：
       *
       * 1. DOM 元素选择器的一部分（拼接 tetris-battle-score 后缀）
       * 2. This.elements 缓存的键
       * 3. BattleStore.getScore(id) 状态查询的键
       */
      const id = `${Player.name}-${Player.index}`;

      /**
       * 根据约定命名规则查找分数 DOM 元素： 完整选择器：#${id}-tetris-battle-score
       * 例如：#human-0-tetris-battle-score
       *
       * 这个元素由 drawInterface 在初始化时生成。
       */
      const $score = document.querySelector(`#${id}-tetris-battle-score`);

      /**
       * 缓存查找结果：
       *
       * - 如果元素存在（DOM 中找到），保存 DOM 引用
       * - 如果元素不存在（未找到或 DOM 未渲染），保存 null
       * - 后续 updateScores 中会做空值检查，null 时静默跳过
       */
      this.elements[id] = $score || null;
    }
  }

  /**
   * ## 获取玩家对应的 DOM 元素
   *
   * 根据玩家唯一标识从缓存中获取分数 DOM 元素引用。
   *
   * @example
   *   const $score = hud.getEl('human-0');
   *   if ($score) {
   *     $score.textContent = '5'; // 更新 P1 分数为 5
   *   }
   *
   * @param {string} id - 玩家唯一标识，格式为 `{name}-{index}`（如 "human-0"）
   * @returns {HTMLElement | null} 对应的 DOM 元素，不存在时返回 null
   */
  getEl(id) {
    // 从缓存对象中获取元素引用
    return this.elements[id];
  }

  /**
   * ## 更新双方分数显示
   *
   * 在单局游戏结束时被调用，更新胜者和败者的分数到对应的 DOM 元素。
   *
   * ### 更新流程
   *
   *     传入 winner, loser
   *       → 提取双方 Player 信息（name + index）
   *         → 生成双方唯一标识 ID（如 "human-0"、"ai-1"）
   *           → 从缓存获取对应 DOM 元素（getEl）
   *             → 从 BattleStore 获取最新分数（store.getScore）
   *               → 更新 DOM textContent
   *
   * ### 为什么需要 winner 和 loser 两个参数？
   *
   * - 胜者和败者的分数可能都需要更新（败者之前可能也有胜场）
   * - 确保双方显示的分数是最新状态
   * - 参数是 Game 实例，可以直接获取 Player 信息
   *
   * ### 为什么从 store 获取分数而不是直接传分数值？
   *
   * - BattleStore 是分数的唯一数据源（Single Source of Truth）
   * - 避免调用方传错分数导致 UI 与实际状态不一致
   * - 解耦：HUD 不需要知道分数如何计算，只需要从 store 读取
   *
   * @example
   *   // 单局结束：human 获胜，ai 落败
   *   hud.updateScores(humanGame, aiGame);
   *   // → DOM 中 human-0-tetris-battle-score 显示 human 的最新胜场
   *   // → DOM 中 ai-1-tetris-battle-score 显示 ai 的最新胜场
   *
   * @param {object} winner - 胜者 Game 实例
   * @param {object} loser - 败者 Game 实例
   * @returns {void}
   */
  updateScores(winner, loser) {
    // 获取 BattleStore 实例（由 Base 构造函数注入）
    const { store } = this;

    // ========== 处理胜者分数 ==========

    // 提取胜者的玩家信息（name + index）
    const winnerPlayer = winner.Player;

    // 生成胜者唯一标识（如 "human-0"）
    const winnerId = `${winnerPlayer.name}-${winnerPlayer.index}`;

    // 从缓存中获取胜者的分数 DOM 元素（可能为 null）
    const $winner = this.getEl(winnerId);

    // 从 BattleStore 获取胜者的最新胜场数
    const winnerScore = store.getScore(winnerId);

    // ========== 处理败者分数 ==========

    // 提取败者的玩家信息（name + index）
    const loserPlayer = loser.Player;

    // 生成败者唯一标识（如 "ai-1"）
    const loserId = `${loserPlayer.name}-${loserPlayer.index}`;

    // 从缓存中获取败者的分数 DOM 元素（可能为 null）
    const $loser = this.getEl(loserId);

    // 从 BattleStore 获取败者的最新胜场数
    const loserScore = store.getScore(loserId);

    // ========== 更新 DOM ==========

    /**
     * 更新胜者分数显示：
     *
     * - 检查元素是否存在（initialize 时可能未找到对应 DOM 元素）
     * - 如果存在，将 textContent 更新为最新分数
     * - 如果不存在（null），静默跳过，避免因 DOM 缺失导致崩溃
     */
    if ($winner) {
      $winner.textContent = winnerScore;
    }

    /**
     * 更新败者分数显示：
     *
     * - 同样做空值检查，保证健壮性
     * - 败者虽然输了这一局，但可能之前有胜场，分数仍需更新
     */
    if ($loser) {
      $loser.textContent = loserScore;
    }
  }
}

export default BattleHUD;
