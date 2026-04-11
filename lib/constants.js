/* -------- 游戏面板尺寸配置：10列（宽），20行（高），符合经典俄罗斯方块标准 -------- */
// 面板列数
export const BOARD_COLS = 10;
// 面板行数
export const BOARD_ROWS = 20;

// 清理层数的等分
export const CLEAR_SCORES = [0, 100, 300, 500, 800];
// 最大级别
export const MAX_LEVEL = 10;

/* -------- 游戏面板中使用的颜色 -------- */
// 青色
export const COLOR_TEAL = '#0ff';
// 黄色
export const COLOR_YELLOW = '#ff0';
// 紫色
export const COLOR_PURPLE = '#a0a';
// 蓝色
export const COLOR_BLUE = '#00f';
// 橙色
export const COLOR_ORANGE = '#f80';
// 绿色
export const COLOR_GREEN = '#0f0';
// 红色
export const COLOR_RED = '#f00';
// 黑色
export const COLOR_BLACK = '#444';
export const COLOR_RGBA_BLACK = 'rgba(0,0,0,.8)';
// 白色
export const COLOR_WHITE = '#fff';

/**
 * # 俄罗斯方块所有形状定义（7种基础方块）
 *
 * @typedef {object} Tetromino
 * @property {number[][]} shape - 方块形状矩阵（1表示有格子，0表示空）
 * @property {string} color - 方块对应的颜色常量
 */

/**
 * # 俄罗斯方块全集
 *
 * 存储7种经典俄罗斯方块（I、O、T、L、J、S、Z），每种方块包含形状和颜色 注：shape中1表示有方块，0表示无方块，通过二维数组描述方块的形状
 *
 * @type {Tetromino[]}
 */
export const TETROMINOES = [
  // I型方块（长条）：1行4列
  { shape: [[1, 1, 1, 1]], color: COLOR_TEAL },
  // O型方块（正方形）：2x2
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: COLOR_YELLOW,
  },
  // T型方块
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: COLOR_PURPLE,
  },
  // L型方块
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: COLOR_BLUE,
  },
  // J型方块
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: COLOR_ORANGE,
  },
  // S型方块（右斜）
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: COLOR_GREEN,
  },
  // Z型方块（左斜）
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: COLOR_RED,
  },
];

export const FIREWORKS_COLORS = [
  COLOR_TEAL,
  COLOR_YELLOW,
  COLOR_PURPLE,
  COLOR_ORANGE,
  COLOR_GREEN,
  COLOR_RED,
];
