import EngineState from '@/lib/engine/state/engine-state.js';
import { updateAnimations, renderAnimations } from '@/lib/animations/system.js';
import getSpeed from '@/lib/game/logic/get-speed.js';
import stepGame from '@/lib/game/core/step-game.js';
import renderScene from '@/lib/ui/render-scene.js';

/**
 * # 带速度控制的游戏主循环
 *
 * 只有达到指定时间间隔才执行下落逻辑
 *
 * @function startGameLoop
 * @param {number} timestamp - 时间戳数值
 * @returns {void}
 */
const startGameLoop = (timestamp) => {
  if (!EngineState.timestamp) {
    EngineState.timestamp = timestamp;
  }

  const delta = (timestamp - EngineState.timestamp) / 1000;
  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = getSpeed();

  EngineState.timestamp = timestamp;

  // 1. 更新动画（每帧）
  updateAnimations(delta);

  if (
    !EngineState.accumulator ||
    timestamp - EngineState.accumulator > dropInterval
  ) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    stepGame();
    EngineState.accumulator = timestamp;
  }

  // 3. 渲染
  renderScene();
  // 叠加动画
  renderAnimations();

  // 继续下一帧
  EngineState.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
