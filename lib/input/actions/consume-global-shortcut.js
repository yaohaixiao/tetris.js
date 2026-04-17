import restartGame from '../../core/restart-game.js';
import gameOver from '../../core/game-over.js';
import togglePause from '../../core/toggle-pause.js';
import toggleBGM from '../../audio/toggle-bgm.js';

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

  if (handler) {
    handler();
    return true;
  }

  return false;
};

export default consumeGlobalShortcut;
