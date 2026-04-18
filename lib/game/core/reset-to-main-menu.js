import GameState from '../../game/state/game-state.js';
import setGameStateMode from '../state/set-game-state-mode.js';
import resetBoard from '../state/reset-board.js';
import stopBGM from '../../audio/stop-bgm.js';
import renderMainMenu from '../../ui/render-main-menu.js';
import updateHUD from '../../ui/update-hud.js';
import startGameLoop from '../../engine/start-game-loop.js';

const resetToMainMenu = () => {
  // 停止背景音乐
  stopBGM();

  // 清除游戏主循环
  GameState.rafId = requestAnimationFrame(startGameLoop);

  // 重置游戏棋盘
  resetBoard();
  // 重置所有游戏状态
  setGameStateMode('main-menu');
  GameState.score = 0;
  GameState.lines = 0;
  GameState.level = 1;
  GameState.next = null;

  // 绘制等级选择界面
  renderMainMenu(GameState.level);
  // 更新分数、等级等 UI 显示
  updateHUD(
    GameState.score,
    GameState.lines,
    GameState.level,
    GameState.highScore,
  );
};

export default resetToMainMenu;
