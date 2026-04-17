import GameState from '../state/game-state.js';
import Sounds from '../audio/sounds.js';
import renderMainMenu from '../ui/render-main-menu.js';

const updateLevel = (level) => {
  GameState.level = level;
  Sounds.levelSelect();
  renderMainMenu(level);
};

export default updateLevel;
