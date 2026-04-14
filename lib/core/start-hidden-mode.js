import GameState from '../state/game-state.js';
import drawLevelSelect from '../ui/draw-level-select.js';

/**
 * # 开始长按 P 键计时
 *
 * 长按 3 秒后触发隐藏模式，将等级强制设为 5
 *
 * @function startHold
 * @returns {void}
 */
const startHiddenMode = () => {
  // 开启 3 秒长按计时器，超时后进入隐藏模式
  GameState.holdTimer = setTimeout(() => {
    GameState.isHiddenMode = true;
    GameState.level = 5;

    drawLevelSelect(GameState.level);
  }, 3000);
};

export default startHiddenMode;
