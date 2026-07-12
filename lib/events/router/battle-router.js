import Base from '@/lib/core';
import { BattleEvents } from '@/lib/events/event-catalog.js';
import GarbageFlyAnimation from '@/lib/services/animations/garbage-fly-animation.js';

/**
 * ============================================================
 *
 * # 模块：BattleRouter 对战事件路由器
 *
 * ============================================================
 *
 * 负责订阅和分发对战相关的核心事件， 作为 Battle 系统与 Game 实例之间的事件桥接层。
 *
 * ## 核心职责
 *
 * | 职责     | 说明                                                |
 * | :------- | :-------------------------------------------------- |
 * | 事件订阅 | 在 subscribe() 中注册对战事件的处理器               |
 * | 事件取消 | 在 unsubscribe() 中移除所有已注册的处理器           |
 * | 事件路由 | 将全局对战事件路由到具体的 Battle 实例方法          |
 * | 参数转换 | 从事件 payload 中提取参数，调用 Battle 实例对应方法 |
 *
 * ## 处理的对战事件
 *
 * | 事件名            | 触发时机                | 处理器                    | 说明                             |
 * | :---------------- | :---------------------- | :------------------------ | :------------------------------- |
 * | PROCESS_ATTACK    | 玩家消行时              | \_onBattleProcessAttack   | 计算攻击力，抵消对方待处理垃圾行 |
 * | START_GARBAGE_FLY | 垃圾行攻击时            | \_onBattleStartGarbageFly | 注册垃圾行粒子飞行动画           |
 * | FLUSH_GARBAGE     | 消行动画结束 dispose 时 | \_onBattleFlushGarbage    | 将计算的垃圾行实际插入对方棋盘   |
 * | UPDATE_WINNER     | 有玩家游戏结束时        | \_onBattleUpdateWinner    | 更新对战结果，记录胜者           |
 * | SYNC_PAUSE        | 某玩家暂停时            | \_onBattleSyncPause       | 同步暂停对方游戏                 |
 * | SYNC_RESUME       | 某玩家恢复时            | \_onBattleSyncResume      | 同步恢复对方游戏                 |
 * | RESET             | 重赛时                  | \_onBattleReset           | 重置对战状态                     |
 * | PLAYER_SURRENDER  | 玩家认输时              | \_onBattlePlayerSurrender | 处理认输，对方直接获胜           |
 *
 * @augments Base
 * @class BattleRouter
 */
class BattleRouter extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置选项
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## subscribe：订阅对战事件
   *
   * 注册所有对战相关的事件处理器。
   *
   * @returns {void}
   */
  subscribe() {
    const events = BattleEvents();

    this.on(events.PROCESS_ATTACK, this._onBattleProcessAttack);
    this.on(events.START_GARBAGE_FLY, this._onBattleStartGarbageFly);
    this.on(events.FLUSH_GARBAGE, this._onBattleFlushGarbage);
    this.on(events.UPDATE_WINNER, this._onBattleUpdateWinner);
    this.on(events.SYNC_PAUSE, this._onBattleSyncPause);
    this.on(events.SYNC_RESUME, this._onBattleSyncResume);
    this.on(events.RESET, this._onBattleReset);
    this.on(events.PLAYER_SURRENDER, this._onBattlePlayerSurrender);
  }

  /**
   * ## unsubscribe：取消订阅对战事件
   *
   * 移除所有已注册的事件处理器。
   *
   * @returns {void}
   */
  unsubscribe() {
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

  /*
   * ============================================================
   * 事件处理器
   * ============================================================
   */

  /**
   * ## _onBattleProcessAttack：处理攻击事件
   *
   * 在消行动画开始前被调用，计算攻击力并抵消对方的待处理垃圾行。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起攻击的玩家 Game 实例
   * @param {Array} payload.lines - 消除的行数数据
   */
  _onBattleProcessAttack = (payload) => {
    const { from, lines } = payload;
    this.battle.processAttack(from, lines);
  };

  /**
   * ## _onBattleStartGarbageFly：处理垃圾行飞行动画
   *
   * 注册 GarbageFlyAnimation 到受攻击方的 AnimationSystem。
   *
   * @private
   * @param {object} payload - 事件负载
   */
  _onBattleStartGarbageFly = (payload) => {
    payload.to.Animations.register(new GarbageFlyAnimation(payload));
  };

  /**
   * ## _onBattleFlushGarbage：处理垃圾行刷新事件
   *
   * 在消行动画 dispose 的最后阶段被调用， 将计算好的待处理垃圾行实际插入到对方棋盘。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起攻击的玩家 Game 实例
   */
  _onBattleFlushGarbage = (payload) => {
    this.battle.flushGarbage(payload.from);
  };

  /**
   * ## _onBattleUpdateWinner：处理胜者更新事件
   *
   * 当有玩家游戏结束（Game Over）时被调用，更新对战结果。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.loser - 失败的玩家 Game 实例
   */
  _onBattleUpdateWinner = (payload) => {
    this.battle.update(payload.loser);
  };

  /**
   * ## _onBattleSyncPause：处理暂停同步事件
   *
   * 当某玩家暂停游戏时被调用，将暂停状态同步给对方。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起暂停的玩家 Game 实例
   */
  _onBattleSyncPause = (payload) => {
    const opponent = this.battle.getOpponent(payload.from);
    opponent.pause(opponent);
  };

  /**
   * ## _onBattleSyncResume：处理恢复同步事件
   *
   * 当某玩家恢复游戏时被调用，将恢复状态同步给对方。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起恢复的玩家 Game 实例
   */
  _onBattleSyncResume = (payload) => {
    const opponent = this.battle.getOpponent(payload.from);
    opponent.resume(opponent);
  };

  /**
   * ## _onBattleReset：处理重置事件
   *
   * 用户按 Enter 重赛时触发。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.from - 发起重置的玩家 Game 实例
   */
  _onBattleReset = (payload) => {
    this.battle.reset(payload.from);
  };

  /**
   * ## _onBattlePlayerSurrender：处理玩家认输事件
   *
   * 当玩家在对战中按 ESC 认输时触发。
   *
   * @private
   * @param {object} payload - 事件负载
   * @param {object} payload.loser - 认输的玩家 Game 实例
   */
  _onBattlePlayerSurrender = (payload) => {
    this.battle.surrender(payload.loser);
  };
}

export default BattleRouter;
