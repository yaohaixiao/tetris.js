import GameState from '@/lib/game/state/game-state.js';
import resetBoard from '@/lib/game/state/reset-board.js';
import setGameStateMode from '@/lib/game/state/set-game-state-mode.js';
import getGameStateMode from '@/lib/game/state/get-game-state-mode.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
import spawn from '@/lib/game/logic/spawn.js';
import stopBGM from '@/lib/audio/stop-bgm.js';
import playBGM from '@/lib/audio/play-bgm.js';
import renderHud from '@/lib/ui/hud/render-hud.js';

/**
 * # 重新开始游戏
 *
 * 重置所有游戏数据、清空棋盘、生成新方块，并重启游戏主循环与背景音乐
 *
 * @function restartGame
 * @returns {void}
 */
const restartGame = () => {
  const mode = getGameStateMode();

  if (mode === 'paused' || mode === 'game-over' || mode === 'main-menu') {
    return;
  }

  // 停止当前背景音乐
  stopBGM();

  // 重置核心游戏状态
  setGameStateMode('playing');
  GameState.score = 0;
  GameState.lines = 0;
  GameState.level = 1;
  // 重置游戏棋盘为空
  resetBoard();

  // 刷新分数、等级、行数等 UI 显示
  renderHud(
    GameState.score,
    GameState.lines,
    GameState.level,
    GameState.highScore,
    true,
  );

  // 生成第一个新方块
  spawn();
  // 重启背景音乐
  playBGM();
  // 启动游戏主循环（方块自动下落）
  restartGameLoop();
};

export default restartGame;
