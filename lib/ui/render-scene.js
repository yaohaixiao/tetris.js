import GameState from '@/lib/game/state/game-state.js';
import getGameStateMode from '@/lib/game/state/get-game-state-mode.js';
import renderMainMenu from '@/lib/ui/render-main-menu.js';
import renderActiveOnly from '@/lib/ui/render-active-only.js';
import renderNextPiece from '@/lib/ui/render-next-piece.js';
import renderGameOver from '@/lib/ui/render-game-over.js'

const renderScene = () => {
  const mode = getGameStateMode();
  const {
    level,
    next
  } = GameState;

  if (mode === 'main-menu') {
    renderMainMenu(level);
    return
  }

  if (mode === 'game-over') {
    renderGameOver();
    return
  }

  renderActiveOnly();
  renderNextPiece(next);
};

export default renderScene;
