import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';
import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderDifficultyText from '@/lib/services/ui/text/render-difficulty-text.js';
import renderDifficultyWords from '@/lib/services/ui/text/render-difficult-words.js';
import renderDifficultyShortcut from '@/lib/services/ui/text/render-difficulty-shortcut.js';
import renderEnterStartText from '@/lib/services/ui/text/render-enter-start-text.js';

const renderDifficultyScene = (canvas, state) => {
  const { gameBoard } = canvas;
  const { height } = gameBoard;

  // ======== 1. 清空画布 ========
  clearBoard(canvas);

  // ======== 2. 背景遮罩 ========
  renderOverlay(canvas);

  renderSceneBackground(canvas, 'main-menu');

  // ======== 3. 游戏标题 ========
  renderTetrisText(canvas);

  // ======== 4. DIFFICULTY 标题 ========
  renderDifficultyText(canvas);

  // ======== 5. 当前等级数字 ========
  renderDifficultyWords(canvas, state.difficulty, height * 0.5);

  // ======== 6. 操作提示 ========
  renderDifficultyShortcut(canvas, state);

  // ======== 7. 开始提示 ========
  renderEnterStartText(canvas);
};

export default renderDifficultyScene;
