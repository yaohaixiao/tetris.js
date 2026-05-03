import Game from '@/lib/game';
import Replay from '@/lib/runtime/replay-runtime.js';
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
  if (mode === 'main-menu' || mode === 'replay' || mode === 'game-over') {
    return false;
  }

  // 执行暂停逻辑
  if (mode === 'playing') {
    if (Replay.recording) {
      // 记下暂停开始的时间
      Replay.pauseStartTime = Date.now();
    }

    pause();
  } else {
    if (Replay.recording && Replay.pauseStartTime > 0) {
      // 累加本次暂停持续了多少毫秒
      Replay.totalPausedTime += Date.now() - Replay.pauseStartTime;
      // 重置
      Replay.pauseStartTime = 0;
    }

    // 执行继续游戏逻辑
    play();
  }
};

export default togglePause;
