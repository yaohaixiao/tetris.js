import resetToMainMenu from '../../core/reset-to-main-menu.js';

const ACTION_MAP = {
  CONFIRM: resetToMainMenu,
};

const gameOverActions = (action) => {
  const handler = ACTION_MAP[action];

  handler?.();
};

export default gameOverActions;
