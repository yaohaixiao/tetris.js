import EngineState from '@/lib/engine/state/engine-state.js';
import renderBoard from '@/lib/ui/board/render-board.js';
import renderActivePieces from '@/lib/ui/board/render-active-pieces.js';

const renderActiveOnly = (state = EngineState) => {
  const { board, curr, cx, cy } = state;

  if (board) {
    renderBoard(board);
  }

  if (curr) {
    renderActivePieces(curr, cx, cy);
  }
};

export default renderActiveOnly;
