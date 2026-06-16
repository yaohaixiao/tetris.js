/**
 * # 生成游戏对战模式的分数面板的 HTML 模板
 *
 * 为每位玩家生成一个实时记分牌，显示玩家编号（1P/2P）和当前胜场数。 由 BattleHUD.updateScores() 动态更新 span
 * 中的数字。
 *
 * ## 生成的 DOM 结构
 *
 * ```html
 * <div class="tetris-battle-score">
 *   <h3 class="tetris-battle-player">1P</h3>
 *   <span id="human-0-tetris-battle-score">0</span>
 * </div>
 * ```
 *
 * ## 元素 ID 规则
 *
 * 记分牌 span 的 ID 格式为 `{player}-{index}-tetris-battle-score`， 例如：
 *
 * - P1：`human-0-tetris-battle-score`
 * - P2：`human-1-tetris-battle-score`
 *
 * BattleHUD 通过此 ID 选择对应元素并更新其 textContent。
 *
 * ## CSS 定位
 *
 * 记分牌使用绝对定位，位于双方棋盘之间的中央位置：
 *
 * - P1 记分牌：向左偏移 6.5vw
 * - P2 记分牌：向右偏移 0.5vw
 * - Z-index: 2，位于棋盘之上
 *
 * @example
 *   getBattleScoreTemplate('human', 0);
 *   // → <div class="tetris-battle-score">...1P...</div>
 *
 *   getBattleScoreTemplate('ai', 1);
 *   // → <div class="tetris-battle-score">...2P...</div>
 *
 * @function getBattleScoreTemplate
 * @param {string} player - 玩家名称（如 "human"）
 * @param {number} index - 玩家索引值（0 = 1P, 1 = 2P）
 * @returns {string} 记分牌 HTML 模板字符串
 */
const getBattleScoreTemplate = (player, index) => `
  <div class="tetris-battle-score">
    <h3 class="tetris-battle-player">${index + 1}P</h3>
    <span id="${player}-${index}-tetris-battle-score" >0</span>
  </div>
`;

export default getBattleScoreTemplate;
