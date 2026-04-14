import GameState from '../state/game-state.js';

/**
 * # 停止长按 P 键计时
 *
 * 松开按键时清除计时器，不触发隐藏模式
 *
 * @function stopHiddenMode
 * @returns {void}
 */
const stopHiddenMode = () => {
  // 清除长按计时器
  clearTimeout(GameState.holdTimer);
  GameState.holdTimer = null;
};

export default stopHiddenMode;
