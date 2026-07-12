import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';
import { AudioEvents, GameEvents } from '@/lib/events/event-catalog.js';

/**
 * 锁定延迟（毫秒）：方块触底后可继续滑动的时间。
 *
 * 在高速阶段给予玩家额外的操作窗口， 触底后仍可移动或旋转方块，直到计时器累计超过此阈值。
 *
 * @constant {number}
 */
const LOCK_DELAY = 300;

/**
 * ============================================================
 *
 * # 游戏逻辑帧
 *
 * ============================================================
 *
 * 游戏主循环中每一逻辑帧执行的核心逻辑： 自动下落、碰撞检测、锁定方块、消行、生成新方块。
 *
 * ## 执行流程
 *
 * | 步骤 | 条件                                | 操作                                |
 * | :--- | :---------------------------------- | :---------------------------------- |
 * | 1    | mode 不是 playing/replay 或动画阻塞 | 退出，不执行下落                    |
 * | 2    | mode 是 playing                     | 发送 AUTO_TICK 命令（用于回放录制） |
 * | 3    | 尝试下移一格                        | 调用 move(game, 0, 1)               |
 * | 4    | 下移成功                            | 重置锁定延迟，本次 tick 结束        |
 * | 5    | 下移失败（碰撞）                    | 累加锁定延迟 → 超时后锁定           |
 *
 * ## 锁定延迟
 *
 * 方块触底后不会立即锁定，而是累加计时器 curr._lockTimer。 每次 tick 累加当前等级的下落间隔（getSpeed()）， 当累计超过
 * LOCK_DELAY（300ms）时才真正锁定。
 *
 * 移动或旋转成功会重置计时器，给予玩家更多操作时间。 这是高速阶段保持可操作性的关键机制。
 *
 * ## 锁定后流程
 *
 * 1. Lock() — 将方块固化到棋盘
 * 2. START_LANDING_FLASH — 触发落地高亮动画
 * 3. FALL 音效 — 播放落地音效
 * 4. ClearLines() — 检测满行并启动消行动画
 * 5. Spawn() — 生成下一个活动方块
 *
 * @function tick
 * @param {object} runtime - 游戏运行时对象
 * @param {boolean} isBlocked - 是否被动画阻塞
 * @returns {void}
 */
const tick = (runtime, isBlocked) => {
  const mode = runtime.Store.getMode();

  // 步骤 1：模式检查 — 非进行中/回放模式或动画阻塞期间不执行下落
  if ((mode !== 'playing' && mode !== 'replay') || isBlocked) {
    return;
  }

  const AE = AudioEvents();
  const GE = GameEvents(runtime.id);

  // 步骤 2：回放录制 — playing 模式下将自动下落记录到回放系统
  if (mode === 'playing') {
    runtime.emit(GE.DISPATCH_INPUT, {
      device: 'replay',
      action: 'AUTO_TICK',
      payload: { Game: runtime },
    });
  }

  const { curr, cx, cy } = runtime.Store.getState();

  // 步骤 3：尝试下移一格
  if (move(runtime, 0, 1)) {
    // 移动成功：重置锁定延迟计时器
    if (curr._lockTimer) {
      curr._lockTimer = 0;
    }
    return;
  }

  // 步骤 4：累加锁定延迟
  if (!curr._lockTimer) {
    curr._lockTimer = 0;
  }
  curr._lockTimer += runtime.getSpeed();

  // 步骤 5：超时锁定
  if (curr._lockTimer >= LOCK_DELAY) {
    curr._lockTimer = 0;

    // 锁定方块到棋盘
    lock(runtime);

    // 落地高亮动画
    runtime.emit(GE.START_LANDING_FLASH, {
      piece: { shape: curr.shape, cx, cy },
    });

    // 播放落地音效
    runtime.emit(AE.PLAY_SOUND, { sound: 'FALL' });

    // 检测满行并启动消行动画
    clearLines(runtime);

    // 生成下一个活动方块
    spawn(runtime);
  }
};

export default tick;
