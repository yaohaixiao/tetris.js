const HtmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preload" href="./tetris.css" as="style">
  <link rel="preload" href="./tetris.js" as="script">
  <link rel="preload" href="./img/bg.jpg" type="image/jpg" as="image">
  <link rel="prefetch" href="./font/latin.woff2" type="font/woff2" as="font">
  <title>俄罗斯方块</title>
  <link href="./tetris.css" rel="stylesheet">
</head>
<body>
  <div class="container">
    <main class="main">
      <canvas id="game-board"></canvas>
    </main>
    <aside class="aside">
      <section class="panel next">
        <h3 class="next-title">NEXT</h3>
        <canvas id="next-piece" class="next-piece"></canvas>
      </section>
      <section class="panel data">
        <p class="panel-text">SCORE:<br><span id="score">00000</span></p>
        <p class="panel-text">LINE:<br><span id="lines">00</span></p>
        <p class="panel-text">LEVEL:<br><span id="level">01</span></p>
        <p class="panel-text highlight">HI-SCORE:<br><span id="highScore">00000</span></p>
      </section>
      <section class="panel shutcuts">
        <p class="panel-text">Enter START</p>
        <p class="panel-text">↑ ROTATE</p>
        <p class="panel-text">← → MOVE</p>
        <p class="panel-text">↓ SPEED</p>
        <p class="panel-text">SPACE DROP</p>
        <p class="panel-text highlight">M BGM ON/OFF</p>
        <p class="panel-text">P PAUSE</p>
        <p class="panel-text">Q END</p>
        <p class="panel-text">R RESTART</p>
      </section>
    </aside>
  </div>
  <script src="./tetris.js"></script>
</body>
</html>
`;

export default HtmlTemplate;
