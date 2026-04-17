import { registerAnimation } from '../animations/system.js';
import ClearLinesAnimation from '../animations/clear-lines-animation.js';

const startClearLines = (lines) => {
  registerAnimation(new ClearLinesAnimation(lines));
};

export default startClearLines;
