import Base from '@/lib/core';
import { BattleEvents } from '@/lib/events/event-catalog.js';

/**
 * # 对战事件路由器
 *
 * 负责订阅和分发对战相关的核心事件，作为 Battle 系统与 Game 实例之间的**事件桥接层**。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                                 |
 * | ---------------- | ---------------------------------------------------- |
 * | **事件订阅**     | 在 subscribe() 中注册对战事件的处理器                |
 * | **事件取消**     | 在 unsubscribe() 中移除所有已注册的处理器            |
 * | **事件路由**     | 将全局对战事件路由到具体的 Battle 实例方法           |
 * | **参数转换**     | 从事件 payload 中提取参数，调用 Battle 实例对应方法  |
 *
 * ## 设计原则
 *
 * Router 本身**不包含任何对战逻辑**，只负责事件的订阅/取消订阅和参数转发。
 * 具体的对战逻辑（如攻击计算、垃圾行处理、胜负判定）由 Battle 实例负责。
 *
 * ## 处理的对战事件
 *
 * | 事件名              | 触发时机                   | 处理器                       | 说明                         |
 * | ------------------- | -------------------------- | ---------------------------- | ---------------------------- |
 * | PROCESS_ATTACK      | 玩家消行时                 | _onBattleProcessAttack       | 计算攻击力，抵消对方待处理垃圾行 |
 * | FLUSH_GARBAGE       | 消行动画结束 dispose 时    | _onBattleFlushGarbage        | 将计算的垃圾行实际插入对方棋盘   |
 * | UPDATE_WINNER       | 有玩家游戏结束时           | _onBattleUpdateWinner        | 更新对战结果，记录胜者         |
 * | SYNC_PAUSE          | 某玩家暂停时               | _onBattleSyncPause           | 同步暂停对方游戏               |
 * | SYNC_RESUME         | 某玩家恢复时               | _onBattleSyncResume          | 同步恢复对方游戏               |
 *
 * ## 典型使用场景
 *
 * ```javascript
 * const router = new BattleRouter({ battle: battleInstance });
 * router.subscribe();   // 注册所有事件
 * router.unsubscribe(); // 移除所有事件
 * ```
 *
 * @extends Base
 */
class BattleRouter extends Base {
  /**
   * ## 构造函数
   *
   * 初始化对战路由器，接收包含 Battle 实例的配置选项。
   *
   * @param {object} options - 配置选项
   * @param {object} options.battle - Battle 实例引用，用于实际执行对战逻辑
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## 订阅对战事件
   *
   * 注册所有对战相关的事件处理器，建立事件到 Battle 方法的映射关系。
   *
   * ### 订阅的事件列表
   *
   * 1. **PROCESS_ATTACK** → 处理攻击计算
   * 2. **FLUSH_GARBAGE** → 处理垃圾行插入
   * 3. **UPDATE_WINNER** → 处理胜者更新
   * 4. **SYNC_PAUSE** → 处理暂停同步
   * 5. **SYNC_RESUME** → 处理恢复同步
   *
   * @returns {void}
   */
  subscribe() {
    // 获取对战事件常量集合
    const events = BattleEvents();

    // 注册消行攻击处理：当有玩家消行时，计算攻击力并抵消对方的待处理垃圾行
    this.on(events.PROCESS_ATTACK, this._onBattleProcessAttack);

    // 注册垃圾行刷新处理：消行动画结束后，将计算好的垃圾行实际插入对方棋盘
    this.on(events.FLUSH_GARBAGE, this._onBattleFlushGarbage);

    // 注册胜者更新处理：当某玩家游戏结束时，记录对战结果
    this.on(events.UPDATE_WINNER, this._onBattleUpdateWinner);

    // 注册暂停同步处理：当某玩家暂停时，通知对方也暂停
    this.on(events.SYNC_PAUSE, this._onBattleSyncPause);

    // 注册恢复同步处理：当某玩家恢复时，通知对方也恢复
    this.on(events.SYNC_RESUME, this._onBattleSyncResume);
  }

  /**
   * ## 取消订阅对战事件
   *
   * 移除所有在 subscribe() 中注册的事件处理器，防止内存泄漏。
   * 通常在组件销毁或切换模式时调用。
   *
   * @returns {void}
   */
  unsubscribe() {
    // 获取对战事件常量集合（与 subscribe 保持一致）
    const events = BattleEvents();

    // 移除消行攻击处理
    this.off(events.PROCESS_ATTACK, this._onBattleProcessAttack);

    // 移除垃圾行刷新处理
    this.off(events.FLUSH_GARBAGE, this._onBattleFlushGarbage);

    // 移除胜者更新处理
    this.off(events.UPDATE_WINNER, this._onBattleUpdateWinner);

    // 移除暂停同步处理
    this.off(events.SYNC_PAUSE, this._onBattleSyncPause);

    // 移除恢复同步处理
    this.off(events.SYNC_RESUME, this._onBattleSyncResume);
  }

  /**
   * ## 处理攻击事件
   *
   * 在**消行动画开始前**被调用，负责计算攻击力并抵消对方的待处理垃圾行。
   *
   * ### 处理流程
   *
   * ```
   * 玩家消行 → 触发 PROCESS_ATTACK 事件
   *          → 路由到本方法
   *          → 调用 battle.processAttack(from, lines)
   *          → 计算攻击力，尝试抵消对方 pendingGarbage
   * ```
   *
   * @param {object} payload - 事件负载
   * @param {string|number} payload.from - 发起攻击的玩家标识（攻击来源）
   * @param {number} payload.lines - 消除的行数，用于计算攻击力
   *
   * @private
   */
  _onBattleProcessAttack = (payload) => {
    // 获取 Battle 实例引用
    const { battle } = this;

    // 从事件 payload 中解构出攻击来源和消行数
    const { from, lines } = payload;

    /**
     * 调用 Battle 实例的 processAttack 方法：
     * - 根据 lines 计算攻击力（通常 1行=0, 2行=1, 3行=2, 4行=4）
     * - 尝试用攻击力抵消对方已有的 pendingGarbage
     * - 如果攻击力有剩余，转换为对方新的 pendingGarbage
     */
    battle.processAttack(from, lines);
  };

  /**
   * ## 处理垃圾行刷新事件
   *
   * 在**消行动画 dispose 的最后阶段**被调用，负责将计算好的待处理垃圾行实际插入到对方棋盘。
   *
   * ### 为什么分两步？
   *
   * 攻击系统采用**延迟插入**策略：
   * 1. **PROCESS_ATTACK**（消行开始时）：先计算攻击力，抵消对方的 pendingGarbage
   * 2. **FLUSH_GARBAGE**（消行动画结束时）：再将最终确定的垃圾行插入对方棋盘
   *
   * 这样可以确保消行动画播放完毕后，垃圾行才出现，视觉效果更流畅。
   *
   * @param {object} payload - 事件负载
   * @param {string|number} payload.from - 发起攻击的玩家标识（攻击来源），
   *                                       垃圾行将插入到对方的棋盘
   *
   * @private
   */
  _onBattleFlushGarbage = (payload) => {
    // 获取 Battle 实例引用
    const { battle } = this;

    // 从事件 payload 中解构出攻击来源
    const { from } = payload;

    /**
     * 调用 Battle 实例的 flushGarbage 方法：
     * - 获取 from 对应的对手
     * - 将当前累积的垃圾行数量转换为实际的棋盘行
     * - 在对方棋盘底部插入带空洞的垃圾行
     * - 重置垃圾行计数器
     */
    battle.flushGarbage(from);
  };

  /**
   * ## 处理胜者更新事件
   *
   * 当有玩家**游戏结束（Game Over）**时被调用，更新对战结果。
   *
   * ### 触发场景
   *
   * - 方块堆叠到顶部，无法继续游戏
   * - 主动认输
   * - 其他导致游戏结束的条件
   *
   * @param {object} payload - 事件负载
   * @param {string|number} payload.loser - 失败的玩家标识
   *
   * @private
   */
  _onBattleUpdateWinner = (payload) => {
    // 获取 Battle 实例引用
    const { battle } = this;

    // 从事件 payload 中解构出失败者标识
    const { loser } = payload;

    /**
     * 调用 Battle 实例的 update 方法：
     * - 记录失败者
     * - 自动判定胜者（另一方）
     * - 更新对战状态（如 game-over）
     * - 可能触发 UI 更新显示胜负结果
     */
    battle.update(loser);
  };

  /**
   * ## 处理暂停同步事件
   *
   * 当某玩家**暂停游戏**时被调用，将暂停状态同步给对方。
   *
   * ### 同步策略
   *
   * 对战模式下的暂停需要**双方同步**：
   * - 玩家 A 暂停 → 触发 SYNC_PAUSE
   * - 路由到本方法 → 获取对手（玩家 B）
   * - 调用对手的 pause 方法 → 玩家 B 也被暂停
   *
   * 这样可以避免一方暂停时另一方还能继续操作的不公平情况。
   *
   * @param {object} payload - 事件负载
   * @param {string|number} payload.from - 发起暂停的玩家标识
   *
   * @private
   */
  _onBattleSyncPause = (payload) => {
    // 获取 Battle 实例引用
    const { battle } = this;

    // 从事件 payload 中解构出暂停发起者
    const { from } = payload;

    /**
     * 获取对手实例：
     * - 通过 Battle 实例的 getOpponent 方法找到 from 对应的对手
     * - 返回对手的 Game 实例引用
     */
    const opponent = battle.getOpponent(from);

    /**
     * 同步暂停对手：
     * - 调用对手 Game 实例的 pause 方法
     * - 传入对手自身作为参数（保持接口一致性）
     */
    opponent.pause(opponent);
  };

  /**
   * ## 处理恢复同步事件
   *
   * 当某玩家**恢复游戏**时被调用，将恢复状态同步给对方。
   *
   * ### 同步策略
   *
   * 与暂停对称：
   * - 玩家 A 恢复 → 触发 SYNC_RESUME
   * - 路由到本方法 → 获取对手（玩家 B）
   * - 调用对手的 resume 方法 → 玩家 B 也恢复
   *
   * 确保双方始终处于相同的游戏状态（运行中 / 暂停中）。
   *
   * @param {object} payload - 事件负载
   * @param {string|number} payload.from - 发起恢复的玩家标识
   *
   * @private
   */
  _onBattleSyncResume = (payload) => {
    // 获取 Battle 实例引用
    const { battle } = this;

    // 从事件 payload 中解构出恢复发起者
    const { from } = payload;

    /**
     * 获取对手实例：
     * - 通过 Battle 实例的 getOpponent 方法找到 from 对应的对手
     * - 返回对手的 Game 实例引用
     */
    const opponent = battle.getOpponent(from);

    /**
     * 同步恢复对手：
     * - 调用对手 Game 实例的 resume 方法
     * - 传入对手自身作为参数（保持接口一致性）
     */
    opponent.resume(opponent);
  };
}

export default BattleRouter;
