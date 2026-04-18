import { registerAnimation } from '@/lib/animations/system.js';
import CountdownAnimation from '@/lib/animations/countdown-animation.js';

const startCountdown = () => {
  registerAnimation(CountdownAnimation());
};

export default startCountdown;
