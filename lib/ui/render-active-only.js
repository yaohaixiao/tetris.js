import GameState from '../state/game-state.js';
import renderBoard from '../ui/render-board.js';
import renderActivePieces from '../ui/render-active-pieces.js';

const renderActiveOnly = () => {
  renderBoard(GameState.board);

  if (GameState.curr) {
    renderActivePieces(GameState.curr, GameState.cx, GameState.cy);
  }
};

export default renderActiveOnly;
