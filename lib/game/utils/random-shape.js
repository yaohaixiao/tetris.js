import SHAPES from '@/lib/game/constants/shapes.js';
import PALETTES from '@/lib/game/constants/color-palettes.js';

/**
 * # 随机生成一个方块（支持等级配色）
 *
 * 从预定义的方块库（SHAPES）中随机选取一种方块， 根据当前等级从 PALETTES 配色方案表获取实际颜色。
 *
 * ## 方块库（SHAPES）
 *
 * 包含 8 种俄罗斯方块（含 I 型加长版）：
 *
 * | 索引 | 类型      | 形状 |
 * | ---- | --------- | ---- |
 * | 0    | I（标准） | 1×4  |
 * | 1    | I（加长） | 1×5  |
 * | 2    | O         | 2×2  |
 * | 3    | T         | 2×3  |
 * | 4    | L         | 2×3  |
 * | 5    | J         | 2×3  |
 * | 6    | S         | 2×3  |
 * | 7    | Z         | 2×3  |
 *
 * ## 等级配色
 *
 * 每 32 关切换一套配色，共 8 套（256 / 32）。 等级越高配色越暗，模拟 FC 俄罗斯方块调色板切换。
 *
 * ## 为什么深拷贝形状矩阵？
 *
 * 方块的形状矩阵在游戏过程中会被旋转操作修改。 深拷贝确保每次生成的新方块都是独立的， 不会因为共享引用而导致其他方块的形状意外改变。
 *
 * @example
 *   const piece = randomShape(1);
 *   // piece = {
 *   //   shape: [[0, 1, 0], [1, 1, 1]],
 *   //   color: "#f1fa04"  // YELLOW，0-31 关配色
 *   // }
 *
 * @example
 *   const piece = randomShape(200);
 *   // piece = {
 *   //   shape: [[1, 1], [1, 1]],
 *   //   color: "#303030"  // DEEP_GRAY_ORANGE，192-223 关配色
 *   // }
 *
 * @function randomShape
 * @param {number} [level=1] - 当前等级（从 1 开始）. Default is `1`
 * @returns {object} 随机选中的方块对象，含 shape 和 color
 */
const randomShape = (level = 1) => {
  // 生成 0 ~ 方块总数之间的随机整数作为索引
  const index = Math.floor(Math.random() * SHAPES.length);
  const piece = SHAPES[index];

  // 根据等级取配色方案：每 32 关一套，不越界
  const paletteIndex = Math.min(
    Math.floor((level - 1) / 32),
    PALETTES.length - 1,
  );
  const palette = PALETTES[paletteIndex];

  // 返回随机方块：深拷贝形状矩阵避免共享引用，颜色从配色方案获取
  return {
    shape: piece.shape.map((row) => [...row]),
    color: palette[piece.colorIndex],
  };
};

export default randomShape;
