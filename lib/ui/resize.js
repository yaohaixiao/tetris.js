import BOARD from '../constants/board.js';
import GameState from '../state/game-state.js';
import Canvas from './canvas.js';
import drawLevelSelect from './draw-level-select.js';
import drawBoard from './draw-board.js';
import drawCurr from './draw-curr.js';
import drawNext from './draw-next.js';

/**
 * # 窗口大小自适应调整函数
 *
 * 根据屏幕尺寸动态计算方块大小、画布尺寸、字体大小，并重新渲染当前游戏界面
 *
 * @function resize
 * @returns {void}
 */
const resize = () => {
  const { ROWS, COLS } = BOARD;
  const { gameBoard, nextPiece } = Canvas;
  const { isSelectLevel, isGameOver, board, curr, cx, cy, level, next } =
    GameState;
  // 获取窗口高度的90%作为基准高度
  const h = globalThis.innerHeight * 0.9;

  // 根据窗口高度计算单个方块的尺寸
  Canvas.blockSize = Math.floor(h / ROWS);
  // 重新设置主画布的宽度和高度
  gameBoard.width = Canvas.blockSize * COLS;
  gameBoard.height = Canvas.blockSize * ROWS;
  // 动态计算基础字体大小，适配画布高度
  Canvas.fontSize = Math.floor(gameBoard.height * 0.032);

  // 计算预览区域的大小，取宽度和高度限制的较小值
  const nextSize = Math.min(
    globalThis.innerWidth * 0.1,
    globalThis.innerHeight * 0.18,
  );
  // 设置预览画布的尺寸
  nextPiece.width = nextSize;
  nextPiece.height = nextSize;

  // 根据当前游戏状态重新渲染对应的界面
  if (isSelectLevel || isGameOver) {
    // 等级选择 / 游戏结束界面
    drawLevelSelect(level);
  } else {
    // 正常游戏界面：绘制棋盘 + 下一个方块 + 当前下落方块
    drawBoard(board);
    drawNext(next);

    if (curr) {
      drawCurr(curr, cx, cy);
    }
  }
};

export default resize;
