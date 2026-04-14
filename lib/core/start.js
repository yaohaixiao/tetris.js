import GameState from '../state/game-state.js';
import triggerCountdownEffect from '../ui/trigger-countdown-effect.js';

/**
 * # 开始游戏
 *
 * 从等级选择界面进入倒计时界面
 *
 * @function start
 * @returns {void}
 */
const start = () => {
  // 退出等级选择状态，进入游戏主界面
  GameState.isSelectLevel = false;
  // 记录初始等级的基准行数，用于后续计算等级提升
  GameState.baseLines = (GameState.level - 1) * 10;

  // 进入倒计时界面
  triggerCountdownEffect();
};

export default start;
