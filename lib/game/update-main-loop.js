import GameState from '../state/game-state.js';
import getSpeed from './get-speed.js';
import loop from './loop.js';

/**
 * # 带速度控制的游戏主循环
 *
 * 只有达到指定时间间隔才执行下落逻辑
 *
 * @function updateMainLoop
 * @param {number} timestamp - 时间戳数值
 * @returns {void}
 */
const updateMainLoop = (timestamp) => {
  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = getSpeed();

  // 达到时间间隔才下落
  if (!GameState.timestamp || timestamp - GameState.timestamp > dropInterval) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    loop();
    GameState.timestamp = timestamp;
  }

  // 继续下一帧
  GameState.rafId = requestAnimationFrame(updateMainLoop);
};

export default updateMainLoop;
