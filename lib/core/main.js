import GameState from '../state/game-state.js';
import EngineState from '../state/engine-state.js';
import resetBoard from '../state/reset-board.js';
import loadHighScore from '../state/load-high-score.js';
import setGameStateMode from '../state/set-game-state-mode.js';
import resize from '../ui/resize.js';
import renderScene from '../ui/render-scene.js';
import updateHUD from '../ui/update-hud.js';
import lazyRenderMainMenu from '../ui/lazy-render-main-menu.js';
import bindEvents from './bind-events.js';
import startGameLoop from '../engine/start-game-loop.js';

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
