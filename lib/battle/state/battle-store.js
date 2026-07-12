import Base from '@/lib/core/index.js';
import BattleState from '@/lib/battle/state/battle-state.js';

/**
 * ============================================================
 *
 * # 模块：BattleStore 对战状态管理器
 *
 * ============================================================
 *
 * 负责管理对战模式下的所有状态数据， 包括运行状态、胜负结果、双方分数和待处理垃圾行数。
 *
 * ## 核心职责
 *
 * | 职责         | 说明                                        |
 * | :----------- | :------------------------------------------ |
 * | 运行状态管理 | 控制对战的开始/结束状态（running / winner） |
 * | 分数管理     | 记录和更新双方玩家的胜场数                  |
 * | 垃圾行管理   | 管理待处理垃圾行的累加、抵消、查询和清空    |
 * | 状态重置     | 提供 reset() 方法恢复初始状态               |
 * | 玩家标识     | 提供 getPlayerId() 统一生成 playerId        |
 *
 * ## 垃圾行管理流程
 *
 * 玩家A消行 → 计算攻击力(lines) → offsetGarbage(玩家A, attackLines) ↓ 如果 attackLines >
 * pendingGarbage[玩家A]： → 完全抵消 pending，剩余攻击力 = attackLines - pending → 调用
 * addGarbage(玩家B, 剩余攻击力) 发送给对手 如果 attackLines <= pendingGarbage[玩家A]： →
 * 只抵消对应数量的 pending，无垃圾行发送给对手
 *
 * @augments Base
 * @class BattleStore
 */
class BattleStore extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置选项
   * @param {object[]} options.games - Game 实例数组
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## initialize：初始化状态
   *
   * 深拷贝 BattleState 模板，为每个玩家初始化分数和垃圾行为 0。
   *
   * @returns {void}
   */
  initialize() {
    this._initialize();
  }

  /**
   * ## _initialize：内部初始化实现
   *
   * @private
   * @returns {void}
   */
  _initialize() {
    const { games } = this;

    // 深拷贝初始状态模板
    this.state = structuredClone(BattleState);

    const { scores, pendingGarbage } = this.state;

    // 为每个玩家初始化分数和垃圾行为 0
    for (const game of games) {
      const playerId = this.getPlayerId(game);
      scores[playerId] = 0;
      pendingGarbage[playerId] = 0;
    }
  }

  /**
   * ## setRunning：设置对战运行状态
   *
   * @param {boolean} running - True 表示对战进行中
   */
  setRunning(running) {
    this.state.running = running;
  }

  /**
   * ## isRunning：获取对战运行状态
   *
   * @returns {boolean} True 表示对战进行中
   */
  isRunning() {
    return this.state.running;
  }

  /**
   * ## setWinner：设置单局胜者
   *
   * @param {object} winner - 胜者的 Game 实例
   */
  setWinner(winner) {
    this.state.winner = winner;
  }

  /**
   * ## getWinner：获取单局胜者
   *
   * @returns {object | null} 胜者的 Game 实例，未决出时返回 null
   */
  getWinner() {
    return this.state.winner;
  }

  /**
   * ## getScore：获取指定玩家的分数
   *
   * @param {string} id - 玩家唯一标识
   * @returns {number} 玩家的胜场数
   */
  getScore(id) {
    return this.state.scores[id];
  }

  /**
   * ## setScore：设置指定玩家的分数
   *
   * @param {string} id - 玩家唯一标识
   * @param {number} score - 要设置的分数值
   * @returns {void}
   */
  setScore(id, score) {
    this.state.scores[id] = score;
  }

  /**
   * ## getPlayerId：获取玩家唯一标识
   *
   * ID 格式：{Player.name}-{Player.index}
   *
   * @param {object} game - Game 实例
   * @returns {string} 玩家唯一标识字符串
   */
  getPlayerId(game) {
    const { Player } = game;
    return `${Player.name}-${Player.index}`;
  }

  /**
   * ## getVictoryScore：获取对战目标分数（按难度）
   *
   * | 难度   | 默认分数 | 预计对局时间 |
   * | :----- | :------- | :----------- |
   * | easy   | 5        | ~1-2 分钟    |
   * | normal | 8        | ~2-3 分钟    |
   * | hard   | 12       | ~3-5 分钟    |
   * | expert | 15       | ~5+ 分钟     |
   *
   * @param {string} [difficulty='easy'] - 难度等级名称. Default is `'easy'`
   * @returns {number} 该难度对应的目标分数
   */
  getVictoryScore(difficulty = 'easy') {
    return this.state.VictoryScore[difficulty];
  }

  /**
   * ## setVictoryScore：设置对战目标分数（按难度）
   *
   * @param {string} difficulty - 难度等级名称
   * @param {number} score - 目标分数
   * @returns {void}
   */
  setVictoryScore(difficulty, score) {
    this.state.VictoryScore[difficulty] = score;
  }

  /**
   * ## updateScores：更新双方胜场数
   *
   * 在一局对战结束后调用，给胜者增加 1 个胜场。
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
   * ## addGarbage：累加待处理垃圾行
   *
   * 当玩家受到攻击时，将攻击产生的垃圾行累加到该玩家的 pendingGarbage 中。
   *
   * @param {object} game - 受到攻击的玩家 Game 实例
   * @param {number} amount - 要添加的垃圾行数量
   */
  addGarbage(game, amount) {
    const { pendingGarbage } = this.state;
    const playerId = this.getPlayerId(game);
    pendingGarbage[playerId] = (pendingGarbage[playerId] || 0) + amount;
  }

  /**
   * ## offsetGarbage：用消行攻击抵消待处理垃圾行
   *
   * 当玩家消行时，用产生的攻击力抵消自己累积的待处理垃圾行。
   *
   * @param {object} game - 消行的玩家 Game 实例
   * @param {number} attackLines - 本次消行产生的攻击力
   * @returns {number} 抵消后剩余的攻击力
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
   * ## getPendingGarbage：获取待处理垃圾行数
   *
   * @param {object} game - 要查询的玩家 Game 实例
   * @returns {number} 待处理的垃圾行数量
   */
  getPendingGarbage(game) {
    const playerId = this.getPlayerId(game);
    return this.state.pendingGarbage[playerId] || 0;
  }

  /**
   * ## clearGarbage：清空待处理垃圾行
   *
   * @param {object} game - 要清空垃圾行的玩家 Game 实例
   */
  clearGarbage(game) {
    const playerId = this.getPlayerId(game);
    this.state.pendingGarbage[playerId] = 0;
  }

  /** ## increaseRound：递增回合编号 */
  increaseRound() {
    this.state.roundId += 1;
  }

  /**
   * ## getRoundId：获取当前回合编号
   *
   * @returns {number} 当前回合的唯一标识编号
   */
  getRoundId() {
    return this.state.roundId;
  }

  /** ## reset：重置状态 */
  reset() {
    this._initialize();
  }
}

export default BattleStore;
