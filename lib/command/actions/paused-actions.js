import togglePause from '@/lib/game/core/toggle-pause.js';

const PAUSED_ACTIONS = {
  TOGGLE_PAUSE: () => {
    togglePause();
  },
};

export default PAUSED_ACTIONS;
