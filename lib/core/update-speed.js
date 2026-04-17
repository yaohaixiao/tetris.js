import EngineState from '../state/engine-state.js';
import startGameLoop from '../engine/start-game-loop.js';
import stopGameLoop from '../engine/stop-game-loop.js';

/**
 * # 更新游戏下落速度
 *
 * 清除原有游戏循环定时器，并根据当前等级设置新地下落速度 通常在消行升级、游戏重新开始时调用
 *
 * @function updateSpeed
 * @returns {void}
 */
const updateSpeed = () => {
  // 清除之前的游戏循环定时器，防止多个定时器同时运行
  stopGameLoop();

  // 设置新的 requestAnimationFrame
  EngineState.rafId = requestAnimationFrame(startGameLoop);
};

export default updateSpeed;
