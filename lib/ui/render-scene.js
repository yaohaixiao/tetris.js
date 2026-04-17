import GameState from '../state/game-state.js';

import renderMainMenu from './render-main-menu.js';
import renderActiveOnly from './render-active-only.js';
import renderNextPiece from './render-next-piece.js';
import getGameStateMode from '../state/get-game-state-mode.js';

const renderScene = () => {
  const mode = getGameStateMode();
  const { level, next } = GameState;

  if (mode === 'game-over' || mode === 'main-menu') {
    renderMainMenu(level);
  } else {
    renderActiveOnly();
    renderNextPiece(next);
  }
};

export default renderScene;
