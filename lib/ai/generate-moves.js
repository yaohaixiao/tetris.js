import rotateMatrix from '@/lib/ai/rotate-matrix.js';
import simulateDrop from '@/lib/ai/simulate-drop.js';

const generateMoves = ({ board, piece }) => {
  const moves = [];

  let { shape } = piece;

  for (let rotation = 0; rotation < 4; rotation += 1) {
    const width = shape[0].length;

    for (let x = 0; x <= board[0].length - width; x += 1) {
      const result = simulateDrop(board, shape, x);

      const actions = [];

      for (let r = 0; r < rotation; r += 1) {
        actions.push('ROTATE');
      }

      const delta = x - piece.position.x;

      if (delta < 0) {
        for (let i = 0; i < Math.abs(delta); i += 1) {
          actions.push('MOVE_LEFT');
        }
      }

      if (delta > 0) {
        for (let i = 0; i < delta; i += 1) {
          actions.push('MOVE_RIGHT');
        }
      }

      actions.push('DROP');

      moves.push({
        board: result.board,
        actions,
      });
    }

    shape = rotateMatrix(shape);
  }

  return moves;
};

export default generateMoves;
