import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderGameText from '@/lib/services/ui/text/render-game-text.js';
import renderOverText from '@/lib/services/ui/text/render-over-text.js';
import renderEnterStartText from '@/lib/services/ui/text/render-enter-start-text.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';
import renderPlaying from '@/lib/services/ui/scenes/playing-scene/render-playing.js';

/**
 * # 渲染回放场景
 *
 * 在游戏结束后播放回放时的完整场景渲染， 包含回放画面、遮罩层和结束提示文字。
 *
 * ## 渲染层级（从底到顶）
 *
 * | 层级 | 操作                      | 说明                         |
 * | ---- | ------------------------- | ---------------------------- |
 * | 1    | `clearBoard()`            | 清空画布                     |
 * | 2    | `renderPlaying()`         | 绘制回放中的游戏画面         |
 * | 3    | `renderOverlay()`         | 半透明遮罩层（降低背景干扰） |
 * | 4    | `renderSceneBackground()` | 绘制 Game Over 场景背景      |
 * | 5    | `renderTetrisText()`      | 绘制 "TETRIS" 标题文字       |
 * | 6    | `renderGameText()`        | 绘制 "GAME" 文字             |
 * | 7    | `renderOverText()`        | 绘制 "OVER" 文字             |
 * | 8    | `renderEnterStartText()`  | 绘制 "按回车键继续" 提示     |
 *
 * @function renderReplay
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderReplay = (canvas, state) => {
  // ======== 1. 清屏 ========
  clearBoard(canvas);

  // ======== 2. 绘制回放中的游戏画面 ========
  renderPlaying(canvas, state);

  // ======== 3. 半透明遮罩层（降低背景干扰） ========
  renderOverlay(canvas);

  // ======== 4. 绘制 Game Over 场景背景 ========
  renderSceneBackground(canvas, 'game-over');

  // ======== 5-8. UI 文本层 ========
  renderTetrisText(canvas);
  renderGameText(canvas);
  renderOverText(canvas);
  renderEnterStartText(canvas);
};

export default renderReplay;
