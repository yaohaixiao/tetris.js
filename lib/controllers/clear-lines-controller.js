import Engine from '@/lib/engine/engine.js';
import { registerAnimation } from '@/lib/animations/system.js';
import ClearLinesAnimation from '@/lib/animations/clear-lines-animation.js';

const startClearLines = (lines) => {
  registerAnimation(new ClearLinesAnimation(lines, Engine.state));
};

export default startClearLines;
