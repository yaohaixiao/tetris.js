import EngineState from '@/lib/engine/state/engine-state.js';
import startCountdown from '@/lib/controllers/countdown-controller.js';

/**
 * # 开始游戏
 *
 * 从等级选择界面进入倒计时界面
 *
 * @function startGame
 * @param {object} [state=EngineState] - 游戏状态. Default is `EngineState`
 * @returns {void}
 */
const startGame = (state = EngineState) => {
  // 记录初始等级的基准行数，用于后续计算等级提升
  state.baseLines = (state.level - 1) * 10;

  // 进入倒计时界面
  startCountdown();
};

export default startGame;
