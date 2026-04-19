import Engine from '@/lib/engine/engine.js';
import EngineState from '@/lib/engine/state/engine-state.js';
import scenes from '@/lib/ui/scenes/index.js';

const renderScene = (state = EngineState) => {
  const mode = Engine.getMode();
  const scene = scenes[mode];

  if (!scene) {
    return;
  }

  scene(state);
};

export default renderScene;
