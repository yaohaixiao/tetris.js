import Base from '@/lib/core';
import VersusState from '@/lib/battle/versus-state.js';
import BattleHUD from '@/lib/battle/battle-hud.js';
import BattleRouter from '@/lib/events/router/battle-router.js';
import { calculateGarbage, applyGarbage } from '@/lib/battle/garbage-system.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 对战控制器
 *
 * 对战模式的核心控制器，负责协调对战的所有子系统， 包括状态管理、HUD 更新、事件路由和垃圾行系统。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                                 |
 * | ---------------- | ---------------------------------------------------- |
 * | **子系统协调**   | 创建并管理 VersusState、BattleHUD、BattleRouter 实例 |
 * | **生命周期管理** | 控制对战的开始（start）和结束（stop）                |
 * | **胜负判定**     | 处理游戏结束事件，更新胜者和分数                     |
 * | **攻击处理**     | 计算消行攻击力，抵消待处理垃圾行，转发攻击           |
 * | **垃圾行生成**   | 将待处理垃圾行实际应用到对手棋盘                     |
 * | **事件管理**     | 通过 BattleRouter 订阅/取消订阅对战事件              |
 *
 * ## 架构设计
 *
 *     BattleController（对战控制器）
 *       ├── VersusState（状态管理）
 *       │   ├── running / winner / scores / pendingGarbage
 *       │   └── 垃圾行累加、抵消、查询
 *       ├── BattleHUD（界面更新）
 *       │   └── DOM 分数元素更新
 *       ├── BattleRouter（事件路由）
 *       │   └── 5 个对战事件的订阅和分发
 *       └── Garbage System（垃圾行系统）
 *           ├── calculateGarbage（攻击力计算）
 *           └── applyGarbage（垃圾行生成）
 *
 * ## 攻击处理流程
 *
 *     玩家A消行
 *       → 触发 PROCESS_ATTACK 事件
 *         → BattleRouter 路由到 processAttack(from, lines)
 *           → calculateGarbage(lines) 计算攻击力
 *             → offsetGarbage(from, attack) 抵消自己的待处理垃圾
 *               ├─ 有剩余攻击力 → addGarbage(to, remaining) 发送给对手
 *               └─ 无剩余 → 结束
 *       → 消行动画播放
 *       → 触发 FLUSH_GARBAGE 事件
 *         → BattleRouter 路由到 flushGarbage(game)
 *           → getPendingGarbage(game) 获取待处理垃圾行
 *             → applyGarbage(board, amount, difficulty) 生成垃圾行棋盘
 *               → setState({ board: next }) 更新对手棋盘
 *                 → clearGarbage(game) 清空待处理计数
 *
 * ## 游戏结束处理流程
 *
 *     玩家B游戏结束（方块堆满）
 *       → 触发 UPDATE_WINNER 事件
 *         → BattleRouter 路由到 update(loser)
 *           → getOpponent(loser) 找到对手（玩家A）
 *             → stop() 停止对战
 *               → setWinner(winner) 设置胜者
 *                 → updateScores({ winner, loser }) 更新胜场数
 *                   → hud.updateScores(winner, loser) 更新 DOM 显示
 *                     → loser.emit(RESTART) 通知败者重新开始
 *                       → start() 重新开始对战
 *
 * ## 设计原则
 *
 * 1. **单一职责**：每个子系统只负责自己的领域
 * 2. **依赖注入**：通过构造函数传递依赖关系
 * 3. **事件驱动**：通过 BattleRouter 解耦事件和处理逻辑
 * 4. **防御性编程**：关键操作前检查状态有效性
 *
 * ## 典型使用场景
 *
 * ```javascript
 * const battle = new BattleController({
 *   games: [game1, game2],
 * });
 *
 * // 对战自动开始
 * // 玩家消行时会自动触发攻击处理
 * // 游戏结束时会自动更新胜负和分数
 *
 * // 销毁时取消事件订阅
 * battle.unsubscribe();
 * ```
 *
 * @augments Base
 * @class BattleController
 */
class BattleController extends Base {
  /**
   * ## 构造函数
   *
   * 初始化对战控制器及其所有子系统，完成后自动开始对战。
   *
   * ### 初始化步骤
   *
   * 1. 调用父类构造函数传递配置
   * 2. 调用 `initialize()` 创建所有子系统
   *
   * @example
   *   const battle = new BattleController({
   *     games: [game1, game2],
   *   });
   *
   * @param {object} options - 配置选项
   * @param {object[]} options.games - Game 实例数组（长度为 2）
   */
  constructor(options) {
    // 调用父类构造函数
    super(options);

    // 立即初始化所有子系统并开始对战
    this.initialize();
  }

  /**
   * ## 初始化对战系统
   *
   * 创建对战所需的三个核心子系统，按依赖顺序初始化：
   *
   * 1. **VersusState**：状态管理（无依赖）
   * 2. **BattleHUD**：界面更新（依赖 state）
   * 3. **BattleRouter**：事件路由（依赖 battle 实例自身）
   *
   * 完成后自动调用 `start()` 开始对战。
   *
   * ### 为什么先创建 state？
   *
   * BattleHUD 的构造函数需要 state 参数来查询分数， 所以必须先创建 state 再创建 hud。
   *
   * ### 为什么传入 `this` 给 BattleRouter？
   *
   * BattleRouter 需要调用 BattleController 的方法（如 processAttack）， 通过 `{ battle: this
   * }` 将自身引用注入到路由器中。
   *
   * @returns {void}
   */
  initialize() {
    // 从配置中获取 Game 实例数组
    const { games } = this;

    /**
     * ======== 步骤 1：创建状态管理器 ========
     *
     * VersusState 负责管理：
     *
     * - Running：对战是否进行中
     * - Winner：胜者 Game 实例
     * - Scores：双方胜场数
     * - PendingGarbage：待处理垃圾行
     */
    const state = new VersusState({ games });

    /**
     * ======== 步骤 2：创建 HUD 控制器 ========
     *
     * BattleHUD 负责更新 DOM 中的分数显示。 需要 games（获取 Player 信息）和 state（查询分数）。
     */
    this.state = state;
    this.hud = new BattleHUD({ games, state });

    /**
     * ======== 步骤 3：创建事件路由器 ========
     *
     * BattleRouter 负责订阅对战事件并路由到对应方法。 需要 battle 实例来调用 processAttack 等方法。
     *
     * 注意：此时 this 已完整初始化（state、hud 已就绪）， 所以可以安全地将自身引用传递给路由器。
     */
    this.router = new BattleRouter({ battle: this });

    /**
     * ======== 步骤 4：开始对战 ========
     *
     * 所有子系统就绪后，自动开始对战。
     */
    this.start();
  }

  /**
   * ## 开始对战
   *
   * 将对战状态设置为运行中。如果已经在运行中，则忽略此调用。
   *
   * ### 幂等性保证
   *
   * 通过检查 `state.isRunning()` 确保多次调用不会产生副作用。 这是一个**幂等操作**。
   *
   * @returns {void}
   */
  start() {
    // 如果已经在运行中，直接返回，不做任何操作
    if (this.state.isRunning()) {
      return;
    }

    // 设置对战状态为运行中
    this.state.setRunning(true);
  }

  /**
   * ## 停止对战
   *
   * 将对战状态设置为已停止。如果已经停止，则忽略此调用。
   *
   * ### 使用场景
   *
   * - 游戏结束时（有玩家失败）
   * - 手动停止对战
   *
   * ### 幂等性保证
   *
   * 与 start() 对称，通过检查确保不会重复停止。
   *
   * @returns {void}
   */
  stop() {
    // 如果已经停止，直接返回
    if (!this.state.isRunning()) {
      return;
    }

    // 设置对战状态为停止
    this.state.setRunning(false);
  }

  /**
   * ## 更新对战结果
   *
   * 当有玩家游戏结束时调用，执行完整的游戏结束处理流程：
   *
   * 1. 找到对手（胜者）
   * 2. 停止对战
   * 3. 设置胜者
   * 4. 更新双方胜场数
   * 5. 更新 HUD 分数显示
   * 6. 通知败者重新开始
   * 7. 重新开始对战
   *
   * ### 为什么自动重新开始？
   *
   * 对战模式通常是**多局制**（如五局三胜），一局结束后 自动开始下一局，直到达到总局数。
   *
   * ### 流程顺序说明
   *
   * 先 `stop()` 再 `start()` 确保：
   *
   * - 在计分期间游戏逻辑暂停
   * - 计分完成后重新开始新一局
   *
   * @example
   *   // 当 Bob 游戏结束时
   *   battle.update(bobGame);
   *   // → 自动判定 Alice 获胜
   *   // → 更新分数显示
   *   // → 通知 Bob 重新开始
   *   // → 开始新一局
   *
   * @param {object} loser - 失败的玩家 Game 实例
   * @param {string | number} loser.id - 失败的玩家唯一标识
   * @param {Function} loser.emit - 事件触发方法
   * @returns {void}
   */
  update(loser) {
    // 找到失败者的对手（即胜者）
    const winner = this.getOpponent(loser);

    // ========== 步骤 1：停止对战 ==========
    this.stop();

    // ========== 步骤 2：设置胜者 ==========
    this.state.setWinner(winner);

    // ========== 步骤 3：更新胜场记录 ==========
    this.state.updateScores({ winner, loser });

    // ========== 步骤 4：更新 HUD 分数显示 ==========
    this.hud.updateScores(winner, loser);

    /* ========== 步骤 5：通知败者重新开始 ========== */
    // 获取游戏事件常量（使用败者的 id 初始化）
    const events = GameEvents(loser.id);

    /**
     * 触发 RESTART 事件通知败者：
     *
     * 败者的 Game 实例收到事件后会重新初始化棋盘， 准备开始新一局游戏。
     */
    loser.emit(events.RESTART);

    // ========== 步骤 6：重新开始对战 ==========
    this.start();
  }

  /**
   * ## 获取对手
   *
   * 在 games 数组中查找与指定玩家不同的另一个玩家。
   *
   * ### 查找逻辑
   *
   * 使用 `Array.find()` 在 games 数组中查找第一个 `id` 不等于 `yourself.id` 的 Game 实例。
   *
   * ### 适用场景
   *
   * - 游戏结束时找胜者
   * - 攻击时找目标对手
   * - 暂停/恢复时找需要同步的对象
   *
   * @example
   *   const opponent = battle.getOpponent(game1);
   *   console.log(opponent.Player.name); // 对手的名称
   *
   * @param {object} yourself - 当前玩家 Game 实例
   * @param {string | number} yourself.id - 当前玩家唯一标识
   * @returns {object} 对手的 Game 实例
   */
  getOpponent(yourself) {
    // 从配置中获取所有 Game 实例
    const { games } = this;

    /**
     * 查找对手： 返回第一个 id 不等于当前玩家 id 的 Game 实例。 在标准的 1v1 对战中，games 数组长度为 2，
     * 所以返回的就是唯一的对手。
     */
    return games.find((game) => game.id !== yourself.id);
  }

  /**
   * ## 处理消行攻击
   *
   * 在玩家消行动画**开始前**被调用，处理攻击的抵消和转发。 这是对战系统的核心攻击逻辑。
   *
   * ### 处理步骤
   *
   *     1. 找到对手
   *     2. 根据消行数计算攻击力
   *     3. 如果攻击力 ≤ 0，直接返回（无攻击）
   *     4. 用攻击力抵消自己的待处理垃圾行
   *     5. 如果有剩余攻击力，发送给对手
   *     6. 返回实际发出的垃圾行数
   *
   * ### 为什么先抵消自己的垃圾行？
   *
   * 这是对战系统的**核心策略机制**：
   *
   * - 当玩家受到攻击时（有 pendingGarbage），消行可以用于**防御**
   * - 消行产生的攻击力首先抵消自己即将受到的垃圾行
   * - 只有抵消后还有剩余，才会攻击对手
   * - 这鼓励玩家在受攻击时积极消行来自保
   *
   * ### 攻击计算说明
   *
   * 使用 `calculateGarbage` 函数根据消行数查询 `GARBAGE_MAP`：
   *
   * - 1 行 → 0 攻击力（单消不给攻击）
   * - 2 行 → 1 攻击力
   * - 3 行 → 2 攻击力
   * - 4 行 → 3 攻击力（Tetris）
   *
   * @example
   *   // 玩家完成 Tetris（4行），没有待处理垃圾
   *   const sent = battle.processAttack(playerGame, clearedLines);
   *   // sent = 3（给对手发送 3 行垃圾）
   *
   * @example
   *   // 玩家消 2 行，但有 5 行待处理垃圾
   *   const sent = battle.processAttack(playerGame, clearedLines);
   *   // sent = 0（攻击力全部用于抵消自己的垃圾行）
   *   // pendingGarbage 从 5 减少到 4
   *
   * @param {object} from - 发起攻击的玩家 Game 实例（消行的一方）
   * @param {Array} lines - 消除的行数组，用于计算攻击力
   * @returns {number} 实际发送给对手的垃圾行数，0 表示无攻击
   */
  processAttack(from, lines) {
    // 找到攻击目标（对手）
    const to = this.getOpponent(from);

    /** 计算攻击力： 根据消除的行数 lines.length 查询 GARBAGE_MAP */
    const attack = calculateGarbage(lines.length);

    /** 如果攻击力 ≤ 0（如单消），不产生任何攻击。 直接返回 0，无需后续处理。 */
    if (attack <= 0) {
      return 0;
    }

    /**
     * ======== 步骤 1：抵消自己的待处理垃圾行 ========
     *
     * OffsetGarbage 会：
     *
     * 1. 获取 from 玩家的 pendingGarbage
     * 2. 用 attack 抵消 pending
     * 3. 返回抵消后剩余的攻击力
     *
     * 例如：
     *
     * - Pending=5, attack=3 → remaining=0（攻击力不足以完全抵消）
     * - Pending=2, attack=5 → remaining=3（抵消 2 行后剩余 3 行攻击力）
     */
    const remaining = this.state.offsetGarbage(from, attack);

    /**
     * ======== 步骤 2：剩余攻击力发送给对手 ========
     *
     * 如果抵消后还有剩余攻击力（remaining > 0）， 将其添加为对手的待处理垃圾行。
     *
     * 对手的垃圾行会在消行动画结束后的 FLUSH_GARBAGE 事件中 被实际应用到棋盘上。
     */
    if (remaining > 0) {
      this.state.addGarbage(to, remaining);
    }

    // 返回实际发出的垃圾行数（用于调试或日志）
    return remaining;
  }

  /**
   * ## 刷新垃圾行到棋盘
   *
   * 在消行动画 **dispose 的最后阶段**被调用， 将累积的待处理垃圾行实际应用到指定玩家的棋盘上。
   *
   * ### 处理步骤
   *
   *     1. 获取该玩家的待处理垃圾行数
   *     2. 如果 amount ≤ 0，直接返回（无垃圾行）
   *     3. 获取当前棋盘状态（board + difficulty）
   *     4. 调用 applyGarbage 生成带垃圾行的新棋盘
   *     5. 更新 Store 中的棋盘状态
   *     6. 清空该玩家的待处理垃圾行计数
   *
   * ### 为什么分两步处理垃圾行？
   *
   * 1. **PROCESS_ATTACK**（消行开始时）：
   *
   *    - 计算攻击力和抵消
   *    - 将剩余攻击力加入对手的 pendingGarbage
   *    - 此时垃圾行只存在于状态中，棋盘未改变
   * 2. **FLUSH_GARBAGE**（消行动画结束时）：
   *
   *    - 将 pendingGarbage 实际写入棋盘
   *    - 此时消行动画已播放完毕，视觉效果流畅
   *
   * 这种**延迟应用**策略确保了：
   *
   * - 攻击计算和抵消是即时的（游戏逻辑层面）
   * - 垃圾行的出现配合动画时机（视觉层面）
   *
   * @example
   *   // 对手的消行动画结束后，将垃圾行应用到玩家棋盘
   *   battle.flushGarbage(playerGame);
   *   // 棋盘底部出现垃圾行，pendingGarbage 清零
   *
   * @param {object} game - 要应用垃圾行的玩家 Game 实例
   * @param {object} game.Store - 游戏状态存储
   * @param {Function} game.Store.getState - 获取当前状态
   * @param {Function} game.Store.setState - 更新状态
   * @returns {void}
   */
  flushGarbage(game) {
    // 获取该玩家的待处理垃圾行数量
    const amount = this.state.getPendingGarbage(game);

    /** 边界检查： 如果没有待处理的垃圾行（amount ≤ 0），直接返回。 这避免了不必要的棋盘操作。 */
    if (amount <= 0) {
      return;
    }

    // 解构出 Game 实例的状态存储
    const { Store } = game;

    /**
     * 获取当前棋盘状态：
     *
     * - Board：当前的棋盘二维数组
     * - Difficulty：当前游戏难度（影响垃圾行的空洞数量）
     */
    const { board, difficulty } = Store.getState();

    /**
     * 应用垃圾行： 调用 applyGarbage 函数生成新的棋盘数组。
     *
     * ApplyGarbage 会：
     *
     * 1. 从棋盘顶部移除 amount 行
     * 2. 在底部添加 amount 行带空洞的垃圾行
     * 3. 返回新的棋盘数组（不修改原数组）
     */
    const next = applyGarbage(board, amount, difficulty);

    /** 更新棋盘状态： 将新的棋盘数组写入 Store，触发 UI 重新渲染。 */
    Store.setState({ board: next });

    /** 清空待处理计数： 垃圾行已经应用到棋盘，重置 pendingGarbage 为 0。 */
    this.state.clearGarbage(game);
  }

  /**
   * ## 订阅对战事件
   *
   * 通过 BattleRouter 注册所有对战相关的事件处理器。
   *
   * ### 订阅的事件
   *
   * - PROCESS_ATTACK：处理消行攻击
   * - FLUSH_GARBAGE：处理垃圾行刷新
   * - UPDATE_WINNER：处理游戏结束
   * - SYNC_PAUSE：处理暂停同步
   * - SYNC_RESUME：处理恢复同步
   *
   * @returns {void}
   */
  subscribe() {
    this.router.subscribe();
  }

  /**
   * ## 取消订阅对战事件
   *
   * 通过 BattleRouter 移除所有对战事件处理器。 在销毁对战控制器时必须调用，防止内存泄漏。
   *
   * @returns {void}
   */
  unsubscribe() {
    this.router.unsubscribe();
  }
}

export default BattleController;
