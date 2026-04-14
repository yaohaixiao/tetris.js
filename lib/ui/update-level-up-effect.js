import Effects from './effects.js';
import playBGM from '../audio/play-bgm.js';

/**
 * # 更新升级动画帧
 *
 * @function updateLevelUpEffect
 * @returns {boolean} 动画是否结束
 */
const updateLevelUpEffect = () => {
  const effect = Effects.levelUp;

  effect.timer += 1;

  // 动画持续约 3 秒
  if (effect.timer > 3) {
    effect.show = false;
    effect.fireworks = [];
    playBGM();

    return true;
  }

  return false;
};

export default updateLevelUpEffect;
