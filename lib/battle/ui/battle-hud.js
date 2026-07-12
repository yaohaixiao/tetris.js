import Base from '@/lib/core/index.js';

/**
 * ============================================================
 *
 * # 模块：BattleHUD 对战 HUD 控制器
 *
 * ============================================================
 *
 * 负责管理和更新对战模式下的抬头显示信息（HUD）， 主要处理双方玩家的分数显示。
 *
 * ## 核心职责
 *
 * | 职责         | 说明                                    |
 * | :----------- | :-------------------------------------- |
 * | DOM 元素管理 | 在初始化时查找并缓存双方的分数 DOM 元素 |
 * | 分数更新     | 根据游戏状态更新 DOM 中显示的分数       |
 * | 元素查找     | 提供统一的元素获取接口                  |
 *
 * ## DOM 结构约定
 *
 * 分数元素的 ID 遵循固定命名规则： {PlayerName}-{PlayerIndex}-tetris-battle-score
 *
 * 例如：
 *
 * - Human-0-tetris-battle-score（P1）
 * - Human-1-tetris-battle-score（P2）
 *
 * @augments Base
 * @class BattleHUD
 */
class BattleHUD extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置选项
   * @param {object[]} options.games - Game 实例数组
   * @param {object} options.store - BattleStore 实例
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## initialize：初始化 DOM 元素缓存
   *
   * 遍历所有 Game 实例，根据命名规则查找并缓存每个玩家的分数 DOM 元素。 避免每次更新分数时都重新查询 DOM。
   *
   * @returns {void}
   */
  initialize() {
    const { games } = this;

    this.elements = {};

    for (const game of games) {
      const { Player } = game;

      // 生成玩家唯一标识 ID：{name}-{index}
      const id = `${Player.name}-${Player.index}`;

      // 根据命名规则查找分数 DOM 元素
      const $score = document.querySelector(`#${id}-tetris-battle-score`);

      // 缓存查找结果（元素不存在时为 null）
      this.elements[id] = $score || null;
    }
  }

  /**
   * ## getEl：获取玩家对应的 DOM 元素
   *
   * 根据玩家唯一标识从缓存中获取分数 DOM 元素引用。
   *
   * @param {string} id - 玩家唯一标识，格式为 {name}-{index}
   * @returns {HTMLElement | null} 对应的 DOM 元素，不存在时返回 null
   */
  getEl(id) {
    return this.elements[id];
  }

  /**
   * ## updateScores：更新双方分数显示
   *
   * 在单局游戏结束时被调用，更新胜者和败者的分数到对应的 DOM 元素。
   *
   * @param {object} winner - 胜者 Game 实例
   * @param {object} loser - 败者 Game 实例
   * @returns {void}
   */
  updateScores(winner, loser) {
    const { store } = this;

    // 胜者分数
    const winnerPlayer = winner.Player;
    const winnerId = `${winnerPlayer.name}-${winnerPlayer.index}`;
    const $winner = this.getEl(winnerId);
    const winnerScore = store.getScore(winnerId);

    // 败者分数
    const loserPlayer = loser.Player;
    const loserId = `${loserPlayer.name}-${loserPlayer.index}`;
    const $loser = this.getEl(loserId);
    const loserScore = store.getScore(loserId);

    // 更新 DOM
    if ($winner) {
      $winner.textContent = winnerScore;
    }

    if ($loser) {
      $loser.textContent = loserScore;
    }
  }
}

export default BattleHUD;
