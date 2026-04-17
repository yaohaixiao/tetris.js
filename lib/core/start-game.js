import GameState from '../state/game-state.js';
import startCountdown from '../controllers/countdown-controller.js';

/**
 * # 开始游戏
 *
 * 从等级选择界面进入倒计时界面
 *
 * @function startGame
 * @returns {void}
 */
const startGame = () => {
  // 记录初始等级的基准行数，用于后续计算等级提升
  GameState.baseLines = (GameState.level - 1) * 10;

  // 进入倒计时界面
  startCountdown();
};

export default startGame;
