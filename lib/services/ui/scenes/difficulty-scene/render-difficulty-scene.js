import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';
import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderDifficultyText from '@/lib/services/ui/text/render-difficulty-text.js';
import renderDifficultyWords from '@/lib/services/ui/text/render-difficult-words.js';
import renderDifficultyShortcut from '@/lib/services/ui/text/render-difficulty-shortcut.js';
import renderEnterStartText from '@/lib/services/ui/text/render-enter-start-text.js';

/**
 * # 渲染难度选择界面（Difficulty Scene）
 *
 * 绘制难度选择界面的完整 UI，包括背景遮罩、标题、 当前选中难度文字和操作提示。
 *
 * ## 渲染层级（从底到顶）
 *
 * | 层级 | 操作                         | 说明                     |
 * | ---- | ---------------------------- | ------------------------ |
 * | 1    | `clearBoard()`               | 清空画布                 |
 * | 2    | `renderOverlay()`            | 半透明遮罩层             |
 * | 3    | `renderSceneBackground()`    | 绘制主菜单场景背景       |
 * | 4    | `renderTetrisText()`         | 绘制 "TETRIS" 标题文字   |
 * | 5    | `renderDifficultyText()`     | 绘制 "DIFFICULTY" 标题   |
 * | 6    | `renderDifficultyWords()`    | 绘制当前选中的难度文字   |
 * | 7    | `renderDifficultyShortcut()` | 绘制操作快捷键提示       |
 * | 8    | `renderEnterStartText()`     | 绘制 "按回车键开始" 提示 |
 *
 * @function renderDifficultyScene
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 当前游戏状态（含 difficulty 字段）
 * @returns {void}
 */
const renderDifficultyScene = (canvas, state) => {
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

  // ======== 5. "DIFFICULTY" 标题 ========
  renderDifficultyText(canvas);

  // ======== 6. 当前选中难度文字（垂直位置为画布高度的 50%） ========
  renderDifficultyWords(canvas, state.difficulty, height * 0.5);

  // ======== 7. 操作快捷键提示（EASY / NORMAL / HARD / EXPERT） ========
  renderDifficultyShortcut(canvas, state);

  // ======== 8. "按回车键开始" 提示 ========
  renderEnterStartText(canvas);
};

export default renderDifficultyScene;
