import CommandQueue from '@/lib/core/command/command-queue.js';
import Game from '@/lib/game';
import Engine from '@/lib/engine';
import Audio from '@/lib/services/audio';
import UI from '@/lib/services/ui';
import Input from '@/lib/services/input';
import Replay from '@/lib/runtime/replay-runtime.js';

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
    Engine.accumulator = timestamp;
  }

  const { Animations } = Engine;
  const stepDelta = timestamp - Engine.accumulator;
  const prev = Engine.timestamp ?? timestamp;
  let delta = (timestamp - prev) / 1000;

  // 1. 防止“死亡 spiral”（切后台回来卡死）
  if (delta > 1000) {
    delta = 1000;
  }

  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = Game.getSpeed();
  const context = {
    Engine,
    Game,
    Audio,
  };

  Engine.timestamp = timestamp;

  // && !Animations.hasBlocking()
  if (Replay.playing) {
    Replay.playElapsed = Engine.timestamp - Replay.startTime;
  }

  // 2. replay update input（永远跑）
  Replay.update(context);

  // 3. 手柄获取按键
  Input.Gamepad.update();

  // 4. 执行输入
  CommandQueue.flush(context);

  // 5. 游戏逻辑
  if ((!Engine.accumulator || stepDelta > dropInterval) && !Replay.playing) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    Game.tick();
    Engine.accumulator = timestamp;
  }

  // 6. 更新（每帧）
  Animations.update(delta);

  // 7. 渲染游戏界面
  UI.render(Game.store.getState());

  // 8. 叠加动画
  Animations.render();

  // 继续下一帧
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
