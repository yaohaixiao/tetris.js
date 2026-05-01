import Game from '@/lib/game';

/**
 * # 方块落地锁定
 *
 * 将当前正在下落的方块，永久绘制到游戏棋盘上 锁定后方块无法再移动，成为棋盘的一部分
 *
 * @function lock
 * @returns {void}
 */
const lock = () => {
  const { store } = Game;
  const state = store.getState();
  const { curr } = state;
  // 获取当前方块的形状矩阵
  const s = curr.shape;
  const board = structuredClone(state.board);

  // 遍历方块的每一格
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      // 如果当前格子有方块（非空），就将颜色写入棋盘
      if (s[y][x]) {
        // 将颜色写入棋盘
        board[state.cy + y][state.cx + x] = curr.color;
        store.setState({
          board,
        });
      }
    }
  }
};

export default lock;
