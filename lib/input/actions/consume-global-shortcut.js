import restartGame from '@/lib/game/core/restart-game.js';
import gameOver from '@/lib/game/core/game-over.js';
import togglePause from '@/lib/game/core/toggle-pause.js';
import toggleBGM from '@/lib/audio/toggle-bgm.js';
import getGameStateMode from '@/lib/game/state/get-game-state-mode.js';

// 操作映射
const ACTION_MAP = {
  // R: 重新开始游戏
  RESTART: restartGame,
  // Q: 强制结束游戏
  QUIT: gameOver,
  // P: 暂停/继续游戏
  TOGGLE_PAUSE: togglePause,
  // M: 切换背景音乐
  TOGGLE_MUSIC: toggleBGM,
};

/**
 * # 处理全局快捷键（M/R/Q/P）
 *
 * @function consumeGlobalShortcut
 * @param {string} action - 操作名称
 * @returns {boolean} 是否触发了快捷键
 */
const consumeGlobalShortcut = (action) => {
  const handler = ACTION_MAP[action];
  const mode = getGameStateMode();

  if (mode === 'main-menu') {
    return false;
  }

  if (handler) {
    handler();
    return true;
  }

  return false;
};

export default consumeGlobalShortcut;
