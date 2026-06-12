/**
 * # 游戏界面绘制函数
 *
 * 根据配置动态生成所有 DOM 元素，包括游戏棋盘、HUD、控制器按钮等。 这是游戏初始化阶段的一次性操作，将所有 HTML 模板注入到容器中。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                               |
 * | ---------------- | -------------------------------------------------- |
 * | **DOM 生成**     | 根据 Players 数量动态生成对应数量的游戏界面        |
 * | **模式适配**     | single 模式生成 1 个界面，versus 模式生成 2 个     |
 * | **对战 UI**      | versus 模式下额外生成对战记分牌和结果覆盖层        |
 * | **元素 ID 命名** | 使用 `{PlayerName}-{PlayerIndex}-{ElementId}` 格式 |
 *
 * ## 界面结构
 *
 *     #tetris-container
 *     ├── [versus 模式] #tetris-battle-overlay（对战结果覆盖层）
 *     ├── #human-0-tetris-player（P1 游戏界面）
 *     │   ├── tetris-screen
 *     │   │   ├── tetris-screen-main → canvas#human-0-tetris-game-board
 *     │   │   └── tetris-screen-aside
 *     │   │       ├── next → canvas#human-0-tetris-next-piece
 *     │   │       ├── controller → span#human-0-tetris-controller
 *     │   │       ├── data（SCORE/LINE/LEVEL/COMBO/HI-SCORE）
 *     │   │       └── hold → canvas#human-0-tetri-hold-piece
 *     │   └── tetris-controls（GAME BOY 布局按钮）
 *     │       ├── BACK / HOLD / START
 *     │       └── D-PAD + ABXY 按钮
 *     ├── [versus 模式] .tetris-battle-score（1P 记分牌）
 *     ├── #human-1-tetris-player（P2 游戏界面，结构同上）
 *     └── [versus 模式] .tetris-battle-score（2P 记分牌）
 *
 * ## 元素 ID 命名规则
 *
 * 所有交互元素的 ID 遵循固定格式：
 *
 *     {PlayerName}-{PlayerIndex}-{ElementId}
 *
 * 以配置 `Players: ['human', 'human']` 为例：
 *
 * | 元素       | P1 ID                       | P2 ID                       |
 * | ---------- | --------------------------- | --------------------------- |
 * | 棋盘       | human-0-tetris-game-board   | human-1-tetris-game-board   |
 * | 预览方块   | human-0-tetris-next-piece   | human-1-tetris-next-piece   |
 * | 缓存方块   | human-0-tetri-hold-piece    | human-1-tetri-hold-piece    |
 * | 分数       | human-0-tetris-score        | human-1-tetris-score        |
 * | 行数       | human-0-tetris-lines        | human-1-tetris-lines        |
 * | 等级       | human-0-tetris-level        | human-1-tetris-level        |
 * | 连击       | human-0-tetris-combo        | human-1-tetris-combo        |
 * | 最高分     | human-0-tetris-high-score   | human-1-tetris-high-score   |
 * | 控制者     | human-0-tetris-controller   | human-1-tetris-controller   |
 * | 对战记分   | human-0-tetris-battle-score | human-1-tetris-battle-score |
 * | BACK 按钮  | human-0-tetris-btn-back     | human-1-tetris-btn-back     |
 * | HOLD 按钮  | human-0-tetris-btn-hold     | human-1-tetris-btn-hold     |
 * | START 按钮 | human-0-tetris-btn-start    | human-1-tetris-btn-start    |
 * | D-PAD 上   | human-0-tetris-dpad-up      | human-1-tetris-dpad-up      |
 * | D-PAD 下   | human-0-tetris-dpad-down    | human-1-tetris-dpad-down    |
 * | D-PAD 左   | human-0-tetris-dpad-left    | human-1-tetris-dpad-left    |
 * | D-PAD 右   | human-0-tetris-dpad-right   | human-1-tetris-dpad-right   |
 * | A 按钮     | human-0-tetris-btn-a        | human-1-tetris-btn-a        |
 * | B 按钮     | human-0-tetris-btn-b        | human-1-tetris-btn-b        |
 * | X 按钮     | human-0-tetris-btn-x        | human-1-tetris-btn-x        |
 * | Y 按钮     | human-0-tetris-btn-y        | human-1-tetris-btn-y        |
 *
 * ## 对战模式专属元素
 *
 * ### 对战结果覆盖层
 *
 * 整场对战结束后由 BattleUI 控制显示/隐藏：
 *
 * ```html
 * <section
 *   id="tetris-battle-overlay"
 *   class="tetris-battle-overlay tetris-hidden"
 * >
 *   <h2 class="tetris-battle-title">BATTLE OVER</h2>
 *   <div class="tetris-battle-winner">
 *     WINNER IS
 *     <span id="tetris-battle-winner" class="tetris-highlight">HUMAN</span>
 *   </div>
 *   <footer class="tetris-battle-actions">
 *     <div id="tetris-battle-rematch">ENTER TO REMATCH</div>
 *   </footer>
 * </section>
 * ```
 *
 * ### 对战记分牌
 *
 * 实时显示双方胜场数，由 BattleHUD 更新：
 *
 * ```html
 * <div class="tetris-battle-score">
 *   <h3 class="tetris-battle-player">1P</h3>
 *   <span id="human-0-tetris-battle-score">0</span>
 * </div>
 * ```
 *
 * ## 典型使用场景
 *
 * ```javascript
 * import Configuration from '@/lib/configuration.js';
 * import drawInterface from '@/lib/utils/draw-interface.js';
 *
 * // 根据全局配置绘制界面
 * drawInterface(Configuration);
 * // → 在 #tetris-container 中生成完整的游戏界面 DOM
 * ```
 *
 * @function drawInterface
 * @param {object} config - 界面配置对象（通常传入 Configuration）
 * @returns {void}
 */
const drawInterface = (config) => {
  // 从配置中解构出模式、玩家列表和元素 ID 集合
  const { Elements, Mode, Players } = config;
  const { Canvas, Hud, Controls, Container } = Elements;

  /**
   * HTML 模板数组
   *
   * 收集所有将要插入 DOM 的 HTML 字符串片段。 使用数组收集而非直接拼接字符串，最后一次性 join + innerHTML， 减少 DOM
   * 操作次数，提升性能。
   */
  const templates = [];

  /**
   * 玩家数组副本
   *
   * 使用扩展运算符创建浅拷贝，避免后续 pop() 操作修改原始 Players 数组。 与 Engine.initialize
   * 中的处理逻辑对应：single 模式保留第一个玩家。
   */
  const finalPlayers = [...Players];

  // 获取根容器 DOM 元素
  const $container = document.querySelector(`#${Container}`);

  // ======== 模式处理 ========

  if (Mode === 'single') {
    /**
     * 单人模式： 移除最后一个玩家，只保留一个 Game 实例。 例如 Players = ['Player1', 'Player2'] →
     * finalPlayers = ['Player1'] 与 Engine.initialize 中 `if (Mode === 'single')
     * { finalPlayers.pop(); }` 逻辑对应。
     */
    finalPlayers.pop();
  } else {
    /**
     * 对战模式： 在界面最前面插入"对战结束"覆盖层。
     *
     * 覆盖层默认隐藏（tetris-hidden 类设置 display: none）， 整场对战后由 BattleUI.show() 移除
     * tetris-hidden 类显示， BattleUI.hide() 重新添加 tetris-hidden 类隐藏。
     *
     * 包含元素：
     *
     * - #tetris-battle-overlay：覆盖层容器
     * - .tetris-battle-title：标题 "BATTLE OVER"
     * - #tetris-battle-winner：胜者名称（由 BattleUI 动态填充）
     * - #tetris-battle-rematch：重赛提示 "ENTER TO REMATCH"
     */
    templates.push(`
      <section id="tetris-battle-overlay" class="tetris-battle-overlay tetris-hidden">
        <h2 class="tetris-battle-title">BATTLE OVER</h2>
        <div class="tetris-battle-winner">WINNER IS <span id="tetris-battle-winner" class="tetris-highlight">HUMAN</span></div>
        <footer class="tetris-battle-actions">
          <div id="tetris-battle-rematch">ENTER TO REMATCH</div>
        </footer>
      </section>
    `);
  }

  // ======== 遍历玩家生成游戏界面 ========

  /**
   * 为每个玩家生成独立的游戏界面 DOM。
   *
   * 每个玩家界面包含：
   *
   * 1. 主屏幕区（tetris-screen）
   *
   *    - 棋盘 Canvas（tetris-screen-main）
   *    - 侧边栏（tetris-screen-aside）
   *
   *         - 预览方块（NEXT）
   *         - 控制者标识（Human/AI）
   *         - 游戏数据（SCORE/LINE/LEVEL/COMBO/HI-SCORE）
   *         - 缓存方块（HOLD）
   * 2. 控制按钮区（tetris-controls）
   *
   *    - 系统按钮（BACK/HOLD/START）
   *    - D-PAD 方向键（↑↓←→）
   *    - ABXY 动作按钮
   *
   * 所有元素 ID 使用 `{player}-{index}-{elementId}` 格式， 确保多玩家场景下元素 ID 唯一。
   */
  for (const [index, player] of finalPlayers.entries()) {
    const html = `
      <div id="${player}-${index}-tetris-player" class="tetris-player">
        <section class="tetris-screen">
          <section id="${player}-${index}-tetris-screen-main" class="tetris-screen-main">
            <canvas id="${player}-${index}-${Canvas.board}" data-mode="main-menu"></canvas>
          </section>
          <aside class="tetris-screen-aside">
            <section class="tetris-panel next">
              <h3 class="tetris-next-title">NEXT</h3>
              <canvas id="${player}-${index}-${Canvas.next}" class="tetris-next-piece"></canvas>
            </section>
            <section class="tetris-panel controller">
              <p class="tetris-panel-text tetris-highlight"><span id="${player}-${index}-${Hud.controller}">Human</span></p>
            </section>
            <section class="tetris-panel data">
              <p class="tetris-panel-text">SCORE:<br><span id="${player}-${index}-${Hud.score}">00000</span></p>
              <p class="tetris-panel-text">LINE:<br><span id="${player}-${index}-${Hud.lines}">00</span></p>
              <p class="tetris-panel-text">LEVEL:<br><span id="${player}-${index}-${Hud.level}">01</span></p>
              <p class="tetris-panel-text">COMBO:<br><span id="${player}-${index}-${Hud.combo}">00</span></p>
              <p class="tetris-panel-text tetris-highlight">HI-SCORE:<br><span id="${player}-${index}-${Hud.highScore}">00000</span></p>
            </section>
            <section class="tetris-panel hold">
              <h3 class="tetris-hold-title">HOLD</h3>
              <canvas id="${player}-${index}-${Canvas.hold}" class="tetris-hold-piece"></canvas>
            </section>
          </aside>
        </section>
        <footer class="tetris-controls">
          <!-- START / SELECT 系统按钮 -->
          <section class="tetris-system-controls">
            <div id="${player}-${index}-${Controls.back}" data-key="back" class="tetris-system-button tetris-btn-back">BACK</div>
            <div id="${player}-${index}-${Controls.hold}" data-key="hold" class="tetris-system-button tetris-btn-hold">HOLD</div>
            <div id="${player}-${index}-${Controls.start}" data-key="start" class="tetris-system-button tetris-btn-start">START</div>
          </section>
          <section class="tetris-main-controls">
            <!-- D-PAD 方向键（GAME BOY 经典十字键布局） -->
            <div class="tetris-dpad">
              <div id="${player}-${index}-${Controls.up}" data-key="dpad_up" class="tetris-dpad-up">↑</div>
              <div class="tetris-dpad-mid">
                <div id="${player}-${index}-${Controls.left}" data-key="dpad_left" class="tetris-dpad-left">←</div>
                <div class="tetris-dpad-center"></div>
                <div id="${player}-${index}-${Controls.right}" data-key="dpad_right" class="tetris-dpad-right">→</div>
              </div>
              <div id="${player}-${index}-${Controls.down}" data-key="dpad_down" class="tetris-dpad-down">↓</div>
            </div>
            <!-- ABXY 动作按钮（GAME BOY 经典菱形布局） -->
            <div class="tetris-buttons">
              <div id="${player}-${index}-${Controls.x}" data-key="x" class="tetris-action-button tetris-button-x">X</div>
              <div id="${player}-${index}-${Controls.y}" data-key="y" class="tetris-action-button tetris-button-y">Y</div>
              <div id="${player}-${index}-${Controls.b}" data-key="b" class="tetris-action-button tetris-button-b">B</div>
              <div id="${player}-${index}-${Controls.a}" data-key="a" class="tetris-action-button tetris-button-a">A</div>
            </div>
          </section>
        </footer>
      </div>
    `;

    // 将当前玩家的界面模板加入数组
    templates.push(html);

    /**
     * 对战模式记分牌
     *
     * 在每个玩家界面下方生成记分牌，显示双方胜场数。 由 BattleHUD.updateScores() 动态更新 span 中的数字。
     *
     * DOM 结构：<div class="tetris-battle-score">  <h3 class="tetris-battle-player">1P / 2P</h3>
     *   <span id="human-0-tetris-battle-score">0</span>
     * </div>
     *
     * Index + 1 用于显示 1P / 2P 标识。
     */
    if (Mode === 'versus') {
      templates.push(`
        <div class="tetris-battle-score">
          <h3 class="tetris-battle-player">${index + 1}P</h3>
          <span id="${player}-${index}-tetris-battle-score" >0</span>
        </div>
      `);
    }
  }

  /**
   * 一次性将所有 HTML 模板注入容器
   *
   * 使用 innerHTML 直接替换容器内容。 这是游戏初始化时的一次性操作，不需要考虑增量更新。 所有后续的 UI 更新都通过 DOM
   * 选择器定位具体元素进行。
   */
  $container.innerHTML = templates.join('');
};

export default drawInterface;
