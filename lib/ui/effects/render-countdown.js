import clearBoard from '@/lib/ui/board/clear-board.js';
import renderTetrisText from '@/lib/ui/text/render-tetris-text.js';
import renderOverlay from '@/lib/ui/overlay/render-overlay.js';
import renderCountdownText from '@/lib/ui/text/render-countdown-text.js';
import renderGetReadyText from '@/lib/ui/text/render-get-ready-text.js';
import renderGamepadImage from '@/lib/ui/image/render-gamepad-image.js';
import renderSceneBackground from '@/lib/ui/image/render-scene-background.js';

/**
 * # 倒计时场景（Countdown Scene）
 *
 * 用于游戏开始前的过渡动画（3 → 2 → 1 → START）
 *
 * 渲染内容：
 *
 * - 背景清空
 * - 半透明遮罩
 * - 游戏标题（TETRIS.JS）
 * - 倒计时数字（带缩放动画）
 * - 提示文本（GET READY!）
 *
 * 渲染层级（从底到顶）：
 *
 * 1. 背景（clearBoard）
 * 2. Overlay（遮罩）
 * 3. 标题
 * 4. 提示文本（GET READY）
 * 5. 倒计时数字（最上层，视觉焦点）
 *
 * @function renderCountdown
 * @param {{
 *   number: number;
 *   scale: number;
 * }} state - 倒计时状态
 * @returns {void}
 */
const renderCountdown = (state) => {
  const { number, scale } = state;

  /* ======== 1. 清空画布 ======== */
  clearBoard();

  /* ======== 2. 背景遮罩 ======== */
  renderOverlay();

  /* ======== 3. 标题层 ======== */
  renderTetrisText();
  renderSceneBackground('countdown');

  renderGamepadImage();

  /* ======== 4. 提示文本层 ======== */
  renderGetReadyText();

  /* ======== 5. 倒计时主视觉（最上层） ======== */
  renderCountdownText(number, scale);
};

export default renderCountdown;
