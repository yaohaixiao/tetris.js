import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';
import { AudioEvents, GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 快速下落（硬降 / Hard Drop）
 *
 * 将方块瞬间直接落到底部，自动完成锁定、消行和生成新方块。 这是玩家最常用的操作之一（通常绑定空格键）。
 *
 * ## 执行流程
 *
 * | 步骤 | 操作         | 说明                         |
 * | ---- | ------------ | ---------------------------- |
 * | 1    | 循环下移     | 不断向下移动直到碰撞（触底） |
 * | 2    | 锁定方块     | 将方块固化到棋盘上           |
 * | 3    | 落地高亮     | 触发落地高亮动画             |
 * | 4    | 播放落地音效 | 触发 FALL 音效               |
 * | 5    | 消行检测     | 检查并消除满行（带动画）     |
 * | 6    | 生成新方块   | 生成下一个活动方块           |
 * | 7    | 播放完成音效 | 触发 DROP 音效               |
 *
 * ## 锁定后流程
 *
 * 方块触底后依次执行：
 *
 * 1. `lock()` — 将方块固化到棋盘
 * 2. `START_LANDING_FLASH` — 触发落地高亮动画（150ms 白色闪烁）
 * 3. `FALL` 音效 — 播放落地音效
 * 4. `clearLines()` — 检测满行并启动消行动画
 * 5. `spawn()` — 生成下一个活动方块
 * 6. `DROP` 音效 — 播放硬降完成音效
 *
 * ## 与普通下落（tick）的区别
 *
 * | 方法     | 行为           | 触发方式                 |
 * | -------- | -------------- | ------------------------ |
 * | `tick()` | 每次只下落一格 | 自动（定时器）或手动按 ↓ |
 * | `drop()` | 直接落到最底部 | 手动按空格键或 AI 决策   |
 *
 * @function drop
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const drop = (runtime) => {
  /**
   * ======== 步骤 1：循环下移 ========
   *
   * 不断向下移动方块，直到 move 返回 false（触底或碰撞）。
   */
  while (true) {
    if (!move(runtime, 0, 1)) {
      break;
    }
  }

  const AE = AudioEvents();
  const GE = GameEvents(runtime.id);
  const { curr, cx, cy } = runtime.Store.getState();

  /**
   * ======== 步骤 2：锁定方块 ========
   *
   * 将方块固化到棋盘上，成为棋盘的一部分。
   */
  lock(runtime);

  /**
   * ======== 步骤 3：落地高亮 ========
   *
   * 触发落地高亮动画，在落地格子上短暂显示半透明白色。
   */
  runtime.emit(GE.START_LANDING_FLASH, {
    piece: { shape: curr.shape, cx, cy },
  });

  /** ======== 步骤 4：播放落地音效 ======== */
  runtime.emit(AE.PLAY_SOUND, { sound: 'FALL' });

  /**
   * ======== 步骤 5：消行检测 ========
   *
   * 检测满行并触发消行动画。 实际的消行和分数更新在动画完成后的 dispose 中执行。
   */
  clearLines(runtime);

  /**
   * ======== 步骤 6：生成新方块 ========
   *
   * 生成下一个活动方块，重置 cx/cy 到初始位置。
   */
  spawn(runtime);

  /** ======== 步骤 7：播放硬降完成音效 ======== */
  runtime.emit(AE.PLAY_SOUND, { sound: 'DROP' });
};

export default drop;
