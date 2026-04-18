import startGame from '@/lib/game/core/start-game.js';
import changeLevel from '@/lib/game/actions/change-level.js';

const ACTION_MAP = {
  LEVEL_ONE: () => {
    changeLevel(1);
  },
  LEVEL_TWO: () => {
    changeLevel(2);
  },
  LEVEL_THREE: () => {
    changeLevel(3);
  },
  LEVEL_FOUR: () => {
    changeLevel(4);
  },
  LEVEL_FIVE: () => {
    changeLevel(5);
  },
  LEVEL_SIX: () => {
    changeLevel(6);
  },
  LEVEL_SEVEN: () => {
    changeLevel(7);
  },
  LEVEL_EIGHT: () => {
    changeLevel(8);
  },
  LEVEL_NINE: () => {
    changeLevel(9);
  },
  LEVEL_TEN: () => {
    changeLevel(10);
  },
  CONFIRM: startGame,
};

const mainMenuActions = (action) => {
  const handler = ACTION_MAP[action];

  handler?.();
};

export default mainMenuActions;
