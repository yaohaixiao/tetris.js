/**
 * # 生成对战模式的结束面板的 HTML 模板
 *
 * @function getBattleOverlayTemplate
 * @param {object} elements - 游戏界面各 DOM 节点的配置信息
 * @param {object[]} players - 游戏玩家信息
 * @returns {string} - 返回 HTML 模板
 */
const getBattleOverlayTemplate = (elements, players) => {
  const { Battle } = elements;
  const templates = [`
    <section id="${Battle.over}" class="tetris-battle-over tetris-hidden">
      <h2 class="tetris-battle-title">BATTLE OVER</h2>
      <div class="tetris-battle-winner">WINNER IS <span id="${Battle.winner}" class="tetris-highlight">HUMAN</span></div>
      <footer class="tetris-battle-actions">
        <div class="tetris-battle-rematch">ENTER TO REMATCH</div>
      </footer>
    </section>
  `];

  for(const [index, player] of players.entries()){
    templates.push(`
      <canvas id="${player}-${index}-${Battle.fly}" class="tetris-battle-fly tetris-hidden"></canvas>
    `);
  }

  return `
    <section id="${Battle.overlay}" class="tetris-battle-overlay tetris-hidden">
      ${templates.join('')}
    </section>
  `;
};

export default getBattleOverlayTemplate;
