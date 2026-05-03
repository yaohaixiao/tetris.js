import Engine from '@/lib/engine';
import Replay from '@/lib/engine/replay';
import CommandQueue from '@/lib/engine/command/command-queue.js';
import dispatchInput from '@/lib/engine/dispatch-input.js';

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

  // 1. 帧推进
  if (Replay.playing || Replay.recording) {
    Replay.frame++;
  }

  // 2. replay 注入
  if (Replay.playing) {
    const { data } = Replay;
    const { length } = data;

    // 判断回放是否播放完毕
    if (length > 0 && Replay.cursor >= length) {
      // 1. 切换模式回 game-over 或是你期望的界面
      Game.store.setMode('game-over');

      // 2. 停止播放状态
      Replay.stopPlay();

      return;
    }

    while (
      Replay.cursor < data.length &&
      data[Replay.cursor].frame === Replay.frame
    ) {
      const record = data[Replay.cursor];
      const { cmd } = record;

      dispatchInput({
        device: 'replay',
        action: cmd.action,
        payload: cmd.payload,
      });

      Replay.cursor++;
    }
  }

  // 3. 禁用手柄
  if (!Replay.playing) {
    Engine.Gamepad.update();
  }

  // 4. 执行输入
  CommandQueue.flush(Engine);

  // 5. 游戏逻辑
  if ((!Engine.accumulator || stepDelta > dropInterval) && !Replay.playing) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    Game.tick();
    Engine.accumulator = timestamp;
  }

  // 6. 更新（每帧）
  Engine.update(delta);

  // 7. 渲染游戏界面
  Engine.render();

  // 8. 叠加动画
  Engine.animate();

  // 继续下一帧
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
