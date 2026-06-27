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
 * | 2    | 硬降计分     | 下落格数 × 2 分              |
 * | 3    | 锁定方块     | 将方块固化到棋盘上           |
 * | 4    | 落地高亮     | 触发落地高亮动画（150ms）    |
 * | 5    | 播放落地音效 | 触发 FALL 音效               |
 * | 6    | 消行检测     | 检查并消除满行（带动画）     |
 * | 7    | 生成新方块   | 生成下一个活动方块           |
 * | 8    | 播放完成音效 | 触发 DROP 音效               |
 *
 * ## 锁定后流程
 *
 * 方块触底后依次执行：
 *
 * 1. `lock()` — 将方块固化到棋盘，深拷贝棋盘并写入方块颜色
 * 2. `START_LANDING_FLASH` — 触发落地高亮动画（150ms 白色闪烁）
 * 3. `FALL` 音效 — 播放落地音效
 * 4. `clearLines()` — 检测满行并启动消行动画（含 T-Spin 检测）
 * 5. `spawn()` — 生成下一个活动方块，从 7-bag 中取出
 * 6. `DROP` 音效 — 播放硬降完成音效
 *
 * ## 与普通下落（tick）的区别
 *
 * | 方法     | 行为           | 触发方式                 |
 * | -------- | -------------- | ------------------------ |
 * | `tick()` | 每次只下落一格 | 自动（定时器）或手动按 ↓ |
 * | `drop()` | 直接落到最底部 | 手动按空格键或 AI 决策   |
 *
 * ## AI 调用路径
 *
 * AI 通过 `GAME_PLAYING_ACTIONS.DROP` 触发：
 *
 * AIController.loop() → emit(DISPATCH_INPUT) → Engine._onDispatchInput →
 * dispatchInput() → CommandQueue.enqueue() → flush() → cmd.execute() →
 * emit(DISPATCH_COMMAND) → dispatchCommand() → GAME_PLAYING_ACTIONS.DROP →
 * emit(BLOCK_DROP) → GameRouter._onBlockDrop → Game.drop()
 *
 * @function drop
 * @param {object} runtime - 游戏运行时对象（Game 实例）
 * @returns {void}
 */
const drop = (runtime) => {
  const { Store } = runtime;

  /*
   * ==================== 步骤 1：循环下移 ====================
   *
   * 记录起始 Y 坐标，用于后续计分。
   * 不断向下移动方块（ox=0, oy=1），直到 move 返回 false（触底或碰撞）。
   * isHardDrop=true 表示硬降模式，下落时不加分（后面统一按格数计分）。
   */
  const startY = Store.getState().cy;

  while (true) {
    if (!move(runtime, 0, 1, true)) {
      break;
    }
  }

  /*
   * ==================== 步骤 2：硬降计分 ====================
   *
   * 硬降奖励 = 下落格数 × 2 分。
   * 例如方块从顶部（cy=0）落到第 18 行，奖励 36 分。
   * 这是对玩家快速决策的额外奖励，鼓励积极操作。
   */
  const state = Store.getState();
  const endY = state.cy;
  const cellsDropped = endY - startY;
  Store.setState({ score: state.score + cellsDropped * 2 });

  const AE = AudioEvents();
  const GE = GameEvents(runtime.id);
  const { curr, cx, cy } = runtime.Store.getState();

  /*
   * ==================== 步骤 3：锁定方块 ====================
   *
   * 将方块固化到棋盘上：
   * - 深拷贝当前棋盘（structuredClone）
   * - 将方块每个格子的颜色值写入棋盘对应位置
   * - 检测 T-Spin（T 块旋转后锁定）
   * - 更新 Store 中的棋盘状态
   * - Battle 模式下触发 FLUSH_GARBAGE 事件
   */
  lock(runtime);

  /*
   * ==================== 步骤 4：落地高亮 ====================
   *
   * 触发 LandingFlashAnimation（150ms 白色闪烁）。
   * 在落地格子上短暂显示半透明白色高亮，提供视觉反馈。
   */
  runtime.emit(GE.START_LANDING_FLASH, {
    piece: { shape: curr.shape, cx, cy },
  });

  /*
   * ==================== 步骤 5：播放落地音效 ====================
   *
   * 180Hz 低频音效，模拟方块落地的沉重感。
   */
  runtime.emit(AE.PLAY_SOUND, { sound: 'FALL' });

  /*
   * ==================== 步骤 6：消行检测 ====================
   *
   * 从底部向顶部逐行检查是否填满（board[y].every(cell => !!cell)）。
   * 如果检测到满行，触发 ClearLinesAnimation（闪烁动画 + 消行音效）。
   * 实际的消行、计分、升级检查在动画结束后的 dispose 中执行。
   */
  clearLines(runtime);

  /*
   * ==================== 步骤 7：生成新方块 ====================
   *
   * 从预览队列（7-bag）中取出下一个方块：
   * - 将 next 提升为 curr（深拷贝形状矩阵）
   * - 随机生成新的 next（根据当前等级匹配配色方案）
   * - 居中放置在棋盘顶部（cx 居中，cy=0）
   * - 检测出生点碰撞（碰撞则 Game Over）
   * - 通知 UI 更新预览方块显示
   */
  spawn(runtime);

  /*
   * ==================== 步骤 8：播放硬降完成音效 ====================
   *
   * 220Hz 低频音效，与落地音效区分，表示一次完整的硬降操作结束。
   */
  runtime.emit(AE.PLAY_SOUND, { sound: 'DROP' });
};

export default drop;
