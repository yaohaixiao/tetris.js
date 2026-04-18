import GameState from '@/lib/game/state/game-state.js';
import renderBoard from '@/lib/ui/render-board.js';
import renderActivePieces from '@/lib/ui/render-active-pieces.js';

const renderActiveOnly = () => {
  renderBoard(GameState.board);

  if (GameState.curr) {
    renderActivePieces(GameState.curr, GameState.cx, GameState.cy);
  }
};

export default renderActiveOnly;
