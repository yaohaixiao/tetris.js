import pause from '@/lib/game/core/pause.js';
import resume from '@/lib/game/core/resume.js';
import { BattleEvents } from '@/lib/events/event-catalog.js';

/**
 * # 切换游戏暂停/继续状态
 *
 * 根据当前游戏模式，在 playing 和 paused 之间切换。 这是一个双向切换函数，相当于"暂停/继续"按钮的逻辑。
 *
 * ## 切换规则
 *
 * | 当前模式     | 操作 | 目标模式  |
 * | ------------ | ---- | --------- |
 * | `playing`    | 暂停 | `paused`  |
 * | `paused`     | 继续 | `playing` |
 * | `main-menu`  | 禁止 | —         |
 * | `difficulty` | 禁止 | —         |
 * | `replay`     | 禁止 | —         |
 * | `game-over`  | 禁止 | —         |
 *
 * ## 禁止场景
 *
 * - **主菜单**（main-menu）：未开始游戏，无需暂停
 * - **难度选择**（difficulty）：配置阶段，无需暂停
 * - **回放中**（replay）：回放不可暂停
 * - **游戏结束**（game-over）：游戏已结束，无法暂停
 *
 * ## 调用时机
 *
 * - 玩家按 P 键（键盘）
 * - 玩家按 Y 键（手柄）
 * - AI 执行 TOGGLE_PAUSED 命令
 *
 * @function togglePause
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const togglePause = (runtime) => {
  const { Store } = runtime;
  const mode = Store.getMode();

  /**
   * ======== 模式检查 ========
   *
   * 主菜单、难度选择、回放、游戏结束状态下禁止暂停/继续。
   */
  if (mode === 'main-menu' || mode === 'replay' || mode === 'game-over') {
    return;
  }

  const events = BattleEvents();

  /**
   * ======== 双向切换 ========
   *
   * Playing → paused：调用 pause() 暂停游戏 paused → playing：调用 resume() 恢复游戏
   */
  if (mode === 'playing') {
    pause(runtime);

    if (runtime.isVersus()) {
      runtime.emit(events.SYNC_PAUSE, { from: runtime });
    }
  } else {
    resume(runtime);
    if (runtime.isVersus()) {
      runtime.emit(events.SYNC_RESUME, { from: runtime });
    }
  }
};

export default togglePause;
