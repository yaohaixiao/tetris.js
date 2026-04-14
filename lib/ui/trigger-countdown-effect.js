import Sounds from '../audio/sounds.js';
import Effects from './effects.js';
import updateCountdownEffect from './update-countdown-effect.js';

/**
 * # 触发倒计时
 *
 * 显示 3 2 1 倒计时动画界面，播放倒计时音效
 *
 * @function triggerCountdownEffect
 * @returns {void}
 */
export function triggerCountdownEffect() {
  const effect = Effects.countdown;

  effect.show = true;
  effect.number = 3;
  effect.scale = 4;
  effect.count = 0;
  effect.rafId = requestAnimationFrame(updateCountdownEffect);
  effect.timestamp = 0;

  Sounds.countdown();
}

export default triggerCountdownEffect;
