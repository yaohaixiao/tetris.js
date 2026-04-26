import Engine from '@/lib/engine/engine.js';
import Replay from '@/lib/engine/replay.js';
import CommandQueue from '@/lib/command/command-queue.js';
import Command from '@/lib/command/command.js';
import getSpeed from '@/lib/game/logic/get-speed.js';
import stepGame from '@/lib/game/core/step-game.js';

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

  const { state } = Engine;
  const stepDelta = timestamp - Engine.accumulator;
  let delta = (timestamp - Engine.timestamp) / 1000;

  // 防止“死亡 spiral”（切后台回来卡死）
  if (delta > 1000) {
    delta = 1000;
  }

  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = getSpeed(state);

  Engine.timestamp = timestamp;

  // 1. replay 注入
  if (Replay.playing) {
    const { data } = Replay;

    while (
      Replay.cursor < data.length &&
      data[Replay.cursor].frame === Replay.frame
    ) {
      const item = data[Replay.cursor];
      CommandQueue.enqueue(new Command(item.cmd.type, item.cmd.payload));
      Replay.cursor++;
    }
  }

  // 2. 执行输入
  CommandQueue.flush(Engine);

  // 3. 更新（每帧）
  Engine.update(delta);

  // 4. 帧推进
  Replay.frame++;

  // 5. 游戏逻辑
  if (!Engine.accumulator || stepDelta > dropInterval) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    stepGame(state);
    Engine.accumulator = timestamp;
  }

  // 7. 渲染
  Engine.render();
  // 叠加动画
  Engine.animate();

  // 继续下一帧
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
