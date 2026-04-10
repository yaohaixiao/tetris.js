import { BOARD_COLS, BOARD_ROWS } from './constants.js';

// 游戏状态（集中管理）
export const gameState = {
  board: [],
  curr: null,
  cx: 0,
  cy: 0,
  next: null,
  baseLines: 0,
  score: 0,
  lines: 0,
  level: 1,
  highScore: 0,
  isGameOver: false,
  isPaused: false,
  isSelectLevel: true,
  isHiddenMode: false,
  gameInterval: null,
  holdP: null,
};

// 重置面板
export function resetBoard() {
  gameState.board = Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }).fill(0),
  );
}

// 读取最高分
export function loadHighScore() {
  gameState.highScore =
    Number.parseInt(localStorage.getItem('tetris-high-score'), 10) || 0;
}

// 保存最高分
export function saveHighScore() {
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem('tetris-high-score', gameState.highScore.toString());
  }
}
