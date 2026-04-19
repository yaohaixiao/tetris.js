import Engine from '@/lib/engine/engine.js';
import scenes from '@/lib/ui/scenes/index.js';

const renderScene = (state) => {
  const mode = Engine.getMode();
  const scene = scenes[mode];

  if (!scene) {
    return;
  }

  scene(state);
};

export default renderScene;
