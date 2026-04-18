import scenes from '@/lib/ui/scenes/index.js';
import getGameStateMode from '@/lib/game/state/get-game-state-mode.js';

const renderScene = () => {
  const mode = getGameStateMode();
  const scene = scenes[mode];

  if (!scene) {
    return;
  }

  scene();
};

export default renderScene;
