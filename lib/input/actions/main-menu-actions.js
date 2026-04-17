import startGame from '../../core/start-game.js';
import updateLevel from '../../core/update-level.js';

const ACTION_MAP = {
  LEVEL_ONE: () => {
    updateLevel(1);
  },
  LEVEL_TWO: () => {
    updateLevel(2);
  },
  LEVEL_THREE: () => {
    updateLevel(3);
  },
  LEVEL_FOUR: () => {
    updateLevel(4);
  },
  LEVEL_FIVE: () => {
    updateLevel(5);
  },
  LEVEL_SIX: () => {
    updateLevel(6);
  },
  LEVEL_SEVEN: () => {
    updateLevel(7);
  },
  LEVEL_EIGHT: () => {
    updateLevel(8);
  },
  LEVEL_NINE: () => {
    updateLevel(9);
  },
  LEVEL_TEN: () => {
    updateLevel(10);
  },
  CONFIRM: startGame,
};

const mainMenuActions = (action) => {
  const handler = ACTION_MAP[action];

  handler?.();
};

export default mainMenuActions;
