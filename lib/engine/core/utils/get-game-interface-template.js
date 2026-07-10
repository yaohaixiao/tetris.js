/*
 * ============================================================
 * # 模块：getGameInterfaceTemplate 游戏界面 HTML 模板生成器
 * ============================================================
 *
 * ## 功能描述
 *
 * 为每位玩家生成完整的游戏界面 HTML 模板，包含棋盘 Canvas、HUD 数据面板、
 * 预览/缓存方块 Canvas 和 GAME BOY 风格的触屏控制按钮。
 *
 * ## 生成的 DOM 结构
 *
 * ```
 * #human-0-tetris-player (.tetris-player)
 * ├── .tetris-screen
 * │   ├── .tetris-screen-main
 * │   │   └── canvas#human-0-tetris-game-board
 * │   └── .tetris-screen-aside
 * │       ├── .next
 * │       │   ├── h3 "NEXT"
 * │       │   └── canvas#human-0-tetris-next-piece
 * │       ├── .controller
 * │       │   └── span#human-0-tetris-controller
 * │       ├── .timer
 * │       │   └── p#human-0-tetris-timer
 * │       ├── .data
 * │       │   ├── SCORE → span#human-0-tetris-score
 * │       │   ├── LINE → span#human-0-tetris-lines
 * │       │   ├── LEVEL → span#human-0-tetris-level
 * │       │   ├── COMBO → span#human-0-tetris-combo
 * │       │   └── HI-SCORE → span#human-0-tetris-high-score
 * │       └── .hold
 * │           ├── h3 "HOLD"
 * │           └── canvas#human-0-tetri-hold-piece
 * └── .tetris-controls
 *     ├── .tetris-system-controls
 *     │   ├── BACK 按钮
 *     │   ├── HOLD 按钮
 *     │   └── START 按钮
 *     └── .tetris-main-controls
 *         ├── .tetris-dpad（十字方向键）
 *         │   ├── ↑（上）
 *         │   ├── ←（左）
 *         │   ├── →（右）
 *         │   └── ↓（下）
 *         └── .tetris-buttons（ABXY 动作按钮）
 *             ├── X 按钮
 *             ├── Y 按钮
 *             ├── B 按钮
 *             └── A 按钮
 * ```
 *
 * ## 元素 ID 命名规则
 *
 * 所有交互元素的 ID 遵循固定格式：
 *
 * ```
 * {player}-{index}-{elementId}
 * ```
 *
 * ### 以 `player = 'human'`, `index = 0` 为例
 *
 * | 元素 | 生成的 ID |
 * | :--- | :--- |
 * | 棋盘 | human-0-tetris-game-board |
 * | 预览方块 | human-0-tetris-next-piece |
 * | 缓存方块 | human-0-tetri-hold-piece |
 * | 分数 | human-0-tetris-score |
 * | 行数 | human-0-tetris-lines |
 * | 等级 | human-0-tetris-level |
 * | 连击 | human-0-tetris-combo |
 * | 最高分 | human-0-tetris-high-score |
 * | 计时器 | human-0-tetris-timer |
 * | 控制者 | human-0-tetris-controller |
 * | BACK 按钮 | human-0-tetris-btn-back |
 * | HOLD 按钮 | human-0-tetris-btn-hold |
 * | START 按钮 | human-0-tetris-btn-start |
 * | D-PAD 上 | human-0-tetris-dpad-up |
 * | D-PAD 下 | human-0-tetris-dpad-down |
 * | D-PAD 左 | human-0-tetris-dpad-left |
 * | D-PAD 右 | human-0-tetris-dpad-right |
 * | A 按钮 | human-0-tetris-btn-a |
 * | B 按钮 | human-0-tetris-btn-b |
 * | X 按钮 | human-0-tetris-btn-x |
 * | Y 按钮 | human-0-tetris-btn-y |
 *
 * ## 界面布局
 *
 * 采用经典的俄罗斯方块布局：
 *
 * ### 左侧：主棋盘（tetris-screen-main）
 *
 * 游戏主区域，包含棋盘 Canvas
 *
 * ### 右侧：信息面板（tetris-screen-aside）
 *
 * - NEXT：下一个方块预览
 * - 控制者标识：显示 Human 或 AI
 * - 计时器：显示游戏已耗时
 * - 游戏数据：分数、行数、等级、连击、最高分
 * - HOLD：缓存方块
 *
 * ### 底部：触屏控制按钮（GAME BOY 风格）
 *
 * - 系统按钮：BACK、HOLD、START
 * - D-PAD：十字方向键
 * - ABXY：动作按钮（菱形布局）
 *
 * ## 使用示例
 *
 * ```javascript
 * // 生成 1P（人类玩家）的游戏界面
 * const p1Html = getGameInterfaceTemplate(Elements, 'human', 0);
 *
 * // 生成 2P（AI 玩家）的游戏界面
 * const p2Html = getGameInterfaceTemplate(Elements, 'ai', 1);
 * ```
 *
 * @function getGameInterfaceTemplate
 * @param {object} elements - 游戏界面各 DOM 节点的 ID 配置
 * @param {object} elements.Canvas - Canvas 元素 ID 配置
 * @param {string} elements.Canvas.board - 主棋盘 canvas ID
 * @param {string} elements.Canvas.next - 预览方块 canvas ID
 * @param {string} elements.Canvas.hold - 缓存方块 canvas ID
 * @param {object} elements.Hud - HUD 数据显示元素 ID 配置
 * @param {string} elements.Hud.controller - 控制者标识 span ID
 * @param {string} elements.Hud.score - 分数 span ID
 * @param {string} elements.Hud.lines - 行数 span ID
 * @param {string} elements.Hud.level - 等级 span ID
 * @param {string} elements.Hud.combo - 连击 span ID
 * @param {string} elements.Hud.highScore - 最高分 span ID
 * @param {string} elements.Hud.timer - 游戏时间 p ID
 * @param {object} elements.Controls - 控制按钮元素 ID 配置
 * @param {string} elements.Controls.back - BACK 按钮 ID
 * @param {string} elements.Controls.hold - HOLD 按钮 ID
 * @param {string} elements.Controls.start - START 按钮 ID
 * @param {string} elements.Controls.up - D-PAD 上按钮 ID
 * @param {string} elements.Controls.down - D-PAD 下按钮 ID
 * @param {string} elements.Controls.left - D-PAD 左按钮 ID
 * @param {string} elements.Controls.right - D-PAD 右按钮 ID
 * @param {string} elements.Controls.a - A 按钮 ID
 * @param {string} elements.Controls.b - B 按钮 ID
 * @param {string} elements.Controls.x - X 按钮 ID
 * @param {string} elements.Controls.y - Y 按钮 ID
 * @param {string} player - 玩家名称（如 "human"、"ai"）
 * @param {number} index - 玩家索引值（0 = 1P, 1 = 2P）
 * @returns {string} 完整的游戏界面 HTML 模板字符串
 */
const getGameInterfaceTemplate = (elements, player, index) => {
  // 从配置中解构 Canvas、Hud、Controls 的元素 ID
  const { Canvas, Hud, Controls } = elements;

  return `
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
            <p class="tetris-panel-text tetris-highlight"><span id="${player}-${index}-${Hud.controller}">${player}</span></p>
          </section>
          <section class="tetris-panel timer">
            <p id="${player}-${index}-${Hud.timer}" class="tetris-panel-text elapsed-timer tetris-highlight">00:00:00</p>
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
};

export default getGameInterfaceTemplate;
