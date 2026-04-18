import GameState from '@/lib/game/state/game-state.js';
import Sounds from '@/lib/audio/sounds.js';

const changeLevel = (level) => {
  GameState.level = level;
  Sounds.levelSelect();
};

export default changeLevel;
