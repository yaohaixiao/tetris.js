import GameState from '../state/game-state.js';
import resetBoard from '../state/reset-board.js';
import loadHighScore from '../state/load-high-score.js';
import resize from '../ui/resize.js';
import updateUI from '../ui/update-ui.js';
import lazyDrawLevelSelect from '../ui/lazy-draw-level-select.js';
import bindEvents from './bind-events.js';

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

  // 初始化游戏基础状态
  GameState.score = 0;
  GameState.lines = 0;
  GameState.level = 1;
  GameState.isGameOver = false;
  GameState.isPaused = false;
  GameState.isHiddenMode = false;
  GameState.isSelectLevel = true;

  // 执行窗口自适应，让画布适配屏幕
  resize();
  // 更新分数、等级、行数等 UI 展示
  updateUI(
    GameState.score,
    GameState.lines,
    GameState.level,
    GameState.highScore,
  );
  // 延迟绘制选择级别界面
  lazyDrawLevelSelect();
  // 绑定键盘、窗口等所有游戏事件
  bindEvents();
};

export default main;
