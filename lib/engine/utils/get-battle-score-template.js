/**
 * # 生成游戏对战模式的分数面板的 HTML 模板
 *
 * @function getBattleScoreTemplate
 * @param {string} player - 玩家名称
 * @param {number} index - 玩家索引值
 * @returns {string} - 返回 HTML 模板
 */
const getBattleScoreTemplate = (player, index) => `
  <div class="tetris-battle-score">
    <h3 class="tetris-battle-player">${index + 1}P</h3>
    <span id="${player}-${index}-tetris-battle-score" >0</span>
  </div>
`;

export default getBattleScoreTemplate;
