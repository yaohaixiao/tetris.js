import Engine from '@/lib/engine/engine.js';
import getSpeed from '@/lib/game/logic/get-speed.js';
import stepGame from '@/lib/game/core/step-game.js';
import CommandQueue from '@/lib/command/command-queue.js';

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
  if (!Engine.timestamp) {
    Engine.timestamp = timestamp;
  }

  const delta = (timestamp - Engine.timestamp) / 1000;
  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = getSpeed(Engine.state);

  Engine.timestamp = timestamp;

  CommandQueue.flush(Engine);

  // 1. 更新动画（每帧）
  Engine.update(delta);

  if (!Engine.accumulator || timestamp - Engine.accumulator > dropInterval) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    stepGame(Engine.state);
    Engine.accumulator = timestamp;
  }

  // 3. 渲染
  Engine.render();
  // 叠加动画
  Engine.animate();

  // 继续下一帧
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
