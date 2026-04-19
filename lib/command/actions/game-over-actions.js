import resetToMainMenu from '@/lib/game/core/reset-to-main-menu.js';

const GAME_OVER_ACTIONS = {
  CONFIRM: (_, engine) => {
    resetToMainMenu(engine.state);
  },
};

export default GAME_OVER_ACTIONS;
