import Base from '@/lib/core';
import BattleStore from '@/lib/battle/battle-store.js';
import BattleHUD from '@/lib/battle/battle-hud.js';
import BattleUI from '@/lib/battle/battle-ui.js';
import BattleRouter from '@/lib/events/router/battle-router.js';
import { calculateGarbage, applyGarbage } from '@/lib/battle/garbage-system.js';
import {
  GameEvents,
  AudioEvents,
  BattleEvents,
} from '@/lib/events/event-catalog.js';

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
 *       ├── BattleUI（对战结果展示 & fly canvas 管理）
 *       │   ├── 覆盖层显示胜者
 *       │   └── fly canvas 显示/隐藏
 *       ├── BattleRouter（事件路由）
 *       │   └── 6 个对战事件的订阅和分发
 *       └── Garbage System（垃圾行系统）
 *           ├── calculateGarbage（攻击力计算）
 *           └── applyGarbage（垃圾行生成）
 *
 * ## 攻击处理流程（含动画时序）
 *
 *     玩家A消行
 *       → 触发 PROCESS_ATTACK 事件
 *         → BattleRouter 路由到 processAttack(from, lines)
 *           → calculateGarbage(lines) 计算攻击力
 *             → offsetGarbage(from, attack) 抵消自己的待处理垃圾
 *               ├─ 有剩余攻击力 → addGarbage(to, remaining) 发送给对手
 *               │   └─ Scheduler.sequence 编排动画时序：
 *               │       1. 显示 fly canvas（BattleUI.show({ fly })）
 *               │       2. 触发 START_GARBAGE_FLY → FlyAnimation 400ms
 *               │       3. 400ms 后触发 START_GARBAGE_WARNING → WarningAnimation 600ms
 *               │       4. 600ms 后隐藏 fly canvas（BattleUI.hide({ fly })）
 *               │       5. 120ms 后播放 GARBAGE_WARNING 音效
 *               └─ 无剩余 → 结束
 *       → 消行动画播放
 *       → 触发 FLUSH_GARBAGE 事件
 *         → BattleRouter 路由到 flushGarbage(game)
 *           → getPendingGarbage(game) 获取待处理垃圾行
 *             → applyGarbage(board, amount, difficulty) 生成垃圾行棋盘
 *               → setState({ board: next }) 更新对手棋盘
 *                 → clearGarbage(game) 清空待处理计数
 *                   → 触发 START_GARBAGE_PUSH → PushAnimation 闪烁
 *                     → 120ms 后播放 GARBAGE_RECEIVED 音效
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
 *                       │        → BattleUI.show({ winner: Player })
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
 *         → ui.hide({ over: true }) 隐藏结果覆盖层
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
 *   elements: {
 *     overlay: 'tetris-battle-overlay',
 *     over: 'tetris-battle-over',
 *     winner: 'tetris-battle-winner',
 *     fly: 'tetris-battle-fly',
 *   },
 *   players: ['human', 'human'],
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
   * 1. 调用父类构造函数传递配置（games、victoryScore、elements、players）
   * 2. 调用 `initialize()` 创建所有子系统并自动开始
   *
   * @example
   *   const battle = new BattleController({
   *     games: [game1, game2],
   *     victoryScore: 20,
   *     elements: {
   *       overlay: 'tetris-battle-overlay',
   *       over: 'tetris-battle-over',
   *       winner: 'tetris-battle-winner',
   *       fly: 'tetris-battle-fly',
   *     },
   *     players: ['human', 'human'],
   *   });
   *
   * @param {object} options - 配置选项
   * @param {object[]} options.games - Game 实例数组（长度为 2）
   * @param {number} [options.victoryScore=20] - 目标分数，先达到者赢得整场对战。默认值为 20.
   *   Default is `20`
   * @param {object} options.elements - BattleUI 所需的 DOM 元素 ID 配置
   * @param {string} options.elements.overlay - 覆盖层容器元素 ID
   * @param {string} options.elements.over - 胜者面板元素 ID
   * @param {string} options.elements.winner - 胜者名称显示元素 ID
   * @param {string} options.elements.fly - Fly canvas 元素 ID 后缀
   * @param {string[]} options.players - 玩家名称数组
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，将配置对象中的所有属性注入实例
    super(options);

    // 所有配置就绪后，立即初始化对战系统的各个子系统
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
   * 4. **BattleUI**：结果展示界面 + fly canvas 管理（依赖 elements 和 players）
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
    // 从配置中解构 Game 实例数组、DOM 元素配置和玩家列表（由 Base 构造函数注入）
    const { games, elements, players } = this;

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
     * 通过 structuredClone(BattleState) 深拷贝初始状态模板， 确保每个 BattleStore 实例拥有独立的状态数据。
     *
     * @type {BattleStore}
     */
    const store = new BattleStore({ games });

    /**
     * ======== 步骤 2：创建 HUD 控制器 ========
     *
     * BattleHUD 负责实时更新 DOM 中的分数显示。 需要 games（获取 Player 信息生成 playerId）和 store（通过
     * getScore 查询分数）。
     *
     * 挂在 this 上供其他方法使用。
     *
     * @type {BattleStore}
     */
    this.store = store;
    /** @type {BattleHUD} */
    this.hud = new BattleHUD({ games, store });

    /**
     * ======== 步骤 3：创建事件路由器 ========
     *
     * BattleRouter 负责订阅对战事件（PROCESS_ATTACK、START_GARBAGE_FLY、 FLUSH_GARBAGE
     * 等）并路由到 BattleController 的对应方法。
     *
     * 注意：此时 this 已完整初始化（store、hud 已就绪）， 可以安全地将自身引用传递给路由器。 路由器内部会通过 this.battle
     * 回调 BattleController 的方法。
     *
     * @type {BattleRouter}
     */
    this.router = new BattleRouter({ battle: this });

    /**
     * ======== 步骤 4：创建结果展示界面 ========
     *
     * BattleUI 负责：
     *
     * - 整场对战结束后的胜者展示（$overlay + $over + $winner）
     * - 垃圾行飞行动画的 fly canvas 显示/隐藏（$flies）
     *
     * 需要 elements 配置和 players 列表来定位所有 DOM 元素。
     *
     * @type {BattleUI}
     */
    this.ui = new BattleUI({ elements, players });

    /**
     * ======== 步骤 5：开始对战 ========
     *
     * 所有子系统就绪后，自动开始对战。 start() 方法会将 store 中的 running 状态设置为 true。
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
   * ### 何时调用
   *
   * - 构造函数中自动调用（初始化完成后）
   * - Restart() 中调用（开始新一局）
   * - 外部手动恢复对战
   *
   * @returns {void}
   */
  start() {
    // 获取 BattleStore 实例
    const { store } = this;

    // 防御性检查：如果已经在运行中，直接返回，不做任何操作
    if (store.isRunning()) {
      return;
    }

    // 将对战状态标记为运行中
    store.setRunning(true);
  }

  /**
   * ## 停止对战
   *
   * 将对战状态设置为已停止。如果已经停止，则忽略此调用。
   *
   * ### 使用场景
   *
   * - 单局游戏结束时（有玩家失败）→ update() 中调用
   * - 整场对战结束时 → over() 调用前
   * - 手动暂停对战
   *
   * ### 幂等性保证
   *
   * 与 start() 对称，通过检查确保不会重复停止。 使用 `!store.isRunning()` 判断是否已经停止。
   *
   * @returns {void}
   */
  stop() {
    // 获取 BattleStore 实例
    const { store } = this;

    // 防御性检查：如果已经停止，直接返回
    if (!store.isRunning()) {
      return;
    }

    // 将对战状态标记为已停止
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
   * - 在计分期间暂停游戏逻辑，防止新的输入干扰计分过程
   * - 确保胜负判定的原子性——不会在计分过程中产生新的游戏事件
   *
   * @example
   *   // Bob 游戏结束（方块堆满到顶）
   *   battle.update(bobGame);
   *   // → Alice 得分 +1
   *   // → 检查 Alice 分数 >= 20？
   *   //   → 是：显示结果界面，Alice 赢得整场对战
   *   //   → 否：通知 Bob 重新开始下一局
   *
   * @param {object} loser - 失败的玩家 Game 实例
   * @param {string | number} loser.id - 失败的玩家唯一标识，用于查找对手
   * @param {object} loser.Player - 失败的玩家信息对象
   * @param {Function} loser.emit - 事件触发方法，用于发送游戏事件
   * @returns {void}
   */
  update(loser) {
    // 从实例上解构目标分数和状态管理器
    const { victoryScore, store } = this;

    // 找到失败者的对手——对手即为本局的胜者
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
    // 获取胜者唯一标识（用于查询分数）
    const winnerId = store.getPlayerId(winner);
    // 查询胜者当前的胜场数
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
   * 当有玩家达到 victoryScore 时调用，标志着整场对战（Match）的终结。
   *
   * ### 执行流程
   *
   * 1. 通知双方切换到 `battle-over` 模式（停止游戏逻辑，冻结游戏状态）
   * 2. 通过 BattleUI 显示胜者名称覆盖层
   *
   * ### 覆盖层显示
   *
   * BattleUI.show({ winner: Player }) 会：
   *
   * - 将胜者名称（含 1P/2P 标识）写入 $winner 元素
   * - 显示胜者面板（$over 移除 tetris-hidden）
   * - 显示覆盖层容器（$overlay 移除 tetris-hidden）
   *
   * 用户按 Enter 键后会触发 `reset()` 重新开始整场对战。
   *
   * @param {object} winner - 整场对战的胜者 Game 实例
   * @param {object} loser - 整场对战的败者 Game 实例
   * @returns {void}
   */
  over(winner, loser) {
    // 获取双方的事件常量，通过 GameEvents(id) 生成命名空间隔离的事件定义
    const WE = GameEvents(winner.id);
    const LE = GameEvents(loser.id);

    // 构造模式切换的事件负载
    const payload = { mode: 'battle-over' };

    // 通知胜者切换到 battle-over 模式
    winner.emit(WE.UPDATE_MODE, payload);

    // 通知败者切换到 battle-over 模式
    loser.emit(LE.UPDATE_MODE, payload);

    // 提取胜者 Player 信息
    const { Player } = winner;

    /**
     * 显示对战结果覆盖层。 BattleUI.show({ winner: Player }) 会提取 Player.name 和
     * Player.index， 生成显示文本（如 "ALICE (1P)"）并显示。
     */
    this.ui.show({ winner: Player });
  }

  /**
   * ## 重新开始一局对战
   *
   * 当前单局结束但整场未结束时调用（有人赢了一局但未达到 victoryScore）。
   *
   * ### 执行流程
   *
   * 1. 清除双方动画（清空残留的消行、垃圾行动画）
   * 2. 递增回合数
   * 3. 通知败者重新初始化棋盘（RESTART 事件）
   * 4. 重新开始对战（start）
   *
   * ### 为什么清除双方动画？
   *
   * 在判定胜负的瞬间，可能还有消行动画或垃圾行动画在播放。 如果不清理，这些动画会残留到下一局，导致视觉异常。
   *
   * @param {object} loser - 本局失败的玩家 Game 实例
   * @returns {void}
   */
  restart(loser) {
    // 获取败者的事件常量定义
    const events = GameEvents(loser.id);

    // 找到胜者（用于清除动画）
    const winner = this.getOpponent(loser);

    // ========== 步骤 1：清除双方动画 ==========
    winner.Animations?.clear?.();
    loser.Animations?.clear?.();

    // ========== 步骤 2：递增回合数 ==========
    this.store.increaseRound();

    /**
     * ========== 步骤 3：通知败者重新初始化 ==========
     *
     * 触发 RESTART 事件，败者的 Game 实例收到事件后会：
     *
     * - 清空当前棋盘
     * - 重置游戏状态
     * - 准备接收新的方块
     */
    loser.emit(events.RESTART);

    // ========== 步骤 4：重新开始对战 ==========
    this.start();
  }

  /**
   * ## 重置整场对战
   *
   * 清空所有分数和状态，重新开始一场全新的对战。 这是最高级别的重置——整场对战（Match）重新开始。
   *
   * ### 触发场景
   *
   * - 用户在结果覆盖层按 Enter 键
   * - 外部调用强制重置
   *
   * ### 执行流程
   *
   * 1. 找到对手
   * 2. 重置状态管理器（清空所有分数和垃圾行数据）
   * 3. 重置 HUD 分数显示为 0
   * 4. 隐藏结果覆盖层
   * 5. 通知双方重置到 main-menu 模式
   *
   * @param {object} from - 发起重置的玩家 Game 实例
   * @param {string | number} from.id - 发起者的唯一标识
   * @param {Function} from.emit - 事件触发方法
   * @returns {void}
   */
  reset(from) {
    // 找到发起者的对手
    const opponent = this.getOpponent(from);

    /**
     * ======== 步骤 1：重置状态管理器 ========
     *
     * 调用 BattleStore.reset() 会：
     *
     * - 清空双方胜场数（归零）
     * - 清空待处理垃圾行
     * - 清空当前胜者记录
     * - 通过 structuredClone 重新创建初始状态
     */
    this.store.reset();

    /**
     * ======== 步骤 2：重置 HUD 显示 ========
     *
     * 将双方分数都显示为 0，同步更新 DOM 元素。
     */
    this.hud.updateScores(from, opponent);

    /**
     * ======== 步骤 3：隐藏结果覆盖层 ========
     *
     * BattleUI.hide({ over: true }) 会：
     *
     * - 清空胜者名称
     * - 隐藏胜者面板
     * - 如果所有 fly 也已隐藏 → 隐藏覆盖层容器
     */
    this.ui.hide({ over: true });

    /* ========== 步骤 4：通知双方重置到 main-menu ========== */
    // 获取双方的事件常量定义
    const FE = GameEvents(from.id);
    const OE = GameEvents(opponent.id);

    /**
     * 触发 RESET 事件：
     *
     * 双方 Game 实例收到 RESET 事件后会：
     *
     * - 切换到 main-menu 模式
     * - 清理游戏状态
     * - 返回到主菜单界面
     */
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
   * 使用 `Array.find()` 在 games 数组中查找第一个 `id` 不等于 `yourself.id` 的 Game 实例。在标准的
   * 1v1 对战中，games 数组长度为 2， 返回的就是唯一的对手。
   *
   * @example
   *   const opponent = battle.getOpponent(game1);
   *   console.log(opponent.Player.name); // 输出对手的显示名称
   *
   * @param {object} yourself - 当前玩家 Game 实例
   * @param {string | number} yourself.id - 当前玩家的唯一标识
   * @returns {object} 对手的 Game 实例
   */
  getOpponent(yourself) {
    // 从实例上解构 games 数组（由 Base 构造函数注入）
    const { games } = this;

    /**
     * 在 games 数组中查找对手： 使用 Array.find() 返回第一个 id 不等于当前玩家 id 的 Game 实例。 在标准 1v1
     * 场景中，games 数组有两个元素， 传入 A 返回 B，传入 B 返回 A。
     */
    return games.find((game) => game.id !== yourself.id);
  }

  /**
   * ## 获取当前回合 ID
   *
   * 返回当前对战的回合编号，用于动画的 roundId 校验。 动画系统通过比对 roundId 来判断动画是否属于当前回合。
   *
   * @returns {number} 当前回合的唯一标识
   */
  getRoundId() {
    // 委托给 store 获取当前回合 ID
    return this.store.getRoundId();
  }

  /**
   * ## 获取指定玩家的 fly canvas
   *
   * 通过 playerId（格式 `{player}-{index}`）从 BattleUI 中查找 对应玩家的 fly canvas DOM 元素。
   *
   * FlyAnimation 调用此方法获取其专属的 canvas 进行粒子绘制。
   *
   * @param {string} index - 玩家标识（如 "human-0"）
   * @returns {HTMLCanvasElement} 对应玩家的 fly canvas 元素
   */
  getOverlayFly(index) {
    // 委托给 BattleUI 的 $flies 映射表查找
    return this.ui.$flies[index];
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
   * 6. 通过 Scheduler.sequence 编排完整的动画时序：
   *
   *    - 立即：显示 fly canvas → 触发 START_GARBAGE_FLY（FlyAnimation 400ms）
   *    - 400ms：触发 START_GARBAGE_WARNING（WarningAnimation 600ms）
   *    - 600ms：隐藏 fly canvas
   *    - 120ms：播放 GARBAGE_WARNING 音效
   * 7. 返回实际发出的垃圾行数
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
   * ### 攻击力计算说明
   *
   * 使用 `calculateGarbage` 函数根据消行数查询 `GARBAGE_MAP`：
   *
   * | 消行数 | 攻击力 | 说明         |
   * | ------ | ------ | ------------ |
   * | 1 行   | 0      | 单消不给攻击 |
   * | 2 行   | 1      | Double       |
   * | 3 行   | 2      | Triple       |
   * | 4 行   | 3      | Tetris       |
   *
   * @example
   *   // 玩家完成 Tetris（4行），没有待处理垃圾
   *   const sent = battle.processAttack(playerGame, clearedLines);
   *   // sent = 3（给对手发送 3 行垃圾行）
   *
   * @example
   *   // 玩家消 2 行，但有 5 行待处理垃圾
   *   const sent = battle.processAttack(playerGame, clearedLines);
   *   // sent = 0（攻击力全部用于抵消自己的垃圾行）
   *
   * @param {object} from - 发起攻击的玩家 Game 实例（消行的一方）
   * @param {Array} lines - 消除的行数组，使用 `lines.length` 计算攻击力
   * @returns {number} 实际发送给对手的垃圾行数（剩余攻击力），0 表示无攻击
   */
  processAttack(from, lines) {
    // 找到攻击目标——对手的 Game 实例
    const to = this.getOpponent(from);

    /**
     * 计算攻击力： 根据消除的行数 lines.length 查询 GARBAGE_MAP 映射表。 calculateGarbage
     * 是一个纯函数，输入消行数，输出攻击力。
     */
    const attack = calculateGarbage(lines.length);

    /** 边界检查： 如果攻击力 ≤ 0（如单消或无效消行），不产生任何攻击。 直接返回 0，无需进行后续的抵消和转发处理。 */
    if (attack <= 0) {
      return 0;
    }

    // 获取 BattleStore 实例，用于后续的状态操作
    const { store } = this;

    /**
     * ======== 步骤 1：抵消自己的待处理垃圾行 ========
     *
     * Store.offsetGarbage(from, attack) 会：
     *
     * 1. 获取 from 玩家当前的 pendingGarbage
     * 2. 用 attack 去抵消 pendingGarbage
     * 3. 返回抵消后剩余的攻击力
     */
    const remaining = store.offsetGarbage(from, attack);

    /**
     * ======== 步骤 2：剩余攻击力发送给对手 ========
     *
     * 如果抵消后还有剩余攻击力（remaining > 0）， 将其添加为对手的待处理垃圾行，并触发完整的动画序列。
     */
    if (remaining > 0) {
      /**
       * 将剩余攻击力加入对手的待处理垃圾行： store.addGarbage(to, remaining) 会将 remaining 累加到 对手的
       * pendingGarbage 计数器上。
       */
      store.addGarbage(to, remaining);

      // 获取对手 Game 实例上的调度器（用于延时操作）
      const { Scheduler } = to;
      // 获取当前回合 ID
      const roundId = this.getRoundId();
      // 获取对手的玩家标识（如 "human-1"），用于 fly canvas 选择
      const playerId = store.getPlayerId(to);

      /**
       * ======== 步骤 3：编排动画时序 ========
       *
       * 使用 Scheduler.sequence 按时间顺序执行：
       *
       * 1. 立即执行：显示对手的 fly canvas
       * 2. 立即执行：触发 START_GARBAGE_FLY → FlyAnimation 400ms
       * 3. 400ms 后：触发 START_GARBAGE_WARNING → WarningAnimation 600ms
       * 4. 600ms 后：隐藏 fly canvas
       *
       * 整个攻击反馈链总时长约 1s：fly(400ms) + warning(600ms)
       */
      Scheduler.sequence([
        /**
         * 第 1 步：显示 fly canvas。 通过 BattleUI.show({ fly: playerId }) 移除对应 fly
         * canvas 的 tetris-hidden 类并显示覆盖层。
         */
        {
          fn: () => {
            this.ui.show({ fly: playerId });
          },
        },
        /**
         * 第 2 步：触发垃圾行飞行动画。 发送 START_GARBAGE_FLY 事件，携带
         * from、to、roundId、amount、fly、Battle。 GameRouter 收到事件后注册 FlyAnimation
         * 到对手的 Animations。 FlyAnimation 持续 400ms。
         */
        {
          fn: () => {
            const events = BattleEvents();

            to.emit(events.START_GARBAGE_FLY, {
              from,
              to,
              roundId,
              amount: attack,
              fly: playerId,
              Battle: this,
            });
          },
        },
        /**
         * 第 3 步（400ms 后）：触发垃圾行预警动画。 发送 START_GARBAGE_WARNING 事件。 GameRouter
         * 收到事件后注册 GarbageWarningAnimation。 WarningAnimation 持续 600ms，5 次红色闪烁。
         */
        {
          fn: () => {
            const events = GameEvents(to.id);

            to.emit(events.START_GARBAGE_WARNING, {
              roundId,
              amount: attack,
              Battle: this,
            });
          },
          delay: 400,
        },
        /**
         * 第 4 步（600ms 后）：隐藏 fly canvas。 通过 BattleUI.hide({ fly: playerId }) 添加
         * tetris-hidden 类。 如果所有 fly 都已隐藏，同步隐藏覆盖层容器。
         */
        {
          fn: () => {
            this.ui.hide({ fly: playerId });
          },
          delay: 600,
        },
      ]);

      Scheduler.delay(() => {
        // 播放预警音效
        const events = AudioEvents();
        this.emit(events.PLAY_SOUND, { sound: 'GARBAGE_WARNING' });
      }, 120);
    }

    // 返回剩余攻击力（即实际发送给对手的垃圾行数）
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
   * 7. 提取垃圾行数据，触发闪烁动画 + 音效
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
   * @param {object} game - 要应用垃圾行的玩家 Game 实例
   * @returns {void}
   */
  flushGarbage(game) {
    // 获取被攻击玩家的调度器
    const { Scheduler } = game;

    // 获取该玩家的待处理垃圾行数量
    const amount = this.store.getPendingGarbage(game);

    /** 边界检查： 如果没有待处理的垃圾行（amount ≤ 0），直接返回。 */
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
     * 应用垃圾行： 调用 applyGarbage 函数生成新的棋盘数组。 从棋盘顶部移除 amount 行，在底部添加 amount
     * 行带空洞的垃圾行。
     */
    const next = applyGarbage(board, amount, difficulty);

    // 更新棋盘状态
    Store.setState({ board: next });

    // 清空待处理计数
    this.store.clearGarbage(game);

    // 提取垃圾行数据（棋盘底部 amount 行）
    const garbageRows = next.slice(-amount);

    // 获取游戏事件定义和当前回合 ID
    const events = GameEvents(game.id);
    const roundId = this.getRoundId();

    /**
     * 触发垃圾行闪烁动画： Game 实例收到 START_GARBAGE_PUSH 事件后注册 GarbagePushAnimation，
     * 垃圾方块在灰色和白色之间交替闪烁 5 次（600ms）。
     */
    game.emit(events.START_GARBAGE_PUSH, {
      rows: garbageRows,
      roundId,
      Battle: this,
    });

    /** 120ms 后播放垃圾行插入音效。 */
    Scheduler.delay(() => {
      const events = AudioEvents();
      this.emit(events.PLAY_SOUND, { sound: 'GARBAGE_RECEIVED' });
    }, 120);
  }

  /**
   * ## 订阅对战事件
   *
   * 通过 BattleRouter 注册所有对战相关的事件处理器。
   *
   * ### 订阅的事件
   *
   * | 事件名            | 处理方法                  | 触发时机         |
   * | ----------------- | ------------------------- | ---------------- |
   * | PROCESS_ATTACK    | processAttack()           | 玩家消行时       |
   * | START_GARBAGE_FLY | \_onBattleStartGarbageFly | 垃圾行攻击时     |
   * | FLUSH_GARBAGE     | flushGarbage()            | 消行动画结束时   |
   * | UPDATE_WINNER     | update()                  | 有玩家游戏结束时 |
   * | SYNC_PAUSE        | stop()                    | 对战暂停时       |
   * | SYNC_RESUME       | start()                   | 对战恢复时       |
   * | RESET             | reset()                   | 重赛时           |
   *
   * @returns {void}
   */
  subscribe() {
    // 委托给 BattleRouter 处理事件订阅
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
    // 委托给 BattleRouter 移除所有事件监听器
    this.router.unsubscribe();
  }
}

export default BattleController;
