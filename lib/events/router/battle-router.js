import Base from '@/lib/core';
import { BattleEvents } from '@/lib/events/event-catalog.js';
import GarbageFlyAnimation from '@/lib/services/animations/garbage-fly-animation.js';

/**
 * # 对战事件路由器
 *
 * 负责订阅和分发对战相关的核心事件，作为 Battle 系统与 Game 实例之间的**事件桥接层**。
 *
 * ## 核心职责
 *
 * | 职责         | 说明                                                |
 * | ------------ | --------------------------------------------------- |
 * | **事件订阅** | 在 subscribe() 中注册对战事件的处理器               |
 * | **事件取消** | 在 unsubscribe() 中移除所有已注册的处理器           |
 * | **事件路由** | 将全局对战事件路由到具体的 Battle 实例方法          |
 * | **参数转换** | 从事件 payload 中提取参数，调用 Battle 实例对应方法 |
 *
 * ## 设计原则
 *
 * Router 本身**不包含任何对战逻辑**，只负责事件的订阅/取消订阅和参数转发。 具体的对战逻辑（如攻击计算、垃圾行处理、胜负判定）由 Battle
 * 实例负责。
 *
 * ## 处理的对战事件
 *
 * | 事件名            | 触发时机                | 处理器                     | 说明                             |
 * | ----------------- | ----------------------- | -------------------------- | -------------------------------- |
 * | PROCESS_ATTACK    | 玩家消行时              | `_onBattleProcessAttack`   | 计算攻击力，抵消对方待处理垃圾行 |
 * | START_GARBAGE_FLY | 垃圾行攻击时            | `_onBattleStartGarbageFly` | 注册垃圾行粒子飞行动画           |
 * | FLUSH_GARBAGE     | 消行动画结束 dispose 时 | `_onBattleFlushGarbage`    | 将计算的垃圾行实际插入对方棋盘   |
 * | UPDATE_WINNER     | 有玩家游戏结束时        | `_onBattleUpdateWinner`    | 更新对战结果，记录胜者           |
 * | SYNC_PAUSE        | 某玩家暂停时            | `_onBattleSyncPause`       | 同步暂停对方游戏                 |
 * | SYNC_RESUME       | 某玩家恢复时            | `_onBattleSyncResume`      | 同步恢复对方游戏                 |
 * | RESET             | 重赛时                  | `_onBattleReset`           | 重置对战状态                     |
 * | PLAYER_SURRENDER  | 玩家认输时              | `_onBattlePlayerSurrender` | 处理认输，对方直接获胜           |
 *
 * ## 典型使用场景
 *
 * ```javascript
 * const router = new BattleRouter({ battle: battleInstance });
 * router.subscribe(); // 注册所有事件
 * router.unsubscribe(); // 移除所有事件
 * ```
 *
 * @augments Base
 * @class BattleRouter
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
   * @returns {void}
   */
  subscribe() {
    // 获取对战事件常量集合
    const events = BattleEvents();

    // 注册消行攻击处理
    this.on(events.PROCESS_ATTACK, this._onBattleProcessAttack);

    // 注册垃圾行飞行动画
    this.on(events.START_GARBAGE_FLY, this._onBattleStartGarbageFly);

    // 注册垃圾行刷新处理
    this.on(events.FLUSH_GARBAGE, this._onBattleFlushGarbage);

    // 注册胜者更新处理
    this.on(events.UPDATE_WINNER, this._onBattleUpdateWinner);

    // 注册暂停同步处理
    this.on(events.SYNC_PAUSE, this._onBattleSyncPause);

    // 注册恢复同步处理
    this.on(events.SYNC_RESUME, this._onBattleSyncResume);

    // 重置对战模式
    this.on(events.RESET, this._onBattleReset);

    // 玩家认输
    this.on(events.PLAYER_SURRENDER, this._onBattlePlayerSurrender);
  }

  /**
   * ## 取消订阅对战事件
   *
   * 移除所有在 subscribe() 中注册的事件处理器，防止内存泄漏。 通常在组件销毁或切换模式时调用。
   *
   * @returns {void}
   */
  unsubscribe() {
    // 获取对战事件常量集合（与 subscribe 保持一致）
    const events = BattleEvents();

    this.off(events.PROCESS_ATTACK, this._onBattleProcessAttack);
    this.off(events.START_GARBAGE_FLY, this._onBattleStartGarbageFly);
    this.off(events.FLUSH_GARBAGE, this._onBattleFlushGarbage);
    this.off(events.UPDATE_WINNER, this._onBattleUpdateWinner);
    this.off(events.SYNC_PAUSE, this._onBattleSyncPause);
    this.off(events.SYNC_RESUME, this._onBattleSyncResume);
    this.off(events.RESET, this._onBattleReset);
    this.off(events.PLAYER_SURRENDER, this._onBattlePlayerSurrender);
  }

  /**
   * ## 处理攻击事件
   *
   * 在**消行动画开始前**被调用，负责计算攻击力并抵消对方的待处理垃圾行。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起攻击的玩家 Game 实例
   * @param {Array} payload.lines - 消除的行数数据，用于计算攻击力
   */
  _onBattleProcessAttack = (payload) => {
    const { battle } = this;
    const { from, lines } = payload;
    battle.processAttack(from, lines);
  };

  /**
   * ## 处理垃圾行飞行动画
   *
   * 注册 GarbageFlyAnimation 到受攻击方的 AnimationSystem。 粒子从攻击方棋盘飞向受攻击方棋盘，持续 400ms。
   *
   * @private
   * @param {object} payload - 事件负载
   */
  _onBattleStartGarbageFly = (payload) => {
    const { Animations } = payload.to;
    Animations.register(new GarbageFlyAnimation(payload));
  };

  /**
   * ## 处理垃圾行刷新事件
   *
   * 在**消行动画 dispose 的最后阶段**被调用， 负责将计算好的待处理垃圾行实际插入到对方棋盘。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起攻击的玩家 Game 实例
   */
  _onBattleFlushGarbage = (payload) => {
    const { battle } = this;
    const { from } = payload;
    battle.flushGarbage(from);
  };

  /**
   * ## 处理胜者更新事件
   *
   * 当有玩家**游戏结束（Game Over）**时被调用，更新对战结果。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.loser - 失败的玩家 Game 实例
   */
  _onBattleUpdateWinner = (payload) => {
    const { battle } = this;
    const { loser } = payload;
    battle.update(loser);
  };

  /**
   * ## 处理暂停同步事件
   *
   * 当某玩家**暂停游戏**时被调用，将暂停状态同步给对方。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起暂停的玩家 Game 实例
   */
  _onBattleSyncPause = (payload) => {
    const { battle } = this;
    const { from } = payload;
    const opponent = battle.getOpponent(from);
    opponent.pause(opponent);
  };

  /**
   * ## 处理恢复同步事件
   *
   * 当某玩家**恢复游戏**时被调用，将恢复状态同步给对方。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起恢复的玩家 Game 实例
   */
  _onBattleSyncResume = (payload) => {
    const { battle } = this;
    const { from } = payload;
    const opponent = battle.getOpponent(from);
    opponent.resume(opponent);
  };

  /**
   * ## 处理重置事件
   *
   * 用户按 Enter 重赛时触发。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起重置的玩家 Game 实例
   */
  _onBattleReset = (payload) => {
    const { battle } = this;
    const { from } = payload;
    battle.reset(from);
  };

  /**
   * ## 处理玩家认输事件
   *
   * 当玩家在对战中按 ESC 认输时触发。 调用 BattleController.surrender() 将对手分数直接设为 victoryScore，
   * 触发 BATTLE OVER 界面。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.loser - 认输的玩家 Game 实例
   */
  _onBattlePlayerSurrender = (payload) => {
    const { battle } = this;
    const { loser } = payload;
    battle.surrender(loser);
  };
}

export default BattleRouter;
