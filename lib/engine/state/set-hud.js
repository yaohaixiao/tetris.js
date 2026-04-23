import Engine from '@/lib/engine/engine.js';
import setLevel from '@/lib/engine/state/set-level.js';

const setHud = (hud) => {
  const { state } = Engine;
  const { score, lines, level } = hud;

  state.score = score;
  state.lines = lines;
  setLevel(level);
};

export default setHud;
