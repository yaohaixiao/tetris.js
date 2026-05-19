import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderLevelText from '@/lib/services/ui/text/render-level-text.js';
import renderLevelNumber from '@/lib/services/ui/text/render-level-number.js';
import renderLevelShortcut from '@/lib/services/ui/text/render-level-shortcut.js';
import renderEnterContinueText from '../../text/render-enter-continue-text.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';

/**
 * # 渲染主菜单（等级选择界面）
 *
 * 绘制游戏主菜单的完整 UI，包括背景遮罩、标题、 当前选中等级数字和操作提示。
 *
 * ## 渲染层级（从底到顶）
 *
 * | 层级 | 操作                        | 说明                              |
 * | ---- | --------------------------- | --------------------------------- |
 * | 1    | `clearBoard()`              | 清空画布                          |
 * | 2    | `renderOverlay()`           | 半透明遮罩层                      |
 * | 3    | `renderSceneBackground()`   | 绘制主菜单场景背景                |
 * | 4    | `renderTetrisText()`        | 绘制 "TETRIS" 标题文字            |
 * | 5    | `renderLevelText()`         | 绘制 "LEVEL" 标题                 |
 * | 6    | `renderLevelNumber()`       | 绘制当前选中等级数字              |
 * | 7    | `renderLevelShortcut()`     | 绘制操作快捷键提示（1-9 / T KEY） |
 * | 8    | `renderEnterContinueText()` | 绘制 "按回车键继续" 提示          |
 *
 * @function renderMainMenu
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {number} level - 当前游戏等级
 * @returns {void}
 */
const renderMainMenu = (canvas, level) => {
  const { gameBoard } = canvas;
  const { height } = gameBoard;

  // ======== 1. 清空画布 ========
  clearBoard(canvas);

  // ======== 2. 半透明遮罩层 ========
  renderOverlay(canvas);

  // ======== 3. 绘制主菜单场景背景 ========
  renderSceneBackground(canvas, 'main-menu');

  // ======== 4. 游戏标题 "TETRIS" ========
  renderTetrisText(canvas);

  // ======== 5. "LEVEL" 标题 ========
  renderLevelText(canvas);

  // ======== 6. 当前选中等级数字（垂直位置为画布高度的 50%） ========
  renderLevelNumber(canvas, level, height * 0.5);

  // ======== 7. 操作快捷键提示（1-9 / T KEY） ========
  renderLevelShortcut(canvas);

  // ======== 8. "按回车键继续" 提示 ========
  renderEnterContinueText(canvas);
};

export default renderMainMenu;
