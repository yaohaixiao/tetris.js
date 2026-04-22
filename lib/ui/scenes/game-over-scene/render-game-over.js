import renderTetrisText from '@/lib/ui/text/render-tetris-text.js';
import renderGameText from '@/lib/ui/text/render-game-text.js';
import renderOverText from '@/lib/ui/text/render-over-text.js';
import renderEnterStartText from '@/lib/ui/text/render-enter-start-text.js';
import renderActiveOnly from '@/lib/ui/board/render-active-only.js';
import renderOverlay from '@/lib/ui/overlay/render-overlay.js';
import clearBoard from '@/lib/ui/board/clear-board.js';
import renderSceneBackground from '@/lib/ui/image/render-scene-background.js';

/**
 * # 渲染游戏结束场景（Game Over Scene）
 *
 * 该函数负责绘制游戏结束界面，包括：
 *
 * 渲染流程：
 *
 * 1. 清空画布
 * 2. 绘制最终棋盘状态（保留最后一帧）
 * 3. 添加半透明遮罩层
 * 4. 渲染 UI 文本层
 *
 * UI 组成：
 *
 * - TETRIS.JS 标题
 * - GAME 标题
 * - OVER 标题
 * - ENTER START 提示
 *
 * @function renderGameOver
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderGameOver = (state) => {
  // ======== 1. 清屏 ========
  clearBoard();

  // ======== 2. 绘制最终游戏画面（冻结状态） ========
  renderActiveOnly(state);

  // ======== 3. 遮罩层（降低背景干扰） ========
  renderOverlay();

  renderSceneBackground('game-over');

  // ======== 4. UI 文本层 ========
  renderTetrisText();
  renderGameText();
  renderOverText();
  renderEnterStartText();
};

export default renderGameOver;
