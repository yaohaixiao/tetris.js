import TETROMINOES from '../constants/tetrominoes.js';
/**
 * # 随机生成下一个方块类型
 *
 * 从 TETROMINOES 方块库中，随机返回一种方块的数据（形状 + 颜色） 用于游戏生成新方块时调用，保证随机性
 *
 * @function randomTetromino
 * @returns {object} 随机选中的方块对象（包含 shape 形状、color 颜色）
 */
export function randomTetromino() {
  // 生成 0 ~ 方块总数 之间的随机整数，作为索引
  const randomIndex = Math.floor(Math.random() * TETROMINOES.length);

  // 返回随机选中的方块
  return TETROMINOES[randomIndex];
}

export default randomTetromino;
