import GameState from '@/lib/game/state/game-state.js';
import renderBoard from '@/lib/ui/board/render-board.js';
import renderActivePieces from '@/lib/ui/board/render-active-pieces.js';

const renderActiveOnly = () => {
  const { board, curr, cx, cy } = GameState;

  if (board) {
    renderBoard(board);
  }

  if (curr) {
    renderActivePieces(curr, cx, cy);
  }
};

export default renderActiveOnly;
