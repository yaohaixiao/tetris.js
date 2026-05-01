import SHAPES from '../constants/shapes.js';
/**
 * # 随机生成下一个方块类型
 *
 * 从 Shapes 方块库中，随机返回一种方块的数据（形状 + 颜色） 用于游戏生成新方块时调用，保证随机性
 *
 * @function randomShape
 * @returns {object} - 随机选中的方块对象（包含 shape 形状、color 颜色）
 */
export function randomShape() {
  // 生成 0 ~ 方块总数 之间的随机整数，作为索引
  const index = Math.floor(Math.random() * SHAPES.length);
  const piece = SHAPES[index];

  // 返回随机选中的方块
  return {
    ...piece,
    shape: piece.shape.map((row) => [...row]),
  };
}

export default randomShape;
