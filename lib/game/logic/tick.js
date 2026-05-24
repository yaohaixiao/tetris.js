import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';
import { AudioEvents, GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 游戏逻辑帧（Tick）
 *
 * 游戏主循环中每一逻辑帧执行的核心逻辑： 自动下落、碰撞检测、锁定方块、消行、生成新方块。
 *
 * ## 执行流程
 *
 * | 步骤 | 条件                                | 操作                                       |
 * | ---- | ----------------------------------- | ------------------------------------------ |
 * | 1    | mode 不是 playing/replay 或动画阻塞 | 退出，不执行下落                           |
 * | 2    | mode 是 playing                     | 发送 AUTO_TICK 命令（用于回放录制）        |
 * | 3    | 尝试下移一格                        | 调用 `move(game, 0, 1)`                    |
 * | 4    | 下移成功                            | 本次 tick 结束，等待下次调用               |
 * | 5    | 下移失败（碰撞）                    | 锁定 → 落地高亮 → 音效 → 消行 → 生成新方块 |
 *
 * ## 锁定后流程
 *
 * 当方块无法继续下移时，依次执行：
 *
 * 1. `lock()` — 将方块固化到棋盘
 * 2. `START_LANDING_FLASH` — 触发落地高亮动画
 * 3. `FALL` 音效 — 播放落地音效
 * 4. `clearLines()` — 检测满行并启动消行动画
 * 5. `spawn()` — 生成下一个活动方块
 *
 * ## 为什么 playing 模式要发送 AUTO_TICK？
 *
 * 通过 `dispatch:input` 发送 `AUTO_TICK` 命令， 让自动下落也被回放系统录制。
 * 回放时只需重放录制的命令即可还原游戏过程，无需实时计算下落。
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

  /**
   * ======== 步骤 1：模式检查 ========
   *
   * 仅在 playing 或 replay 模式下执行下落。 动画阻塞期间（消行、倒计时、升级特效）也不执行。
   */
  if ((mode !== 'playing' && mode !== 'replay') || isBlocked) {
    return;
  }

  /**
   * ======== 步骤 2：回放录制 ========
   *
   * Playing 模式下发送 AUTO_TICK 命令， 让自动下落也被回放系统录制。
   */
  if (mode === 'playing') {
    runtime.emit('dispatch:input', {
      device: 'replay',
      action: 'AUTO_TICK',
      payload: {
        Game: runtime,
      },
    });
  }

  const AE = AudioEvents();
  const GE = GameEvents(runtime.id);
  const { curr, cx, cy } = runtime.Store.getState();

  /**
   * ======== 步骤 3：尝试下移 ========
   *
   * 向下移动一格。move 返回 true 表示移动成功， 本次 tick 结束，等待下次调用。
   */
  if (!move(runtime, 0, 1)) {
    /**
     * ======== 步骤 5：锁定流程 ========
     *
     * 无法下移（触底或碰撞）时执行完整的锁定和后续流程。
     */

    // 5a. 锁定方块到棋盘
    lock(runtime);

    // 5b. 落地高亮动画
    runtime.emit(GE.START_LANDING_FLASH, {
      piece: { shape: curr.shape, cx, cy },
    });

    // 5c. 播放落地音效
    runtime.emit(AE.PLAY_SOUND, { sound: 'FALL' });

    // 5d. 检测满行并启动消行动画
    clearLines(runtime);

    // 5e. 生成下一个活动方块
    spawn(runtime);
  }
};

export default tick;
