import Game from '@/lib/game';
import startCountdown from '@/lib/controllers/countdown-controller.js';

/**
 * # 开始游戏
 *
 * 从等级选择界面进入倒计时界面
 *
 * @function start
 * @returns {void}
 */
const start = () => {
  const level = Game.store.getLevel();
  const lines = (level - 1) * 10;

  // 记录初始等级的基准行数，用于后续计算等级提升
  Game.store.setBaseLines(lines);

  // 进入倒计时界面
  startCountdown();
};

export default start;
