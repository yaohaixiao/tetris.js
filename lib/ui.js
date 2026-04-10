import {
  BOARD_COLS,
  BOARD_ROWS,
  COLOR_RGBA_BLACK,
  COLOR_BLACK,
  COLOR_GREEN,
  COLOR_RED,
  COLOR_YELLOW,
  COLOR_WHITE,
} from './constants.js';
import { stopBGM, sounds } from './audio.js';
import { pad } from './utils.js';
import { gameState, saveHighScore } from './state.js';

// 主画布
const canvas = document.querySelector('#game-board');
const ctx = canvas.getContext('2d');
// 方块预览画布
const nextCanvas = document.querySelector('#next-piece');
const nextCtx = nextCanvas.getContext('2d');

// 全局尺寸
let BLOCK_SIZE;
let baseFontSize;

/**
 * # 绘制单个方块
 *
 * 在 Canvas 上绘制一个带边框的单个方块（网格单元）
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文
 * @param {number} x - 方块在网格中的 X 轴坐标（列数）
 * @param {number} y - 方块在网格中的 Y 轴坐标（行数）
 * @param {string} color - 方块的填充颜色（支持十六进制、rgb、颜色名等）
 * @returns {void}
 */
export const drawBlock = (ctx, x, y, color) => {
  // 方块基础尺寸
  const bs = BLOCK_SIZE;
  // 方块之间的间隔间隙
  const gap = 1;
  // 实际绘制的方块大小（扣除两侧间隙）
  const size = bs - gap * 2;
  // 计算方块在 Canvas 上的实际像素坐标 X
  const px = x * bs + gap;
  // 计算方块在 Canvas 上的实际像素坐标 Y
  const py = y * bs + gap;

  // 设置填充色并绘制实心方块
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);
  // 设置黑色边框并绘制方块轮廓
  ctx.strokeStyle = COLOR_BLACK;
  ctx.strokeRect(px, py, size, size);
};

/**
 * # 绘制面板
 *
 * 渲染并绘制完整的游戏棋盘（核心功能：清空画布 → 遍历棋盘网格 → 绘制所有存在的方块）
 *
 * @function drawBoard
 * @param {string[][]} board - 游戏棋盘二维数组，存储每个格子的颜色值，空值表示无方块
 * @returns {void}
 */
export const drawBoard = (board) => {
  const { width, height } = canvas;

  // 清空整个画布，为重新绘制棋盘做准备
  ctx.clearRect(0, 0, width, height);

  // 双层循环遍历棋盘所有行和列（Y 轴为行，X 轴为列）
  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLS; x++) {
      // 如果当前棋盘格子有颜色值（存在方块），则调用方块绘制函数
      if (board[y][x]) {
        drawBlock(ctx, x, y, board[y][x]);
      }
    }
  }
};

/**
 * # 绘制当前方块
 *
 * 遍历当前方块的形状矩阵，在指定位置绘制所有格子
 *
 * @function drawCurr
 * @param {object} curr - 当前活动方块对象
 * @param {number[][]} curr.shape - 方块的形状矩阵（二维数组，非0表示有格子）
 * @param {string} curr.color - 方块的填充颜色
 * @param {number} cx - 方块左上角在棋盘上的 X 坐标（列）
 * @param {number} cy - 方块左上角在棋盘上的 Y 坐标（行）
 * @returns {void}
 */
export const drawCurr = (curr, cx, cy) => {
  // 获取当前方块的形状矩阵
  const { shape, color } = curr;
  const { length } = shape;

  // 双层循环遍历方块的形状矩阵
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // 如果当前位置有方块，则绘制到棋盘对应位置
      if (shape[y][x]) {
        drawBlock(ctx, cx + x, cy + y, color);
      }
    }
  }
};

/**
 * # 绘制预览方块
 *
 * 在预览画布中央居中显示下一个方块的形状和颜色
 *
 * @function drawNext
 * @param {object | null} next - 下一个预览方块对象
 * @param {number[][]} next.shape - 预览方块的形状矩阵
 * @param {string} next.color - 预览方块的填充颜色
 * @returns {void}
 */
export const drawNext = (next) => {
  const { shape } = next;
  const { width, height } = nextCanvas;
  // 预览区域固定为 5x5 网格大小
  const gridSize = 5;
  // 计算单个预览方块的尺寸（自适应预览画布）
  const blockSize = Math.floor(width / gridSize);
  // 计算水平居中偏移量
  const ox = Math.floor((width - shape[0].length * blockSize) / 2);
  // 计算垂直居中偏移量
  const oy = Math.floor((height - shape.length * blockSize) / 2);

  // 清空预览画布
  nextCtx.clearRect(0, 0, width, height);

  // 遍历预览方块形状矩阵
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // 当前位置有方块时进行绘制
      if (shape[y][x]) {
        const px = ox + x * blockSize;
        const py = oy + y * blockSize;

        // 绘制填充方块与黑色边框
        nextCtx.fillStyle = next.color;
        nextCtx.fillRect(px, py, blockSize - 2, blockSize - 2);
        nextCtx.strokeStyle = COLOR_BLACK;
        nextCtx.strokeRect(px, py, blockSize - 2, blockSize - 2);
      }
    }
  }
};

/**
 * # 绘制游戏难度选择界面
 *
 * 显示当前选择的等级、操作提示文本，居中展示在游戏主画布
 *
 * @function drawLevelSelect
 * @param {number} level - 当前选中的游戏难度等级
 * @returns {void}
 */
export const drawLevelSelect = (level) => {
  const { width, height } = canvas;

  // 清空画布，准备绘制等级选择界面
  ctx.clearRect(0, 0, width, height);

  // 设置文本居中对齐
  ctx.textAlign = 'center';
  // 设置像素风格字体与大小
  ctx.font = `${baseFontSize}px "Press Start 2P"`;

  // 绘制绿色标题：LEVEL
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText('LEVEL', width / 2, height * 0.25);
  // 绘制当前选中的等级数字
  ctx.fillText(level.toString(), width / 2, height * 0.4);

  // 绘制白色操作提示文本
  ctx.fillStyle = COLOR_WHITE;
  ctx.fillText('1-9 KEY', width / 2, height * 0.55);
  ctx.fillText('P 3SEC: HIDDEN', width / 2, height * 0.68);
  ctx.fillText('ENTER START', width / 2, height * 0.81);
};

/**
 * # 绘制游戏暂停界面
 *
 * 全屏半透明遮罩 + 居中显示 PAUSED 文字
 *
 * @function drawPause
 * @returns {void}
 */
export const drawPause = () => {
  const { width, height } = canvas;

  // 绘制半透明黑色遮罩覆盖整个画布
  ctx.fillStyle = COLOR_RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  // 设置文字样式：黄色、居中、像素字体
  ctx.fillStyle = COLOR_YELLOW;
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize}px "Press Start 2P"`;

  // 居中绘制暂停文字
  ctx.fillText('PAUSED', width / 2, height / 2);
};

/**
 * # 绘制游戏结束界面
 *
 * 先绘制最终棋盘，再添加半透明遮罩，居中显示红色 GAME OVER 文字
 *
 * @function drawOver
 * @returns {void}
 */
export const drawOver = () => {
  const { width, height } = canvas;
  const { board } = gameState;

  // 绘制游戏结束时的最终棋盘状态
  drawBoard(board);

  // 绘制全屏半透明黑色遮罩
  ctx.fillStyle = COLOR_RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  // 设置文字样式：红色、居中、像素字体
  ctx.fillStyle = COLOR_RED;
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize}px "Press Start 2P"`;

  // 画布居中绘制游戏结束文字
  ctx.fillText('GAME OVER', width / 2, height / 2);
};

/**
 * # 强制触发游戏结束
 *
 * 停止音乐、清除定时器、播放结束音效、保存最高分并显示游戏结束界面
 *
 * @function forceOver
 * @returns {void}
 */
export const forceOver = () => {
  // 停止背景音乐
  stopBGM();

  // 设置游戏结束状态
  gameState.isGameOver = true;

  // 清除游戏主循环定时器
  clearInterval(gameState.gameInterval);

  // 播放游戏结束音效
  sounds.gameOver();

  // 保存当前最高分
  saveHighScore();

  // 延迟短暂时间后绘制游戏结束界面
  setTimeout(() => {
    drawOver();
  }, 10);
};

/**
 * # 窗口大小自适应调整函数
 *
 * 根据屏幕尺寸动态计算方块大小、画布尺寸、字体大小，并重新渲染当前游戏界面
 *
 * @function resize
 * @returns {void}
 */
export const resize = () => {
  const { isSelectLevel, isGameOver, board, curr, cx, cy, level, next } =
    gameState;
  // 获取窗口高度的90%作为基准高度
  const h = globalThis.innerHeight * 0.9;

  // 根据窗口高度计算单个方块的尺寸
  BLOCK_SIZE = Math.floor(h / BOARD_ROWS);
  // 重新设置主画布的宽度和高度
  canvas.width = BLOCK_SIZE * BOARD_COLS;
  canvas.height = BLOCK_SIZE * BOARD_ROWS;
  // 动态计算基础字体大小，适配画布高度
  baseFontSize = Math.floor(canvas.height * 0.035);

  // 计算预览区域的大小，取宽度和高度限制的较小值
  const nextSize = Math.min(
    globalThis.innerWidth * 0.1,
    globalThis.innerHeight * 0.18,
  );
  // 设置预览画布的尺寸
  nextCanvas.width = nextSize;
  nextCanvas.height = nextSize;

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

/**
 * # 更新游戏界面上的所有 UI 分数信息
 *
 * 将分数、行数、等级、最高分格式化后渲染到对应 DOM 元素
 *
 * @function updateUI
 * @param {number} score - 当前游戏得分
 * @param {number} lines - 当前消除行数
 * @param {number} level - 当前游戏等级
 * @param {number} highScore - 历史最高得分
 * @returns {void}
 */
export const updateUI = (score, lines, level, highScore) => {
  // 更新当前得分（固定 5 位，左侧补零）
  document.querySelector('#score').textContent = pad(score, 5);
  // 更新消除行数（固定 2 位，左侧补零）
  document.querySelector('#lines').textContent = pad(lines, 2);
  // 更新当前等级（固定 2 位，左侧补零）
  document.querySelector('#level').textContent = pad(level, 2);
  // 更新历史最高分（固定 5 位，左侧补零）
  document.querySelector('#highScore').textContent = pad(highScore, 5);
};
