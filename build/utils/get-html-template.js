import Configuration from '../../lib/configuration.js';

const {
  Main,
  Hud,
  Controls
} = Configuration.Elements;

const getHtmlTemplate = (args) => {
  const minify = args.action === 'minify';
  const stylePath = minify ? './css/tetris.min.css' : './css/tetris.css';
  const scriptPath = minify ? './js/tetris.min.js' : './js/tetris.js';

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preload" href="${stylePath}" as="style">
      <link rel="preload" href="${scriptPath}" as="script">
      <link rel="preload" href="./img/bg.jpg" as="image">
      <link rel="preload" href="./favicon.ico" as="image">
      <link rel="prefetch" href="./font/latin.woff2" type="font/woff2" as="font">
      <title>俄罗斯方块</title>
      <link rel="icon" href="./favicon.ico" type="image/x-icon">
      <link href="${stylePath}" rel="stylesheet">
    </head>
    <body>
      <div class="tetris-container">
        <section class="tetris-screen">
          <main id="tetris-screen-main" class="tetris-screen-main">
            <canvas id="${Main.board}" data-mode="main-menu"></canvas>
          </main>
          <aside class="tetris-screen-aside">
            <section class="tetris-panel next">
              <h3 class="tetris-next-title">NEXT</h3>
              <canvas id="${Main.next}" class="tetris-next-piece"></canvas>
            </section>
            <section class="tetris-panel controller">
              <p class="tetris-panel-text tetris-highlight"><span id="${Hud.controller}">Human</span></p>
            </section>
            <section class="tetris-panel data">
              <p class="tetris-panel-text">SCORE:<br><span id="${Hud.score}">00000</span></p>
              <p class="tetris-panel-text">LINE:<br><span id="${Hud.lines}">00</span></p>
              <p class="tetris-panel-text">LEVEL:<br><span id="${Hud.level}">01</span></p>
              <p class="tetris-panel-text tetris-highlight">HI-SCORE:<br><span id="${Hud.highScore}">00000</span></p>
            </section>
            <section class="tetris-panel shutcuts">
              <p class="tetris-panel-text">↑ ROTATE</p>
              <p class="tetris-panel-text">← → MOVE</p>
              <p class="tetris-panel-text">↓ SPEED</p>
              <p class="tetris-panel-text">SPACE DROP</p>
              <p class="tetris-panel-text tetris-highlight">M BGM ON/OFF</p>
              <p class="tetris-panel-text">P PAUSE</p>
              <p class="tetris-panel-text">Q END</p>
              <p class="tetris-panel-text">R RESTART</p>
            </section>
          </aside>
        </section>
        <footer class="tetris-controls">
          <!-- START / SELECT -->
          <section class="tetris-system-controls">
            <div id="${Controls.back}" data-key="back" class="tetris-system-btn tetris-btn-back">BACK</div>
            <div id="${Controls.start}" data-key="start" class="tetris-system-btn tetris-btn-start">START</div>
          </section>
          <section class="tetris-main-controls">
            <!-- D-PAD -->
            <div class="tetris-dpad">
              <div id="${Controls.up}" data-key="dpad_up" class="tetris-dpad-up">↑</div>
              <div class="tetris-dpad-mid">
                <div id="${Controls.left}" data-key="dpad_left" class="tetris-dpad-left">←</div>
                <div class="tetris-dpad-center"></div>
                <div id="${Controls.right}" data-key="dpad_right" class="tetris-dpad-right">→</div>
              </div>
              <div id="${Controls.down}" data-key="dpad_down" class="tetris-dpad-down">↓</div>
            </div>
            <!-- BUTTONS -->
            <div class="tetris-buttons">
              <div id="${Controls.x}" data-key="x" class="tetris-action-btn tetris-btn-x">X</div>
              <div id="${Controls.y}" data-key="y" class="tetris-action-btn tetris-btn-y">Y</div>
              <div id="${Controls.b}" data-key="b" class="tetris-action-btn tetris-btn-b">B</div>
              <div id="${Controls.a}" data-key="a" class="tetris-action-btn tetris-btn-a">A</div>
            </div>
          </section>
        </footer>
      </div>
      <script src="${scriptPath}"></script>
    </body>
    </html>
    `
};

export default getHtmlTemplate;
