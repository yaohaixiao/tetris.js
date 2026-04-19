import EngineState from '@/lib/engine/state/engine-state.js';
import renderMainMenu from '@/lib/ui/scenes/main-menu-scene/render-main-menu.js';

const mainMenuScene = (state = EngineState) => {
  renderMainMenu(state.level);
};

export default mainMenuScene;
