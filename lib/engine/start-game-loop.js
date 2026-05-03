import CommandQueue from '@/lib/core/command/command-queue.js';
import Engine from '@/lib/engine';
import Game from '@/lib/game';
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
  }

  const { Animations, dispatchInput } = Engine;
  const { store } = Game;
  const stepDelta = timestamp - Engine.accumulator;
  let delta = (timestamp - Engine.timestamp) / 1000;

  // 1. 防止“死亡 spiral”（切后台回来卡死）
  if (delta > 1000) {
    delta = 1000;
  }

  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = Game.getSpeed();

  Engine.timestamp = timestamp;

  // 2. replay 注入
  if (Replay.playing) {
    const { data } = Replay;
    const { length } = data;
    const currentElapsed = Date.now() - Replay.startTime;

    // 判断回放是否播放完毕
    if (length > 0 && Replay.cursor >= length) {
      // 1. 切换模式回 game-over 或是你期望的界面
      store.setMode('game-over');

      // 2. 停止播放状态
      Replay.stopPlay();
    }

    while (
      Replay.playing &&
      Replay.cursor < data.length &&
      data[Replay.cursor].ms <= currentElapsed
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
    Input.Gamepad.update();
  }

  // 4. 执行输入
  CommandQueue.flush({
    Game,
    Audio,
  });

  // 5. 游戏逻辑
  if ((!Engine.accumulator || stepDelta > dropInterval) && !Replay.playing) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    Game.tick();
    Engine.accumulator = timestamp;
  }

  // 6. 更新（每帧）
  Animations.update(delta);

  // 7. 渲染游戏界面
  UI.render(store.getState());

  // 8. 叠加动画
  Animations.render();

  // 继续下一帧
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
