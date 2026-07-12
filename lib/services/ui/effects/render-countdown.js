import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderCountdownText from '@/lib/services/ui/text/render-countdown-text.js';
import renderGetReadyText from '@/lib/services/ui/text/render-get-ready-text.js';
import renderGamepad from '@/lib/services/ui/image/render-gamepad.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';

/**
 * ============================================================
 *
 * # 倒计时场景
 *
 * ============================================================
 *
 * 在游戏开始前渲染 3 → 2 → 1 的倒计时过渡动画。
 *
 * ## 渲染内容
 *
 * - 清空画布 + 半透明遮罩
 * - 游戏标题 "TETRIS"
 * - 手柄装饰图
 * - "GET READY!" 提示文字
 * - 倒计时数字（带缩放动画，视觉焦点）
 *
 * ## 渲染层级（从底到顶）
 *
 * | 层级 | 操作                    | 说明                   |
 * | :--- | :---------------------- | :--------------------- |
 * | 1    | clearBoard()            | 清空画布               |
 * | 2    | renderOverlay()         | 半透明遮罩层           |
 * | 3    | renderTetrisText()      | 绘制 "TETRIS" 标题     |
 * | 4    | renderSceneBackground() | 绘制倒计时场景背景     |
 * | 5    | renderGamepad()         | 绘制手柄装饰图         |
 * | 6    | renderGetReadyText()    | 绘制 "GET READY!" 提示 |
 * | 7    | renderCountdownText()   | 绘制倒计时数字         |
 *
 * @function renderCountdown
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 倒计时动画状态
 * @param {number} state.number - 当前倒计时数字
 * @param {number} state.scale - 数字缩放比例
 * @returns {void}
 */
const renderCountdown = (canvas, state) => {
  const { number, scale } = state;

  // 1. 清空画布
  clearBoard(canvas);

  // 2. 半透明遮罩层
  renderOverlay(canvas);

  // 3. 标题 + 背景 + 手柄装饰
  renderTetrisText(canvas);
  renderSceneBackground(canvas, 'countdown');
  renderGamepad(canvas);

  // 4. "GET READY!" 提示文本
  renderGetReadyText(canvas);

  // 5. 倒计时数字（最上层，视觉焦点）
  renderCountdownText(canvas, number, scale);
};

export default renderCountdown;
