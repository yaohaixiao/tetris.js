import COLORS from '../constants/colors.js';
import Canvas from './canvas.js';
import Effects from './effects.js';
import Sounds from '../audio/sounds.js';
import stopBGM from '../audio/stop-bgm.js';

/**
 * # 触发升级庆祝特效
 *
 * @function triggerLevelUpEffect
 * @returns {void}
 */
export function triggerLevelUpEffect() {
  const { FIREWORKS } = COLORS;
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;
  const effect = Effects.levelUp;
  // 生成一批烟花
  const fireworks = [];

  effect.show = true;
  effect.timer = 0;

  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 240;

    fireworks.push({
      // 全部从中心点出发
      x: width / 2,
      y: height / 2 - 60,
      radius: 2 + Math.random() * 4,
      color: FIREWORKS[Math.floor(Math.random() * 6)],
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
    });
  }

  effect.fireworks = fireworks;

  stopBGM();
  // 播放升级的音乐
  Sounds.levelUp();
}

export default triggerLevelUpEffect;
