/**
 * # 生成对战模式的结束面板的 HTML 模板
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
 *   <!-- 胜者展示面板 -->
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
 *   <!-- 每位玩家独立的 fly canvas（用于垃圾行粒子飞行动画） -->
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
 * ## 显示状态互斥
 *
 * - 胜者面板（`$over`）和 fly canvas（`$flies`）互斥显示
 * - 覆盖层容器（`$overlay`）是两者的父容器，只要任一子元素可见，覆盖层就可见
 * - 所有子元素都隐藏时，覆盖层才隐藏
 *
 * ## fly canvas 拆分原因
 *
 * 双方可能同时受到攻击，如果共用同一个 fly canvas， 两个 FlyAnimation 的 clearRect 会互相覆盖对方的粒子。
 * 为每位玩家生成独立的 fly canvas 解决了这个冲突。
 *
 * @function getBattleOverlayTemplate
 * @param {object} elements - 游戏界面各 DOM 节点的 ID 配置
 * @param {object} elements.Battle - 对战模式专属元素的 ID 配置
 * @param {string} elements.Battle.overlay - 覆盖层容器元素 ID
 * @param {string} elements.Battle.over - 胜者展示面板元素 ID
 * @param {string} elements.Battle.winner - 胜者名称显示元素 ID
 * @param {string} elements.Battle.fly - Fly canvas 元素 ID 后缀
 * @param {string[]} players - 玩家名称数组（如 ['human', 'human']）
 * @returns {string} 完整的 HTML 模板字符串
 */
const getBattleOverlayTemplate = (elements, players) => {
  // 从配置中解构出 Battle 相关的元素 ID
  const { Battle } = elements;

  /**
   * HTML 模板片段数组。
   *
   * 收集所有将要插入覆盖层容器的子元素模板。 使用数组收集而非直接拼接字符串，最后一次性 join， 减少字符串拼接的中间对象创建。
   */
  const templates = [
    /**
     * ======== 胜者展示面板 ========
     *
     * 整场对战结束时显示，包含：
     *
     * - 标题 "BATTLE OVER"
     * - 胜者名称（由 BattleUI 动态填充）
     * - 重赛提示 "ENTER TO REMATCH"
     *
     * 默认添加 tetris-hidden 类隐藏。
     */
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

  /**
   * ======== 为每位玩家生成独立的 fly canvas ========
   *
   * 遍历所有玩家，为每位玩家创建一个 fly canvas。
   *
   * Canvas ID 格式：`{player}-{index}-{fly}`
   * 例如：human-0-tetris-battle-fly、human-1-tetris-battle-fly
   *
   * 每个 fly canvas 默认添加 tetris-hidden 类隐藏， 仅在播放垃圾行飞行动画时由 BattleUI.show({ fly })
   * 显示。
   */
  for (const [index, player] of players.entries()) {
    templates.push(`
      <canvas id="${player}-${index}-${Battle.fly}" class="tetris-battle-fly tetris-hidden"></canvas>
    `);
  }

  /**
   * ======== 组装完整的覆盖层容器 ========
   *
   * 将所有子元素模板包裹在覆盖层容器中。 覆盖层容器默认添加 tetris-hidden 类隐藏， 由 BattleUI.show() 移除该类显示。
   *
   * 覆盖层 CSS（tetris-battle-overlay）：
   *
   * - Position: absolute; top: 0; left: 0;
   * - Width: 100%; height: 100%;
   * - 覆盖整个游戏区域
   */
  return `
    <section id="${Battle.overlay}" class="tetris-battle-overlay tetris-hidden">
      ${templates.join('')}
    </section>
  `;
};

export default getBattleOverlayTemplate;
