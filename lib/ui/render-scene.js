import GameState from '../game/state/game-state.js';
import getGameStateMode from '../game/state/get-game-state-mode.js';
import renderMainMenu from './render-main-menu.js';
import renderActiveOnly from './render-active-only.js';
import renderNextPiece from './render-next-piece.js';

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
