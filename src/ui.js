import { BOARD_COLS, BOARD_ROWS } from './constants.js';
import { gameState, saveHighScore } from './state.js';
import { stopBGM, sounds } from './audio.js';

// 画布
const canvas = document.querySelector('#game-board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.querySelector('#next-piece');
const nextCtx = nextCanvas.getContext('2d');

// 全局尺寸
let BLOCK_SIZE;
let baseFontSize;

// 绘制单个方块
export function block(ctx, x, y, color) {
  const bs = BLOCK_SIZE;
  const gap = 1;
  const size = bs - gap * 2;
  const px = x * bs + gap;
  const py = y * bs + gap;

  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);
  ctx.strokeStyle = '#444';
  ctx.strokeRect(px, py, size, size);
}

// 绘制面板
export function drawBoard(board) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLS; x++) {
      if (board[y][x]) block(ctx, x, y, board[y][x]);
    }
  }
}

// 绘制当前方块
export function drawCurr(curr, cx, cy) {
  const s = curr.shape;

  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      if (s[y][x]) block(ctx, cx + x, cy + y, curr.color);
    }
  }
}

// 绘制预览方块
export function drawNext(next) {
  const { shape } = next;
  const gridSize = 5;
  const blockSize = Math.floor(nextCanvas.width / gridSize);
  const ox = Math.floor((nextCanvas.width - shape[0].length * blockSize) / 2);
  const oy = Math.floor((nextCanvas.height - shape.length * blockSize) / 2);

  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const px = ox + x * blockSize;
        const py = oy + y * blockSize;
        nextCtx.fillStyle = next.color;
        nextCtx.fillRect(px, py, blockSize - 2, blockSize - 2);
        nextCtx.strokeStyle = '#444';
        nextCtx.strokeRect(px, py, blockSize - 2, blockSize - 2);
      }
    }
  }
}

// 绘制等级选择
export function drawLevelSelect(level) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize}px "Press Start 2P"`;
  ctx.fillStyle = '#0f0';
  ctx.fillText('LEVEL', canvas.width / 2, canvas.height * 0.25);
  ctx.fillText(level, canvas.width / 2, canvas.height * 0.4);
  ctx.fillStyle = '#fff';
  ctx.fillText('1-9 KEY', canvas.width / 2, canvas.height * 0.55);
  ctx.fillText('P 3SEC: HIDDEN', canvas.width / 2, canvas.height * 0.68);
  ctx.fillText('ENTER START', canvas.width / 2, canvas.height * 0.81);
}

// 绘制暂停
export function drawPause() {
  ctx.fillStyle = 'rgba(0,0,0,.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff0';
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize}px "Press Start 2P"`;
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
}

// 绘制游戏结束
export function drawOver() {
  drawBoard(gameState.board);

  ctx.fillStyle = 'rgba(0,0,0,.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f00';
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize}px "Press Start 2P"`;
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

// 窗口自适应
export function resize() {
  const h = globalThis.innerHeight * 0.9;

  BLOCK_SIZE = Math.floor(h / BOARD_ROWS);
  canvas.width = BLOCK_SIZE * BOARD_COLS;
  canvas.height = BLOCK_SIZE * BOARD_ROWS;
  baseFontSize = Math.floor(canvas.height * 0.035);

  const nextSize = Math.min(
    globalThis.innerWidth * 0.1,
    globalThis.innerHeight * 0.18,
  );

  nextCanvas.width = nextSize;
  nextCanvas.height = nextSize;

  if (gameState.isSelectLevel || gameState.isGameOver) {
    drawLevelSelect(gameState.level);
  } else {
    drawBoard(gameState.board);
    drawNext(gameState.next);

    if (gameState.curr) {
      drawCurr(gameState.curr, gameState.cx, gameState.cy);
    }
  }
}

// 数字补零
export function pad(n, len) {
  return n.toString().padStart(len, '0');
}

// 更新分数UI
export function updateUI(score, lines, level, highScore) {
  document.querySelector('#score').textContent = pad(score, 5);
  document.querySelector('#lines').textContent = pad(lines, 2);
  document.querySelector('#level').textContent = pad(level, 2);
  document.querySelector('#highScore').textContent = pad(highScore, 5);
}

export function forceOver() {
  stopBGM();
  gameState.isGameOver = true;
  clearInterval(gameState.gameInterval);
  sounds.gameOver();
  saveHighScore();
  setTimeout(() => {
    drawOver();
  }, 10);
}
