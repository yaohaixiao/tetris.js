import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';
import { AudioEvents } from '@/lib/events/event-catalog.js';

/**
 * # 游戏逻辑帧（Tick）
 *
 * 游戏主循环中每一逻辑帧执行的核心逻辑： 自动下落、碰撞检测、锁定方块、消行、生成新方块。
 *
 * ## 执行流程
 *
 * | 步骤 | 条件                                | 操作                                |
 * | ---- | ----------------------------------- | ----------------------------------- |
 * | 1    | mode 不是 playing/replay 或动画阻塞 | 退出，不执行下落                    |
 * | 2    | mode 是 playing                     | 发送 AUTO_TICK 命令（用于回放录制） |
 * | 3    | 尝试下移一格                        | 调用 `move(game, 0, 1)`             |
 * | 4    | 下移成功                            | 本次 tick 结束，等待下次调用        |
 * | 5    | 下移失败（碰撞）                    | 锁定 → 消行 → 生成新方块            |
 *
 * ## 为什么 playing 模式要发送 AUTO_TICK？
 *
 * 在 playing 模式下，通过 `dispatch:input` 发送 `AUTO_TICK` 命令， 目的是让自动下落也被回放系统录制。
 * 这样回放时不需要实时计算下落，只需重放录制的命令即可还原游戏过程。
 *
 * ## 调用时机
 *
 * 由 `startGameLoop` 中的固定时间步长逻辑调用：
 *
 *     if (stepDelta > Game.getSpeed() && !Replay.playing) {
 *       Game.tick(isBlocked);
 *     }
 *
 * ## 与其他下落方式的区别
 *
 * | 方法               | 行为                         | 触发方式           |
 * | ------------------ | ---------------------------- | ------------------ |
 * | `tick()`           | 每次下落一格，碰底则锁定     | 自动（定时器驱动） |
 * | `move(game, 0, 1)` | 每次下落一格，碰底返回 false | 手动按 ↓ 键        |
 * | `drop()`           | 直接落到底部                 | 手动按空格键       |
 *
 * @function tick
 * @param {object} runtime - 游戏运行时对象
 * @param {boolean} isBlocked - 是否被动画阻塞（消行特效、倒计时等期间为 true）
 * @returns {void}
 */
const tick = (runtime, isBlocked) => {
  const mode = runtime.Store.getMode();

  // 游戏不在进行中或回放中，或者动画阻塞 → 不执行下落
  if ((mode !== 'playing' && mode !== 'replay') || isBlocked) {
    return;
  }

  // playing 模式下发送 AUTO_TICK 命令，用于回放录制
  if (mode === 'playing') {
    runtime.emit('dispatch:input', {
      device: 'replay',
      action: 'AUTO_TICK',
      payload: {
        Game: runtime,
      },
    });
  }

  const events = AudioEvents();

  // 尝试向下移动一格
  if (!move(runtime, 0, 1)) {
    // 无法下移（触底或碰撞）→ 锁定方块
    lock(runtime);

    // 播放方块落地音效
    runtime.emit(events.PLAY_SOUND, { sound: 'FALL' });

    // 检测并消除满行（带动画特效）
    clearLines(runtime);

    // 生成下一个活动方块
    spawn(runtime);
  }
};

export default tick;
