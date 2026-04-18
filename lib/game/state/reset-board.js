import BOARD from '../../ui/constants/board.js';
import GameState from './game-state.js';

/**
 * # 重置游戏棋盘
 *
 * 初始化生成一个指定行数和列数的空棋盘，所有格子填充 0
 *
 * @function resetBoard
 * @returns {void}
 */
const resetBoard = () => {
  const { COLS, ROWS } = BOARD;

  // 创建 BOARD_ROWS 行 x BOARD_COLS 列的二维数组，初始值均为 0（空）
  GameState.board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }).fill(0),
  );
};

export default resetBoard;
