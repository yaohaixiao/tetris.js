import Game from '@/lib/game';
import play from '@/lib/game/core/play.js';
import pause from '@/lib/game/core/pause.js';

/**
 * # 切换游戏暂停 / 继续状态
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function togglePause
 * @returns {boolean | undefined} 无效状态时返回 false
 */
const togglePause = () => {
  const mode = Game.store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode === 'game-over' || mode === 'main-menu') {
    return false;
  }

  // 执行暂停逻辑
  if (mode === 'playing') {
    pause();
  } else {
    // 执行继续游戏逻辑
    play();
  }
};

export default togglePause;
