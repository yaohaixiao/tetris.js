import GameState from '../state/game-state.js';

/**
 * # 方块落地锁定
 *
 * 将当前正在下落的方块，永久绘制到游戏棋盘上 锁定后方块无法再移动，成为棋盘的一部分
 *
 * @function lock
 * @returns {void}
 */
const lock = () => {
  const { curr } = GameState;
  // 获取当前方块的形状矩阵
  const s = curr.shape;

  // 遍历方块的每一格
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      // 如果当前格子有方块（非空），就将颜色写入棋盘
      if (s[y][x]) {
        GameState.board[GameState.cy + y][GameState.cx + x] = curr.color;
      }
    }
  }
};

export default lock;
