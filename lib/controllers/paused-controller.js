import { registerAnimation } from '../animations/system.js';
import PausedAnimation from '../animations/paused-animation.js';

let animation = null;

export const startPaused = () => {
  if (animation) {
    return;
  }

  animation = new PausedAnimation();

  // 注册动画
  registerAnimation(animation);
};

export const stopPaused = () => {
  if (!animation) {
    return;
  }

  // 让 animations system 自动移除
  animation.update = () => false;

  animation = null;
};
