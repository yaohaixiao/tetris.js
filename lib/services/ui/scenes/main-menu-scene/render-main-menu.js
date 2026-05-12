import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderLevelText from '@/lib/services/ui/text/render-level-text.js';
import renderLevelNumber from '@/lib/services/ui/text/render-level-number.js';
import renderLevelShortcut from '@/lib/services/ui/text/render-level-shortcut.js';
import renderEnterContinueText from '../../text/render-enter-continue-text.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';

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
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {number} level - 当前游戏等级
 * @returns {void}
 */
const renderMainMenu = (canvas, level) => {
  const { gameBoard } = canvas;
  const { height } = gameBoard;

  // ======== 1. 清空画布 ========
  clearBoard(canvas);

  // ======== 2. 背景遮罩 ========
  renderOverlay(canvas);

  renderSceneBackground(canvas, 'main-menu');

  // ======== 3. 游戏标题 ========
  renderTetrisText(canvas);

  // ======== 4. LEVEL 标题 ========
  renderLevelText(canvas);

  // ======== 5. 当前等级数字 ========
  renderLevelNumber(canvas, level, height * 0.5);

  // ======== 6. 操作提示 ========
  renderLevelShortcut(canvas);

  // ======== 7. 开始提示 ========
  renderEnterContinueText(canvas);
};

export default renderMainMenu;
