import Engine from '@/lib/engine';
import Replay from '@/lib/engine/replay';
import CommandQueue from '@/lib/engine/command/command-queue.js';
import Command from '@/lib/engine/command/command.js';

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

  const { Game } = Engine;
  const stepDelta = timestamp - Engine.accumulator;
  let delta = (timestamp - Engine.timestamp) / 1000;

  // 防止“死亡 spiral”（切后台回来卡死）
  if (delta > 1000) {
    delta = 1000;
  }

  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = Game.getSpeed();

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

  // 3. 游戏逻辑
  if (!Engine.accumulator || stepDelta > dropInterval) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    Game.tick();
    Engine.accumulator = timestamp;
  }

  // 4. 更新（每帧）
  Engine.update(delta);

  // 5. 帧推进
  Replay.frame++;

  // 6. 渲染游戏界面
  Engine.render();

  // 7. 叠加动画
  Engine.animate();

  // 继续下一帧
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
