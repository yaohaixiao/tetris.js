import restartGame from '../core/restart-game.js';
import togglePause from '../core/toggle-pause.js';
import forceOver from '../ui/force-over.js';
import toggleBGM from '../audio/toggle-bgm.js';

/**
 * # 处理全局快捷键（M/R/Q/P）
 *
 * @function executeShortcutsCommands
 * @param {string} key - 转小写后的按键
 * @returns {boolean} 是否触发了快捷键
 */
const executeShortcutsCommands = (key) => {
  // 全局快捷操作映射
  const commands = {
    m: toggleBGM, // M: 切换背景音乐
    r: restartGame, // R: 重新开始游戏
    q: forceOver, // Q: 强制结束游戏
    p: togglePause, // P: 暂停/继续游戏
  };
  const command = commands[key];

  if (command) {
    command();
    return true;
  }

  return false;
};

export default executeShortcutsCommands;
