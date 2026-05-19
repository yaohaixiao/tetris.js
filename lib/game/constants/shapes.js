import COLORS from '@/lib/constants/colors.js';

const { PINK, BLUE, TEAL, YELLOW, VIOLET, ORANGE, GREEN, RED } = COLORS;

/**
 * # 俄罗斯方块形状定义（Tetromino）
 *
 * @typedef {object} Tetromino
 * @property {number[][]} shape - 方块形状矩阵（1 表示有格子，0 表示空）
 * @property {string} color - 方块对应的颜色值
 */

/**
 * # 俄罗斯方块形状全集
 *
 * 存储 8 种俄罗斯方块（含 2 种 I 型变体）的形状和颜色定义。 每种方块通过二维数组描述形状，1 表示实心格子，0 表示空格。
 *
 * ## 方块列表
 *
 * | 类型      | 形状 | 颜色   | 说明         |
 * | --------- | ---- | ------ | ------------ |
 * | I         | 1×4  | TEAL   | 标准长条     |
 * | I（加长） | 1×5  | GREEN  | 加长版长条   |
 * | O         | 2×2  | ORANGE | 正方形       |
 * | T         | 2×3  | YELLOW | T 型         |
 * | L         | 2×3  | BLUE   | L 型         |
 * | J         | 2×3  | PINK   | J 型（反 L） |
 * | S         | 2×3  | RED    | S 型（右斜） |
 * | Z         | 2×3  | VIOLET | Z 型（左斜） |
 *
 * @type {Tetromino[]}
 */
const SHAPES = [
  /**
   * ## I 型方块（标准长条）
   *
   * 形状：1 行 4 列 颜色：TEAL（青色）
   */
  { shape: [[1, 1, 1, 1]], color: TEAL },

  /**
   * ## I 型方块（加长版）
   *
   * 形状：1 行 5 列 颜色：GREEN（绿色）
   */
  { shape: [[1, 1, 1, 1, 1]], color: GREEN },

  /**
   * ## O 型方块（正方形）
   *
   * 形状：2×2 实心方块 颜色：ORANGE（橙色） 特点：旋转后形状不变
   */
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: ORANGE,
  },

  /**
   * ## T 型方块
   *
   * 形状：第一行中间一个，第二行三个 颜色：YELLOW（黄色）
   */
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: YELLOW,
  },

  /**
   * ## L 型方块
   *
   * 形状：第一行左侧一个，第二行三个 颜色：BLUE（蓝色）
   */
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: BLUE,
  },

  /**
   * ## J 型方块（反 L 型）
   *
   * 形状：第一行右侧一个，第二行三个 颜色：PINK（粉色）
   */
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: PINK,
  },

  /**
   * ## S 型方块（右斜）
   *
   * 形状：第一行右侧两个，第二行左侧两个 颜色：RED（红色）
   */
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: RED,
  },

  /**
   * ## Z 型方块（左斜）
   *
   * 形状：第一行左侧两个，第二行右侧两个 颜色：VIOLET（紫罗兰色）
   */
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: VIOLET,
  },
];

export default SHAPES;
