import SHAPES from '@/lib/game/constants/shapes.js';

/**
 * # 随机生成一个方块
 *
 * 从预定义的方块库（SHAPES）中随机选取一种方块， 返回包含形状矩阵和颜色的方块对象。
 *
 * ## 方块库（SHAPES）
 *
 * 通常包含 7 种标准俄罗斯方块：
 *
 * | 类型 | 名称 | 形状 |
 * | ---- | ---- | ---- |
 * | I    | 长条 | 4×1  |
 * | O    | 方形 | 2×2  |
 * | T    | T 型 | 3×2  |
 * | S    | S 型 | 3×2  |
 * | Z    | Z 型 | 3×2  |
 * | J    | J 型 | 3×2  |
 * | L    | L 型 | 3×2  |
 *
 * ## 为什么深拷贝形状矩阵？
 *
 * 方块的形状矩阵在游戏过程中会被旋转操作修改。 深拷贝确保每次生成的新方块都是独立的， 不会因为共享引用而导致其他方块的形状意外改变。
 *
 * @example
 *   const piece = randomShape();
 *   // piece = {
 *   //   shape: [[0, 1, 0], [1, 1, 1]],
 *   //   color: "#00c8ff"
 *   // }
 *
 * @function randomShape
 * @returns {object} 随机选中的方块对象
 * @returns {number[][]} Returns.shape - 方块形状矩阵（深拷贝）
 * @returns {string} Returns.color - 方块颜色值（如 "#00c8ff"）
 */
const randomShape = () => {
  // 生成 0 ~ 方块总数之间的随机整数作为索引
  const index = Math.floor(Math.random() * SHAPES.length);
  const piece = SHAPES[index];

  // 返回随机选中的方块，深拷贝形状矩阵避免共享引用
  return {
    ...piece,
    shape: piece.shape.map((row) => [...row]),
  };
};

export default randomShape;
