/**
 * # 俄罗斯方块形状定义（Tetromino）
 *
 * @typedef {object} Tetromino
 * @property {number[][]} shape - 方块形状矩阵（1 表示有格子，0 表示空）
 * @property {number} colorIndex - 配色方案中的索引（0-7），运行时根据等级查 PALETTES 获取实际颜色
 */

/**
 * # 俄罗斯方块形状全集
 *
 * 存储 8 种俄罗斯方块（含 2 种 I 型变体）的形状定义。 每种方块通过二维数组描述形状，1 表示实心格子，0 表示空格。 颜色通过
 * `colorIndex` 关联到 PALETTES 配色方案表，实现等级变色。
 *
 * ## 方块列表
 *
 * | 索引 | 类型      | 形状 | 说明         |
 * | ---- | --------- | ---- | ------------ |
 * | 0    | I（标准） | 1×4  | 标准长条     |
 * | 1    | I（加长） | 1×5  | 加长版长条   |
 * | 2    | O         | 2×2  | 正方形       |
 * | 3    | T         | 2×3  | T 型         |
 * | 4    | L         | 2×3  | L 型         |
 * | 5    | J         | 2×3  | J 型（反 L） |
 * | 6    | S         | 2×3  | S 型（右斜） |
 * | 7    | Z         | 2×3  | Z 型（左斜） |
 *
 * @type {Tetromino[]}
 */
const SHAPES = [
  /**
   * ## I 型方块（标准长条）
   *
   * 形状：1 行 4 列 colorIndex: 0（TEAL 系）
   */
  { shape: [[1, 1, 1, 1]], colorIndex: 0, type: 'I', rotate: 0 },

  /**
   * ## I 型方块（加长版）
   *
   * 形状：1 行 5 列 colorIndex: 1（GREEN 系）
   */
  { shape: [[1, 1, 1, 1, 1]], colorIndex: 1, type: 'I5', rotation: 0 },

  /**
   * ## O 型方块（正方形）
   *
   * 形状：2×2 实心方块，旋转后形状不变 colorIndex: 2（ORANGE 系）
   */
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    colorIndex: 2,
    type: 'O',
    rotation: 0,
  },

  /**
   * ## T 型方块
   *
   * 形状：第一行中间一个，第二行三个 colorIndex: 3（YELLOW 系）
   */
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    colorIndex: 3,
    type: 'T',
    rotation: 0,
  },

  /**
   * ## L 型方块
   *
   * 形状：第一行左侧一个，第二行三个 colorIndex: 4（BLUE 系）
   */
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    colorIndex: 4,
    type: 'L',
    rotation: 0,
  },

  /**
   * ## J 型方块（反 L 型）
   *
   * 形状：第一行右侧一个，第二行三个 colorIndex: 5（PINK 系）
   */
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    colorIndex: 5,
    type: 'J',
    rotation: 0,
  },

  /**
   * ## S 型方块（右斜）
   *
   * 形状：第一行右侧两个，第二行左侧两个 colorIndex: 6（RED 系）
   */
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    colorIndex: 6,
    type: 'S',
    rotation: 0,
  },

  /**
   * ## Z 型方块（左斜）
   *
   * 形状：第一行左侧两个，第二行右侧两个 colorIndex: 7（VIOLET 系）
   */
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    colorIndex: 7,
    type: 'Z',
    rotation: 0,
  },
];

export default SHAPES;
