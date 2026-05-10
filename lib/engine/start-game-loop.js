import CommandQueue from '@/lib/core/command/command-queue.js';
import Game from '@/lib/game';
import Engine from '@/lib/engine';
import UI from '@/lib/services/ui';

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

  const { Gamepad, Keyboard, Animations } = Engine;
  const { Replay } = Game;
  const stepDelta = timestamp - Engine.accumulator;
  const prev = Engine.timestamp ?? timestamp;
  let delta = (timestamp - prev) / 1000;

  // 1. 防止“死亡 spiral”（切后台回来卡死）
  if (delta > 1000) {
    delta = 1000;
  }

  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = Game.getSpeed();

  Engine.timestamp = timestamp;

  const isBlocked = Animations.hasBlocking();

  /*
   * 优化回放性能：
   *
   * 给 playElapsed 也加一个 delta 上限，
   * 保证切换TAB后回来游戏界面平滑加速追赶，不会爆
   */
  Replay.syncPlayElapsed({
    timestamp: Engine.timestamp,
    isBlocked,
  });

  // 2. replay update input（永远跑）
  Replay.update({
    getSpeed: Game.getSpeed,
    timestamp: Engine.timestamp,
  });

  // 3. 键盘/手柄获取游戏状态
  Keyboard.update(Game.store.getState());
  Gamepad.update(Game.store.getState());

  // 4. 执行输入
  CommandQueue.flush();

  // 5. 游戏逻辑 && !Replay.playing
  if ((!Engine.accumulator || stepDelta > dropInterval) && !Replay.playing) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    Game.tick(isBlocked);

    Engine.accumulator = timestamp;
  }

  // 6. 更新（每帧）
  Animations.update(delta);

  // 8. 更新Hud动画
  UI.tickHud(delta);

  // 7. 渲染游戏界面
  UI.render(Game.store.getState());

  // 9. 叠加动画
  Animations.render();

  // 继续下一帧
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
