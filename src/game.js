import {
  BOARD_COLS,
  BOARD_ROWS,
  CLEAR_SCORES,
  MAX_LEVEL,
  TETROMINOES
} from './constants.js'
import { gameState, saveHighScore } from './state.js';
import { drawBoard, drawCurr, drawNext, drawOver, updateUI } from './ui.js';
import { stopBGM, sounds } from './audio.js';

// 主循环
export function loop() {
  if (gameState.isGameOver || gameState.isPaused) {
    return false;
  }

  if (!move(0, 1)) {
    lock();
    sounds.fall();
    clearLines();
    spawn();

    // 游戏已结束，不执行任何逻辑
    if (gameState.isGameOver) {
      return false;
    }
  }

  drawBoard(gameState.board);
  drawCurr(gameState.curr, gameState.cx, gameState.cy);
}

// 游戏结束
export function gameOver() {
  if (gameState.isGameOver) {
    return false;
  }

  gameState.isGameOver = true;
  stopBGM();
  clearInterval(gameState.gameInterval);
  sounds.gameOver();
  saveHighScore();
  setTimeout(drawOver, 10);
}

// 随机方块
export function randomTetromino() {
  return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
}

// 生成新方块
export function spawn() {
  gameState.curr = gameState.next || randomTetromino();
  gameState.next = randomTetromino();
  gameState.cx =
    Math.floor(BOARD_COLS / 2) - Math.floor(gameState.curr.shape[0].length / 2);
  gameState.cy = 0;

  drawNext(gameState.next);

  if (collision(0, 0)) {
    gameOver();
  }
}

// 碰撞检测
export function collision(ox, oy) {
  const s = gameState.curr.shape;

  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      if (s[y][x]) {
        const nx = gameState.cx + x + ox;
        const ny = gameState.cy + y + oy;

        if (
          nx < 0 ||
          nx >= BOARD_COLS ||
          ny >= BOARD_ROWS ||
          (ny >= 0 && gameState.board[ny][nx])
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

// 旋转
export function rotate() {
  const prev = gameState.curr.shape;

  gameState.curr.shape = prev[0].map((_, i) =>
    prev.map((r) => r[i]).toReversed(),
  );

  if (collision(0, 0)) {
    gameState.curr.shape = prev;
  } else {
    sounds.rotate();
  }
}

// 移动
export function move(ox, oy) {
  if (!collision(ox, oy)) {
    gameState.cx += ox;
    gameState.cy += oy;
    sounds.move();

    return true;
  }

  return false;
}

// 落地锁定
export function lock() {
  const s = gameState.curr.shape;

  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      if (s[y][x]) {
        gameState.board[gameState.cy + y][gameState.cx + x] =
          gameState.curr.color;
      }
    }
  }
}

// 消除行
export function clearLines() {
  let clear = 0;

  for (let y = BOARD_ROWS - 1; y >= 0; y--) {
    // 严格检查：当前行所有格子都有颜色（非0）才判定为可消除
    const isLineFull = gameState.board[y].every((cell) => cell !== 0);

    if (isLineFull) {
      gameState.board.splice(y, 1);
      gameState.board.unshift(new Array(BOARD_COLS).fill(0));

      clear++;
      y++;
    }
  }

  if (clear > 0) {
    sounds.clear();
    gameState.lines += clear;
    gameState.score += CLEAR_SCORES[clear] * gameState.level;

    // 计算总等级行数（初始等级 + 已消除行数）
    const totalLines = gameState.baseLines + gameState.lines;
    // 计算当前层级
    const currentLevel = Math.floor(totalLines / 10) + 1;
    // 计算总等级行数（初始等级 + 已消除行数）
    gameState.level = Math.min(Math.max(gameState.level, currentLevel), MAX_LEVEL);

    updateSpeed();
  }

  updateUI(
    gameState.score,
    gameState.lines,
    gameState.level,
    gameState.highScore,
  );
  saveHighScore();
}

// 快速下落
export function drop() {
  // 循环调用move(0,1)（向下移动），直到移动失败（碰撞底部或已有方块）
  while (true) {
    if (!move(0, 1)) {
      break;
    }
  }

  lock();
  sounds.fall();
  clearLines();
  spawn();
  sounds.drop();
}

// 速度
export function getSpeed() {
  return Math.max(100, 1000 - (gameState.level - 1) * 80);
}

// 更新速度
export function updateSpeed() {
  clearInterval(gameState.gameInterval);
  gameState.gameInterval = setInterval(loop, getSpeed());
}
