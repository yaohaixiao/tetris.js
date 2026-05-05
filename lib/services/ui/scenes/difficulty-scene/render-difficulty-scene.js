import Canvas from '@/lib/services/ui/core/canvas.js';
import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';
import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderDifficultyText from '@/lib/services/ui/text/render-difficulty-text.js';
import renderDifficultyWords from '@/lib/services/ui/text/render-difficult-words.js';
import renderDifficultyShortcut from '@/lib/services/ui/text/render-difficulty-shortcut.js';
import renderEnterStartText from '@/lib/services/ui/text/render-enter-start-text.js';

const renderDifficultyScene = (state) => {
  const { gameBoard } = Canvas;
  const { height } = gameBoard;

  // ======== 1. 清空画布 ========
  clearBoard();

  // ======== 2. 背景遮罩 ========
  renderOverlay();

  renderSceneBackground('main-menu');

  // ======== 3. 游戏标题 ========
  renderTetrisText();

  // ======== 4. DIFFICULTY 标题 ========
  renderDifficultyText();

  // ======== 5. 当前等级数字 ========
  renderDifficultyWords(state.difficulty, height * 0.5);

  // ======== 6. 操作提示 ========
  renderDifficultyShortcut(state);

  // ======== 7. 开始提示 ========
  renderEnterStartText();
};

export default renderDifficultyScene;
