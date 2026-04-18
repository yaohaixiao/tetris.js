import GameState from '@/lib/game/state/game-state.js';
import setGameStateMode from '@/lib/game/state/set-game-state-mode.js';
import resetBoard from '@/lib/game/state/reset-board.js';
import stopBGM from '@/lib/audio/stop-bgm.js';
import renderHud from '@/lib/ui/hud/render-hud.js';
import startGameLoop from '@/lib/engine/start-game-loop.js';

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

  // 更新分数、等级等 UI 显示
  renderHud(
    GameState.score,
    GameState.lines,
    GameState.level,
    GameState.highScore,
  );
};

export default resetToMainMenu;
