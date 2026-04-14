import GameState from '../state/game-state.js';
import Sounds from '../audio/sounds.js';
import Effects from './effects.js';
import drawPause from './draw-pause.js';

const updateDrawPause = (timestamp) => {
  const { isPaused } = GameState;
  const effect = Effects.clock;

  if (!isPaused) {
    return false;
  }

  if (!effect.timestamp || timestamp - effect.timestamp > 100) {
    drawPause();
    effect.count += 1;

    if (effect.count >= 50) {
      effect.count = 0;
      Sounds.secondTick();
    }
  }

  effect.rafId = requestAnimationFrame(updateDrawPause);
};

export default updateDrawPause;
