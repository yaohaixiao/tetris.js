import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderGameText from '@/lib/services/ui/text/render-game-text.js';
import renderOverText from '@/lib/services/ui/text/render-over-text.js';
import renderEnterStartText from '@/lib/services/ui/text/render-enter-start-text.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';
import renderPlaying from '@/lib/services/ui/scenes/playing-scene/render-playing.js';

const renderReplay = (state) => {
  // ======== 1. 清屏 ========
  clearBoard();

  // ======== 2. 绘制游戏动画 ========
  renderPlaying(state);

  // ======== 3. 遮罩层（降低背景干扰） ========
  renderOverlay();

  renderSceneBackground('game-over');

  // ======== 4. UI 文本层 ========
  renderTetrisText();
  renderGameText();
  renderOverText();
  renderEnterStartText();
};

export default renderReplay;
