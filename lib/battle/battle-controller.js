import Base from '@/lib/core';
import BattleStore from '@/lib/battle/battle-store.js';
import BattleHUD from '@/lib/battle/battle-hud.js';
import BattleUI from '@/lib/battle/battle-ui.js';
import BattleRouter from '@/lib/events/router/battle-router.js';
import { calculateGarbage, applyGarbage } from '@/lib/battle/garbage-system.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 对战控制器
 *
 * 对战模式的核心控制器，负责协调对战的所有子系统， 包括状态管理、HUD 更新、UI 展示、事件路由和垃圾行系统。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                                           |
 * | ---------------- | -------------------------------------------------------------- |
 * | **子系统协调**   | 创建并管理 BattleStore、BattleHUD、BattleUI、BattleRouter 实例 |
 * | **生命周期管理** | 控制对战的开始（start）、暂停（stop）和重置（reset）           |
 * | **单局胜负判定** | 处理单局游戏结束事件，更新胜者和分数                           |
 * | **整场赛制判定** | 检查是否达到 victoryScore，触发整场结束或下一局                |
 * | **攻击处理**     | 计算消行攻击力，抵消待处理垃圾行，转发攻击                     |
 * | **垃圾行生成**   | 将待处理垃圾行实际应用到对手棋盘                               |
 * | **事件管理**     | 通过 BattleRouter 订阅/取消订阅对战事件                        |
 *
 * ## 赛制说明
 *
 * ### 单局 vs 整场
 *
 * - **单局（Round）**：一次游戏结束（某玩家方块堆满），胜者 +1 分
 * - **整场（Match）**：先达到 `victoryScore` 的玩家获胜，整场对战结束
 *
 * ### 对战流程
 *
 *     ┌─────────────────────────────────────────────┐
 *     │              整场对战开始                     │
 *     │  store.setRunning(true)                      │
 *     └─────────────────┬───────────────────────────┘
 *                       │
 *                       ▼
 *     ┌─────────────────────────────────────────────┐
 *     │              单局对战循环                     │
 *     │  ┌─────────────────────────────────────┐    │
 *     │  │  1. 双方游戏进行中                    │    │
 *     │  │  2. 某玩家方块堆满 → update(loser)    │    │
 *     │  │     - 胜者 +1 分                      │    │
 *     │  │     - 检查 score >= victoryScore？     │    │
 *     │  │       ├─ 是 → over(winner, loser)     │    │
 *     │  │       └─ 否 → restart(loser)          │    │
 *     │  └─────────────────────────────────────┘    │
 *     └─────────────────┬───────────────────────────┘
 *                       │
 *                       ▼
 *     ┌─────────────────────────────────────────────┐
 *     │         有人达到 victoryScore → 整场结束      │
 *     │  over(winner, loser)                         │
 *     │    → 双方切到 battle-over 模式               │
 *     │    → BattleUI.show(winnerName)               │
 *     │    → 显示对战结果覆盖层                       │
 *     └─────────────────────────────────────────────┘
 *
 * ## 架构设计
 *
 *     BattleController（对战控制器）
 *       ├── BattleStore（状态管理）
 *       │   ├── running / winner / scores / pendingGarbage
 *       │   └── 垃圾行累加、抵消、查询
 *       ├── BattleHUD（实时分数更新）
 *       │   └── DOM 分数元素更新
 *       ├── BattleUI（对战结果展示）
 *       │   └── 覆盖层显示胜者
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
 *                   → hud.updateScores(winner, loser) 更新 HUD 分数显示
 *                     → 检查 winnerScore >= victoryScore？
 *                       ├─ 是 → over(winner, loser)
 *                       │        → 双方切到 battle-over 模式
 *                       │        → BattleUI.show(winnerName)
 *                       └─ 否 → restart(loser)
 *                                → loser.emit(RESTART) 通知败者
 *                                → start() 重新开始下一局
 *
 * ## 重置流程
 *
 *     用户按 Enter 重赛
 *       → reset(from)
 *         → store.reset() 清空所有分数和状态
 *         → hud.updateScores(from, opponent) 重置 HUD 显示
 *         → ui.hide() 隐藏结果覆盖层
 *         → 双方 emit(RESET) 回到 main-menu
 *         → 可以重新选择难度开始新对战
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
 *   victoryScore: 20,
 *   elements: { overlay: 'battle-overlay', winner: 'battle-winner' },
 * });
 *
 * // 对战自动开始
 * // 玩家消行时会自动触发攻击处理
 * // 单局结束 → 自动判定胜负 → 更新分数
 * // 达到 victoryScore → 展示结果界面
 * // 按 Enter → 重置对战
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
   * 1. 调用父类构造函数传递配置（games、victoryScore、elements）
   * 2. 调用 `initialize()` 创建所有子系统并自动开始
   *
   * @example
   *   const battle = new BattleController({
   *     games: [game1, game2],
   *     victoryScore: 20,
   *     elements: { overlay: 'battle-overlay', winner: 'battle-winner' },
   *   });
   *
   * @param {object} options - 配置选项
   * @param {object[]} options.games - Game 实例数组（长度为 2）
   * @param {number} [options.victoryScore=20] - 目标分数，先达到者赢得整场对战。默认值为 `20`.
   *   Default is `20`
   * @param {object} options.elements - BattleUI 所需的 DOM 元素 ID 配置
   * @param {string} options.elements.overlay - 结果覆盖层元素 ID
   * @param {string} options.elements.winner - 胜者名称显示元素 ID
   */
  constructor(options) {
    // 调用父类构造函数，将配置注入实例（this.games、this.victoryScore、this.elements 可用）
    super(options);

    // 立即初始化所有子系统并开始对战
    this.initialize();
  }

  /**
   * ## 初始化对战系统
   *
   * 创建对战所需的四个核心子系统，按依赖顺序初始化：
   *
   * 1. **BattleStore**：状态管理（无依赖，最先创建）
   * 2. **BattleHUD**：实时分数更新（依赖 store）
   * 3. **BattleRouter**：事件路由（依赖 battle 实例自身）
   * 4. **BattleUI**：结果展示界面（依赖 elements 配置）
   *
   * 完成后自动调用 `start()` 开始对战。
   *
   * ### 为什么先创建 store？
   *
   * BattleHUD 的构造函数需要 store 参数来查询分数， 所以必须先创建 store 再创建 hud。
   *
   * ### 为什么传入 `this` 给 BattleRouter？
   *
   * BattleRouter 需要调用 BattleController 的方法（如 processAttack）， 通过 `{ battle: this
   * }` 将自身引用注入到路由器中。 此时 this 已完整初始化（store、hud 已就绪），可以安全传递。
   *
   * @returns {void}
   */
  initialize() {
    // 从配置中解构 Game 实例数组和 DOM 元素配置（由 Base 构造函数注入）
    const { games, elements } = this;

    /**
     * ======== 步骤 1：创建状态管理器 ========
     *
     * BattleStore 负责管理对战的所有状态数据：
     *
     * - Running：对战是否进行中
     * - Winner：当前单局胜者
     * - Scores：双方胜场数
     * - PendingGarbage：待处理垃圾行
     *
     * 通过 structuredClone(BattleState) 深拷贝初始状态模板。
     */
    const store = new BattleStore({ games });

    /**
     * ======== 步骤 2：创建 HUD 控制器 ========
     *
     * BattleHUD 负责实时更新 DOM 中的分数显示。 需要 games（获取 Player 信息生成 playerId）和 store（通过
     * getScore 查询分数）。
     */
    this.store = store;
    this.hud = new BattleHUD({ games, store });

    /**
     * ======== 步骤 3：创建事件路由器 ========
     *
     * BattleRouter 负责订阅对战事件（PROCESS_ATTACK、FLUSH_GARBAGE 等） 并路由到
     * BattleController 的对应方法。
     *
     * 注意：此时 this 已完整初始化（store、hud 已就绪）， 可以安全地将自身引用传递给路由器。
     */
    this.router = new BattleRouter({ battle: this });

    /**
     * ======== 步骤 4：创建结果展示界面 ========
     *
     * BattleUI 负责整场对战结束后的结果展示。 需要 elements 配置来定位 DOM 元素（覆盖层 + 胜者名称显示）。
     */
    this.ui = new BattleUI({ elements });

    /**
     * ======== 步骤 5：开始对战 ========
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
   * 通过检查 `store.isRunning()` 确保多次调用不会产生副作用。 这是一个**幂等操作**——多次调用与一次调用效果相同。
   *
   * @returns {void}
   */
  start() {
    // 获取 BattleStore 实例
    const { store } = this;

    // 如果已经在运行中，直接返回，不做任何操作
    if (store.isRunning()) {
      return;
    }

    // 设置对战状态为运行中
    store.setRunning(true);
  }

  /**
   * ## 停止对战
   *
   * 将对战状态设置为已停止。如果已经停止，则忽略此调用。
   *
   * ### 使用场景
   *
   * - 单局游戏结束时（有玩家失败）
   * - 整场对战结束时
   * - 手动停止对战
   *
   * ### 幂等性保证
   *
   * 与 start() 对称，通过检查确保不会重复停止。
   *
   * @returns {void}
   */
  stop() {
    // 获取 BattleStore 实例
    const { store } = this;

    // 如果已经停止，直接返回
    if (!store.isRunning()) {
      return;
    }

    // 设置对战状态为停止
    store.setRunning(false);
  }

  /**
   * ## 更新对战结果（单局结束）
   *
   * 当有玩家游戏结束时调用，执行完整的单局结束处理流程：
   *
   * 1. 找到对手（胜者）
   * 2. 停止对战
   * 3. 设置单局胜者
   * 4. 更新双方胜场数
   * 5. 更新 HUD 实时分数显示
   * 6. 检查赛制判定：胜者分数是否达到 victoryScore
   *
   *    - 达到 → `over(winner, loser)` 整场结束
   *    - 未达到 → `restart(loser)` 开始下一局
   *
   * ### 为什么先 stop 再处理？
   *
   * - 在计分期间暂停游戏逻辑
   * - 防止计分过程中新的输入干扰
   *
   * @example
   *   // Bob 游戏结束（方块堆满）
   *   battle.update(bobGame);
   *   // → Alice 得分 +1
   *   // → 检查 Alice 分数 >= 20？
   *   //   → 是：显示结果界面
   *   //   → 否：通知 Bob 重新开始下一局
   *
   * @param {object} loser - 失败的玩家 Game 实例
   * @param {string | number} loser.id - 失败的玩家唯一标识
   * @param {object} loser.Player - 失败的玩家信息
   * @param {Function} loser.emit - 事件触发方法
   * @returns {void}
   */
  update(loser) {
    // 从配置中获取目标分数和 BattleStore 实例
    const { victoryScore, store } = this;

    // 找到失败者的对手（即胜者）
    const winner = this.getOpponent(loser);

    // ========== 步骤 1：停止对战 ==========
    this.stop();

    // ========== 步骤 2：设置单局胜者 ==========
    store.setWinner(winner);

    // ========== 步骤 3：更新胜场记录（胜者 +1）==========
    store.updateScores({ winner, loser });

    // ========== 步骤 4：更新 HUD 实时分数显示 ==========
    this.hud.updateScores(winner, loser);

    /* ========== 步骤 5：赛制判定 ========== */
    // 获取胜者唯一标识和当前分数
    const winnerId = store.getPlayerId(winner);
    const winnerScore = store.getScore(winnerId);

    /**
     * 赛制判定：
     *
     * - 胜者分数 >= victoryScore → 整场对战结束，展示结果
     * - 胜者分数 < victoryScore → 继续下一局
     */
    if (winnerScore >= victoryScore) {
      // 整场对战结束：展示结果
      this.over(winner, loser);
    } else {
      // 赢得一小局，开始下一局对战
      this.restart(loser);
    }
  }

  /**
   * ## 整场对战结束
   *
   * 当有人达到 victoryScore 时调用。
   *
   * ### 执行流程
   *
   * 1. 通知双方切换到 `battle-over` 模式（停止游戏逻辑）
   * 2. 通过 BattleUI 显示胜者名称
   *
   * ### 覆盖层显示
   *
   * BattleUI 会移除覆盖层的 `tetris-hidden` 类，展示胜者名称。 用户按 Enter 后触发 `reset()` 重新开始。
   *
   * @param {object} winner - 整场对战的胜者 Game 实例
   * @param {object} loser - 整场对战的败者 Game 实例
   * @returns {void}
   */
  over(winner, loser) {
    // 获取胜者和败者的事件常量（用于命名空间隔离）
    const WE = GameEvents(winner.id);
    const LE = GameEvents(loser.id);

    // 通知双方切换到 battle-over 模式（停止游戏逻辑，显示结果界面）
    const payload = { mode: 'battle-over' };
    winner.emit(WE.UPDATE_MODE, payload);
    loser.emit(LE.UPDATE_MODE, payload);

    /**
     * 显示对战结果覆盖层：
     *
     * - 提取胜者名称并转为大写显示
     * - 如果名称为空或不存在，默认显示 "HUMAN"
     * - BattleUI.show() 会移除 tetris-hidden 类使覆盖层可见
     */
    this.ui.show(winner.Player?.name?.toUpperCase() || 'HUMAN');
  }

  /**
   * ## 重新开始一局对战
   *
   * 当前单局结束但整场未结束时调用。
   *
   * ### 执行流程
   *
   * 1. 通知败者重新初始化棋盘（RESTART 事件）
   * 2. 重新开始对战（start）
   *
   * ### 为什么只通知败者？
   *
   * 胜者的游戏状态没有变化，不需要重置。 败者需要重新初始化棋盘准备下一局。
   *
   * @param {object} loser - 本局失败的玩家 Game 实例
   * @param {string} loser.id - 失败者的唯一标识
   * @param {Function} loser.emit - 事件触发方法
   * @returns {void}
   */
  restart(loser) {
    // 获取败者的事件常量
    const events = GameEvents(loser.id);

    /** 触发 RESTART 事件通知败者： 败者的 Game 实例收到事件后会重新初始化棋盘， 准备开始新一局游戏。 */
    loser.emit(events.RESTART);

    // 重新开始对战
    this.start();
  }

  /**
   * ## 重置整场对战
   *
   * 清空所有分数和状态，重新开始一场全新的对战。
   *
   * ### 触发场景
   *
   * - 用户在结果覆盖层按 Enter 键
   * - 外部调用强制重置
   *
   * ### 执行流程
   *
   * 1. 找到对手
   * 2. 重置状态管理器（清空所有分数和垃圾行）
   * 3. 重置 HUD 分数显示为 0
   * 4. 隐藏结果覆盖层
   * 5. 通知双方重置到 main-menu 模式
   *
   * @param {object} from - 发起重置的玩家 Game 实例
   * @param {string} from.id - 发起者的唯一标识
   * @param {Function} from.emit - 事件触发方法
   * @returns {void}
   */
  reset(from) {
    // 找到对手
    const opponent = this.getOpponent(from);

    /**
     * ======== 步骤 1：重置状态管理器 ======== 调用 BattleStore.reset() → _initialize() →
     * structuredClone(BattleState) + 重新初始化所有玩家分数
     */
    this.store.reset();

    /** ======== 步骤 2：重置 HUD 显示 ======== 双方分数都归零，DOM 更新为 0 */
    this.hud.updateScores(from, opponent);

    // ========== 步骤 3：隐藏结果覆盖层 ==========
    this.ui.hide();

    // ========== 步骤 4：通知双方重置到 main-menu ==========
    const FE = GameEvents(from.id);
    const OE = GameEvents(opponent.id);

    // 双方都触发 RESET 事件，回到 main-menu 模式
    from.emit(FE.RESET);
    opponent.emit(OE.RESET);
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
   * 在标准的 1v1 对战中，games 数组长度为 2， 返回的就是唯一的对手。
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
    // 从配置中获取所有 Game 实例（由 Base 构造函数注入）
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
   * 1. 找到对手
   * 2. 根据消行数计算攻击力（calculateGarbage）
   * 3. 如果攻击力 ≤ 0，直接返回（无攻击）
   * 4. 用攻击力抵消自己的待处理垃圾行（store.offsetGarbage）
   * 5. 如果有剩余攻击力，发送给对手（store.addGarbage）
   * 6. 返回实际发出的垃圾行数
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
   * @param {Array} lines - 消除的行数组，使用 `lines.length` 计算攻击力
   * @returns {number} 实际发送给对手的垃圾行数，0 表示无攻击
   */
  processAttack(from, lines) {
    // 找到攻击目标（对手）
    const to = this.getOpponent(from);

    /** 计算攻击力： 根据消除的行数 lines.length 查询 GARBAGE_MAP 映射表 */
    const attack = calculateGarbage(lines.length);

    /** 边界检查： 如果攻击力 ≤ 0（如单消），不产生任何攻击。 直接返回 0，无需后续处理。 */
    if (attack <= 0) {
      return 0;
    }

    // 获取 BattleStore 实例
    const { store } = this;

    /**
     * ======== 步骤 1：抵消自己的待处理垃圾行 ========
     *
     * Store.offsetGarbage 会：
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
    const remaining = store.offsetGarbage(from, attack);

    /**
     * ======== 步骤 2：剩余攻击力发送给对手 ========
     *
     * 如果抵消后还有剩余攻击力（remaining > 0）， 将其添加为对手的待处理垃圾行。
     *
     * 对手的垃圾行会在消行动画结束后的 FLUSH_GARBAGE 事件中 被实际应用到棋盘上。
     */
    if (remaining > 0) {
      store.addGarbage(to, remaining);
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
   * 1. 获取该玩家的待处理垃圾行数（store.getPendingGarbage）
   * 2. 如果 amount ≤ 0，直接返回（无垃圾行）
   * 3. 获取当前棋盘状态（board + difficulty）
   * 4. 调用 applyGarbage 生成带垃圾行的新棋盘
   * 5. 更新 Store 中的棋盘状态（Store.setState）
   * 6. 清空该玩家的待处理垃圾行计数（store.clearGarbage）
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
    const amount = this.store.getPendingGarbage(game);

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
     * 1. 从棋盘顶部移除 amount 行（模拟棋盘上升）
     * 2. 在底部添加 amount 行带空洞的垃圾行
     * 3. 返回新的棋盘数组（不修改原数组）
     */
    const next = applyGarbage(board, amount, difficulty);

    /** 更新棋盘状态： 将新的棋盘数组写入 Store，触发 UI 重新渲染。 */
    Store.setState({ board: next });

    /** 清空待处理计数： 垃圾行已经应用到棋盘，重置 pendingGarbage 为 0。 */
    this.store.clearGarbage(game);
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
   * - UPDATE_WINNER：处理单局游戏结束
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
