import COLORS from '../../constants/colors.js';

const { BLUE, TEAL, YELLOW, PURPLE, ORANGE, GREEN, RED } = COLORS;

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
const TETROMINOES = [
  // I型方块（长条）：1行4列
  { shape: [[1, 1, 1, 1]], color: TEAL },
  // O型方块（正方形）：2x2
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: YELLOW,
  },
  // T型方块
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: PURPLE,
  },
  // L型方块
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: BLUE,
  },
  // J型方块
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: ORANGE,
  },
  // S型方块（右斜）
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: GREEN,
  },
  // Z型方块（左斜）
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: RED,
  },
];

export default TETROMINOES;
