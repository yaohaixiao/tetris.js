import Engine from '@/lib/engine/engine';
import { registerAnimation } from '@/lib/animations/system.js';
import CountdownAnimation from '@/lib/animations/countdown-animation.js';

const startCountdown = () => {
  registerAnimation(CountdownAnimation(Engine.state));
};

export default startCountdown;
