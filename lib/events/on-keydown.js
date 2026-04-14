import GameState from '../state/game-state.js';
import Effects from '../ui/effects.js';
import drawBoard from '../ui/draw-board.js';
import drawCurr from '../ui/draw-curr.js';
import executeLevelSelectRelatedCommands from '../commands/execute-level-selection-command.js';
import executeReturnToLevelSelectionCommand from '../commands/execute-return-to-level-selection-command.js';
import executeShortcutsCommands from '../commands/execute-shortcuts-commands.js';
import executeDirectionControlCommands from '../commands/execute-direction-control-commands.js';

/**
 * # 游戏主键盘事件处理器（统一分发所有按键操作）
 *
 * 根据当前游戏状态，分发到对应逻辑：等级选择、游戏结束、全局快捷键、游戏操控
 *
 * @function onKeydown
 * @param {KeyboardEvent} e - 键盘事件对象
 * @returns {boolean} 是否阻止后续操作
 */
const onKeydown = (e) => {
  // 获取按下的键名与小写键名
  const { key } = e;
  const lowerKey = key.toLowerCase();

  // 倒计时界面和升级特效界面禁止操作
  if (Effects.countdown.show || Effects.levelUp.show) {
    return false;
  }

  // 1. 等级选择界面操作
  if (GameState.isSelectLevel) {
    executeLevelSelectRelatedCommands(key);

    return false;
  }

  // 2. 游戏结束状态：按 Enter 返回主菜单
  if (GameState.isGameOver) {
    executeReturnToLevelSelectionCommand(key);
    return false;
  }

  // 3. 全局快捷键（M/R/Q/P）优先处理
  if (executeShortcutsCommands(lowerKey)) {
    return false;
  }

  // 4. 暂停状态：不响应游戏操作
  if (GameState.isPaused) {
    return false;
  }

  // 5. 正常游戏：处理方向键/空格操控
  executeDirectionControlCommands(key);

  // 重新绘制游戏界面
  drawBoard(GameState.board);
  drawCurr(GameState.curr, GameState.cx, GameState.cy);
};

export default onKeydown;
