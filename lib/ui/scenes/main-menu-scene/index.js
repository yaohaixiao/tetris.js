import renderMainMenu from '@/lib/ui/scenes/main-menu-scene/render-main-menu.js';

const mainMenuScene = (state) => {
  renderMainMenu(state.level);
};

export default mainMenuScene;
