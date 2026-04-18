import GameState from '@/lib/game/state/game-state.js';
import getGameStateMode from '@/lib/game/state/get-game-state-mode.js';
import renderMainMenu from '@/lib/ui/render-main-menu.js';
import renderActiveOnly from '@/lib/ui/render-active-only.js';
import renderNextPiece from '@/lib/ui/render-next-piece.js';

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
