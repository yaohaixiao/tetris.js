import Engine from '@/lib/engine/engine.js';
import EngineState from '@/lib/engine/state/engine-state.js';
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
 * @param {object} [state=EngineState] - 游戏状态. Default is `EngineState`
 * @returns {void}
 */
const restartGame = (state = EngineState) => {
  const mode = Engine.getMode();

  if (mode === 'paused' || mode === 'game-over' || mode === 'main-menu') {
    return;
  }

  // 停止当前背景音乐
  stopBGM();

  // 重置核心游戏状态
  Engine.setMode('playing');
  state.score = 0;
  state.lines = 0;
  state.level = 1;
  // 重置游戏棋盘为空
  Engine.resetBoard();

  // 刷新分数、等级、行数等 UI 显示
  renderHud(state.score, state.lines, state.level, state.highScore, true);

  // 生成第一个新方块
  spawn(state);
  // 重启背景音乐
  playBGM();
  // 启动游戏主循环（方块自动下落）
  Engine.restart();
};

export default restartGame;
