import MAIN_MENU_ACTIONS from '@/lib/command/actions/main-menu-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/command/actions/game-playing-actions.js';
import PAUSED_ACTIONS from '@/lib/command/actions/paused-actions.js';
import GAME_OVER_ACTIONS from '@/lib/command/actions/game-over-actions.js';

const ACTIONS_MAP = {
  'main-menu': MAIN_MENU_ACTIONS,
  playing: GAME_PLAYING_ACTIONS,
  paused: PAUSED_ACTIONS,
  'game-over': GAME_OVER_ACTIONS,
};

const dispatchCommand = (cmd, engine) => {
  const { type, payload } = cmd;
  const mode = engine.getMode();
  const actions = ACTIONS_MAP[mode];

  if (!actions) {
    return;
  }

  const handler = actions[type];

  handler?.(payload, engine);
};

export default dispatchCommand;
