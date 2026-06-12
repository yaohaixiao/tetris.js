import Configuration from '../../lib/configuration.js';

const getHtmlTemplate = (args) => {
  const { Mode } = Configuration;
  const minify = args.action === 'minify';
  const stylePath = minify ? 'css/tetris.min.css' : 'css/tetris.css';
  const scriptPath = minify ? 'js/tetris.min.js' : 'js/tetris.js';

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="keywords" content="javascript,canvas,game,engine,scheduler,command queue,replay,ai,tetris">
        <meta name="description" content="tetris.js 是一款零依赖的原生 JavaScript 俄罗斯方块游戏，基于 Canvas 实现，支持多端输入与 AI 控制。项目采用固定帧流程驱动架构，结合 Scheduler、Command Queue 与 Replay 系统，实现清晰的游戏更新管线，是一个轻量级前端游戏引擎设计与架构实践示例。" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preload" href="${stylePath}" as="style">
        <link rel="preload" href="${scriptPath}" as="script">
        <link rel="preload" href="img/bg.jpg" as="image">
        <link rel="prefetch" href="font/latin.woff2" type="font/woff2" as="font">
        <title>俄罗斯方块</title>
        <link rel="icon" href="favicon.ico" type="image/x-icon">
        <link href="${stylePath}" rel="stylesheet">
      </head>
      <body>
      <div id="tetris-container" class="tetris-container" data-mode="${Mode}"></div>
      <script src="${scriptPath}"></script>
      </body>
    </html>
  `;
};

export default getHtmlTemplate;
