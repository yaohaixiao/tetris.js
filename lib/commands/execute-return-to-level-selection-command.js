import GameState from '../state/game-state.js';
import resetBoard from '../state/reset-board.js';
import stopBGM from '../audio/stop-bgm.js';
import drawLevelSelect from '../ui/draw-level-select.js';
import updateUI from '../ui/update-ui.js';

const executeReturnToLevelSelectionCommand = (key) => {
  if (key === 'Enter') {
    // 停止背景音乐
    stopBGM();

    // 清除游戏主循环
    cancelAnimationFrame(GameState.rafId);
    // 重置游戏棋盘
    resetBoard();

    // 重置所有游戏状态
    GameState.isGameOver = false;
    GameState.isHiddenMode = false;
    // 进入等级选择界面
    GameState.isSelectLevel = true;
    GameState.score = 0;
    GameState.lines = 0;
    GameState.level = 1;
    GameState.next = null;

    // 更新分数、等级等 UI 显示
    updateUI(
      GameState.score,
      GameState.lines,
      GameState.level,
      GameState.highScore,
    );

    // 绘制等级选择界面
    drawLevelSelect(GameState.level);
  }
};

export default executeReturnToLevelSelectionCommand;
