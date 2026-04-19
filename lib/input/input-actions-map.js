import mainMenuActions from '@/lib/command/actions/main-menu-actions.js';
import gamePlayingActions from '@/lib/command/actions/game-playing-actions.js';
import gameOverActionsMap from '@/lib/command/actions/game-over-actions.js';

const InputActionsMap = {
  'main-menu': mainMenuActions,
  playing: gamePlayingActions,
  paused: () => {},
  'game-over': gameOverActionsMap,
};

export default InputActionsMap;
