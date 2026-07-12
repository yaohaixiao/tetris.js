/**
 * ============================================================
 *
 * # 生成对战记分牌 HTML 模板
 *
 * ============================================================
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
 * 记分牌 span 的 ID 格式为 {player}-{index}-tetris-battle-score：
 *
 * - P1：human-0-tetris-battle-score
 * - P2：human-1-tetris-battle-score
 *
 * @function getBattleScoreTemplate
 * @param {string} player - 玩家名称
 * @param {number} index - 玩家索引值（0 = 1P, 1 = 2P）
 * @returns {string} 记分牌 HTML 模板字符串
 */
const getBattleScoreTemplate = (player, index) => `
  <div class="tetris-battle-score">
    <h3 class="tetris-battle-player">${index + 1}P</h3>
    <span id="${player}-${index}-tetris-battle-score">0</span>
  </div>
`;

export default getBattleScoreTemplate;
