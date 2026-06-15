/**
 * # 生成游戏对战模式的游戏界面的 HTML 模板
 *
 * @function getGameInterfaceTemplate
 * @param {object} elements - 游戏界面各 DOM 节点的配置信息
 * @param {string} player - 玩家名称
 * @param {number} index - 玩家索引值
 * @returns {string} - 返回 HTML 模板
 */
const getGameInterfaceTemplate = (elements, player, index) => {
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
};

export default getGameInterfaceTemplate;
