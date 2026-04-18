import EngineState from '@/lib/engine/state/engine-state.js';
import GameState from '@/lib/game/state/game-state.js';
import bindEvents from '@/lib/input/bind-events.js';
import resetBoard from '@/lib/game/state/reset-board.js';
import loadHighScore from '@/lib/game/state/load-high-score.js';
import setGameStateMode from '@/lib/game/state/set-game-state-mode.js';
import resize from '@/lib/ui/resize.js';
import renderScene from '@/lib/ui/render-scene.js';
import updateHUD from '@/lib/ui/update-hud.js';
import lazyRenderMainMenu from '@/lib/ui/lazy-render-main-menu.js';
import startGameLoop from '@/lib/engine/start-game-loop.js';

/**
 * # 游戏主函数（页面加载时执行）
 *
 * 重置棋盘、加载数据、设置初始状态、适配窗口、绑定事件
 *
 * @function main
 * @returns {void}
 */
const main = () => {
  // 初始化空游戏棋盘
  resetBoard();
  // 从本地存储加载历史最高分
  loadHighScore();
  // 设置游戏状态：初始化状态 - main-menu
  setGameStateMode('main-menu');
  // 初始化游戏基础状态
  GameState.score = 0;
  GameState.lines = 0;
  GameState.level = 1;

  renderScene();
  // 执行窗口自适应，让画布适配屏幕
  resize();
  // 更新分数、等级、行数等 UI 展示
  updateHUD(
    GameState.score,
    GameState.lines,
    GameState.level,
    GameState.highScore,
  );
  // 延迟绘制选择级别界面
  lazyRenderMainMenu();

  // 绑定键盘、窗口等所有游戏事件
  bindEvents();

  EngineState.rafId = requestAnimationFrame(startGameLoop);
};

export default main;
