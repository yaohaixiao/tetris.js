import play from '@/lib/game/core/play.js';
import pause from '@/lib/game/core/pause.js';

/**
 * # 切换游戏暂停 / 继续状态
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function togglePause
 * @param context - 执行上下文对象
 * @returns {void}
 */
const togglePause = (context) => {
  const mode = context.Store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode === 'main-menu' || mode === 'replay' || mode === 'game-over') {
    return;
  }

  // 执行暂停逻辑
  if (mode === 'playing') {
    pause(context);
  } else {
    // 执行继续游戏逻辑
    play(context);
  }
};

export default togglePause;
