import mainMenuActions from '@/lib/input/actions/main-menu-actions.js';
import gamePlayingActions from '@/lib/input/actions/game-playing-actions.js';
import gameOverActions from '@/lib/input/actions/game-over-actions.js';

const InputRoutes = {
  'main-menu': mainMenuActions,
  playing: gamePlayingActions,
  paused: () => {},
  'game-over': gameOverActions,
};

export default InputRoutes;
