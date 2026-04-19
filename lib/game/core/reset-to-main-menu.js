import Engine from '@/lib/engine/engine.js';
import EngineState from '@/lib/engine/state/engine-state.js';
import resetBoard from '@/lib/engine/state/reset-board.js';
import stopBGM from '@/lib/audio/stop-bgm.js';
import renderHud from '@/lib/ui/hud/render-hud.js';

/**
 * @function resetToMainMenu
 * @param {object} [state=EngineState] - 游戏状态. Default is `EngineState`
 */
const resetToMainMenu = (state = EngineState) => {
  // 停止背景音乐
  stopBGM();

  // 清除游戏主循环
  Engine.start();

  // 重置游戏棋盘
  resetBoard();
  // 重置所有游戏状态
  Engine.setMode('main-menu');
  state.score = 0;
  state.lines = 0;
  state.level = 1;
  state.next = null;

  // 更新分数、等级等 UI 显示
  renderHud(state.score, state.lines, state.level, state.highScore);
};

export default resetToMainMenu;
