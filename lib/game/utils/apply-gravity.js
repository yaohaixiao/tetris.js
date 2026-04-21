// utils/apply-gravity.js
const applyGravity = (board) => {
  const ROWS = board.length;
  const COLS = board[0].length;

  let moved = false;

  for (let x = 0; x < COLS; x++) {
    const stack = [];

    // 收集这一列的方块
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y][x]) {
        stack.push(board[y][x]);
      }
    }

    // 回填
    for (let y = ROWS - 1; y >= 0; y--) {
      const val = stack.shift() || 0;
      if (board[y][x] !== val) {
        moved = true;
      }
      board[y][x] = val;
    }
  }

  return moved;
};

export default applyGravity;
