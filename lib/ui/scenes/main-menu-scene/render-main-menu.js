import Canvas from '@/lib/ui/core/canvas.js';
import clearBoard from '@/lib/ui/board/clear-board.js';
import renderTetrisText from '@/lib/ui/text/render-tetris-text.js';
import renderLevelText from '@/lib/ui/text/render-level-text.js';
import renderLevelNumber from '@/lib/ui/text/render-level-number.js';
import renderLevelShortcut from '@/lib/ui/text/render-level-shortcut.js';
import renderEnterStartText from '@/lib/ui/text/render-enter-start-text.js';
import renderOverlay from '@/lib/ui/overlay/render-overlay.js';
import renderSceneBackground from '@/lib/ui/image/render-scene-background.js';

/**
 * # 渲染主菜单（难度选择界面）
 *
 * 该函数负责绘制游戏主菜单 UI，包括：
 *
 * - 半透明背景遮罩
 * - 游戏标题（TETRIS.JS）
 * - LEVEL 标题
 * - 当前选中等级数字
 * - 操作提示（1-9 / T KEY）
 * - ENTER START 提示
 *
 * UI 结构层级：
 *
 * 1. 清屏
 * 2. 背景遮罩
 * 3. 标题区域
 * 4. 等级选择区域
 * 5. 操作提示
 * 6. 开始提示
 *
 * @function renderMainMenu
 * @param {number} level - 当前游戏等级
 * @returns {void}
 */
const renderMainMenu = (level) => {
  const { gameBoard, gameBoardContext } = Canvas;
  const { height } = gameBoard;

  // ======== 1. 清空画布 ========
  clearBoard(gameBoard, gameBoardContext);

  // ======== 2. 背景遮罩 ========
  renderOverlay();

  renderSceneBackground('main-menu');

  // ======== 3. 游戏标题 ========
  renderTetrisText();

  // ======== 4. LEVEL 标题 ========
  renderLevelText();

  // ======== 5. 当前等级数字 ========
  renderLevelNumber(level, height * 0.5);

  // ======== 6. 操作提示 ========
  renderLevelShortcut();

  // ======== 7. 开始提示 ========
  renderEnterStartText();
};

export default renderMainMenu;
