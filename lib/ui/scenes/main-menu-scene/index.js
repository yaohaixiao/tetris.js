import GameState from '@/lib/game/state/game-state.js';
import renderMainMenu from '@/lib/ui/scenes/main-menu-scene/render-main-menu.js';

const mainMenuScene = () => {
  renderMainMenu(GameState.level);
};

export default mainMenuScene;
