import { registerAnimation } from '../animations/system.js';
import CountdownAnimation from '../animations/countdown-animation.js';

const startCountdown = () => {
  registerAnimation(CountdownAnimation());
};

export default startCountdown;
