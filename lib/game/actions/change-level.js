import GameState from '@/lib/game/state/game-state.js';
import Sounds from '@/lib/audio/sounds.js';
import renderMainMenu from '@/lib/ui/render-main-menu.js';

const changeLevel = (level) => {
  GameState.level = level;
  Sounds.levelSelect();
  renderMainMenu(level);
};

export default changeLevel;
