import Sounds from '../audio/sounds.js';
import Effects from './effects.js';
import drawCountdownEffect from './draw-countdown-effect.js';
import startGame from '../game/start-game.js';

/**
 * # 更新倒计时逻辑
 *
 * 绘制倒计时 3 2 1 动画界面
 *
 * @function updateCountdownEffect
 * @param {number} timestamp - 时间戳数值
 * @returns {boolean} - 执行结束返回 true
 */
export function updateCountdownEffect(timestamp) {
  const effect = Effects.countdown;

  if (!effect.timestamp || timestamp - effect.timestamp > 100) {
    drawCountdownEffect();

    effect.count += 1;
    // 缩放变小
    effect.scale = Math.max(1, effect.scale - 0.4);

    if (effect.count >= 50) {
      effect.count = 0;
      effect.number--;
      effect.scale = 4;

      if (effect.number >= 1) {
        Sounds.countdown();
      }
    }

    // 倒计时结束
    if (effect.number <= 0) {
      // 停止动画
      cancelAnimationFrame(effect.rafId);

      // 重置数据
      effect.show = false;
      effect.number = 3;
      effect.scale = 4;
      effect.count = 0;
      effect.rafId = null;
      effect.timestamp = 0;

      // 开始游戏
      startGame();

      return true;
    }
  }

  effect.rafId = requestAnimationFrame(updateCountdownEffect);
}

export default updateCountdownEffect;
