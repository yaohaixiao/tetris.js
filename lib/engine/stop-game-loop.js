import Engine from '@/lib/engine/engine.js';

const stopGameLoop = () => {
  if (!Engine.rafId) {
    return;
  }

  cancelAnimationFrame(Engine.rafId);

  Engine.rafId = null;
  Engine.timestamp = 0;
  Engine.accumulator = 0;
};

export default stopGameLoop;
