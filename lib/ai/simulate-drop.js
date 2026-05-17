import cloneBoard from '@/lib/ai/clone-board.js';
import collision from '@/lib/ai/collision.js';

const simulateDrop = (board, shape, startX) => {
  let y = 0;

  while (!collision(board, shape, startX, y + 1)) {
    y += 1;
  }

  const nextBoard = cloneBoard(board);

  for (let py = 0; py < shape.length; py += 1) {
    for (let px = 0; px < shape[py].length; px += 1) {
      if (!shape[py][px]) {
        continue;
      }

      nextBoard[y + py][startX + px] = 1;
    }
  }

  return {
    board: nextBoard,
    y,
  };
};

export default simulateDrop;
