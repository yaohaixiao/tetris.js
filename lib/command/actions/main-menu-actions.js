import startGame from '@/lib/game/core/start-game.js';
import selectLevel from '@/lib/game/actions/select-level.js';

const MAIN_MENU_ACTIONS = {
  LEVEL_ONE: (_, engine) => {
    selectLevel(1, engine.state);
  },
  LEVEL_TWO: (_, engine) => {
    selectLevel(2, engine.state);
  },
  LEVEL_THREE: (_, engine) => {
    selectLevel(3, engine.state);
  },
  LEVEL_FOUR: (_, engine) => {
    selectLevel(4, engine.state);
  },
  LEVEL_FIVE: (_, engine) => {
    selectLevel(5, engine.state);
  },
  LEVEL_SIX: (_, engine) => {
    selectLevel(6, engine.state);
  },
  LEVEL_SEVEN: (_, engine) => {
    selectLevel(7, engine.state);
  },
  LEVEL_EIGHT: (_, engine) => {
    selectLevel(8, engine.state);
  },
  LEVEL_NINE: (_, engine) => {
    selectLevel(9, engine.state);
  },
  LEVEL_TEN: (_, engine) => {
    selectLevel(10, engine.state);
  },
  CONFIRM: (_, engine) => {
    startGame(engine.state);
  },
};

export default MAIN_MENU_ACTIONS;
