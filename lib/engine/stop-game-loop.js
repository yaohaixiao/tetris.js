import EngineState from '@/lib/engine/state/engine-state.js';

const stopGameLoop = () => {
  if (!EngineState.rafId) {
    return;
  }

  cancelAnimationFrame(EngineState.rafId);
  EngineState.rafId = null;
  EngineState.timestamp = 0;
};

export default stopGameLoop;
