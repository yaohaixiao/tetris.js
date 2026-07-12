/**
 * ============================================================
 *
 * # 生成对战结束面板 HTML 模板
 *
 * ============================================================
 *
 * 生成对战模式专属的 DOM 结构，包含胜者展示面板和每位玩家的 fly canvas。 所有内容包裹在覆盖层容器中，默认隐藏，由 BattleUI
 * 控制显示/隐藏。
 *
 * ## 生成的 DOM 结构
 *
 * ```html
 * <section
 *   id="tetris-battle-overlay"
 *   class="tetris-battle-overlay tetris-hidden"
 * >
 *   <section
 *     id="tetris-battle-over"
 *     class="tetris-battle-over tetris-hidden"
 *   >
 *     <h2 class="tetris-battle-title">BATTLE OVER</h2>
 *     <div class="tetris-battle-winner">
 *       WINNER IS
 *       <span id="tetris-battle-winner" class="tetris-highlight"
 *         >HUMAN</span
 *       >
 *     </div>
 *     <footer class="tetris-battle-actions">
 *       <div class="tetris-battle-rematch">ENTER TO REMATCH</div>
 *     </footer>
 *   </section>
 *   <canvas
 *     id="human-0-tetris-battle-fly"
 *     class="tetris-battle-fly tetris-hidden"
 *   ></canvas>
 *   <canvas
 *     id="human-1-tetris-battle-fly"
 *     class="tetris-battle-fly tetris-hidden"
 *   ></canvas>
 * </section>
 * ```
 *
 * ## fly canvas 拆分原因
 *
 * 双方可能同时受到攻击，如果共用同一个 fly canvas， 两个 FlyAnimation 的 clearRect 会互相覆盖对方的粒子。
 * 为每位玩家生成独立的 fly canvas 解决了这个冲突。
 *
 * @function getBattleOverlayTemplate
 * @param {object} elements - 游戏界面各 DOM 节点的 ID 配置
 * @param {string[]} players - 玩家名称数组
 * @returns {string} 完整的 HTML 模板字符串
 */
const getBattleOverlayTemplate = (elements, players) => {
  const { Battle } = elements;

  // 收集所有将要插入覆盖层容器的子元素模板
  const templates = [
    // 胜者展示面板
    `
    <section id="${Battle.over}" class="tetris-battle-over tetris-hidden">
      <h2 class="tetris-battle-title">BATTLE OVER</h2>
      <div class="tetris-battle-winner">WINNER IS <span id="${Battle.winner}" class="tetris-highlight">HUMAN</span></div>
      <footer class="tetris-battle-actions">
        <div class="tetris-battle-rematch">ENTER TO REMATCH</div>
      </footer>
    </section>
  `,
  ];

  // 为每位玩家生成独立的 fly canvas
  for (const [index, player] of players.entries()) {
    templates.push(`
      <canvas id="${player}-${index}-${Battle.fly}" class="tetris-battle-fly tetris-hidden"></canvas>
    `);
  }

  // 将所有子元素模板包裹在覆盖层容器中
  return `
    <section id="${Battle.overlay}" class="tetris-battle-overlay tetris-hidden">
      ${templates.join('')}
    </section>
  `;
};

export default getBattleOverlayTemplate;
