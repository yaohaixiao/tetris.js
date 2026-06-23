import COLORS from '@/lib/constants/colors.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderGamepad from '@/lib/services/ui/image/render-gamepad.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * # 渲染手柄连接/断开通知
 *
 * 在棋盘中央显示闪烁的手柄图标 + 状态文字提示。 由 GamepadNotificationAnimation.render() 每帧调用。
 *
 * ## 视觉表现
 *
 * - 半透明黑色遮罩覆盖棋盘
 * - 居中显示手柄图标（由 renderGamepad 绘制）
 * - 图标下方显示状态文字
 *
 *   - "CONNECTED"：绿色文字，表示手柄已连接
 *   - "DISCONNECTED"：橙色文字，表示手柄已断开
 * - 闪烁由 GamepadNotificationAnimation 控制（6 次，每次 200ms）
 *
 * ## 渲染层次
 *
 *     1. 半透明黑色遮罩（renderOverlay）
 *     2. 手柄图标（renderGamepad）
 *     3. 状态文字（renderText）
 *
 * ## 布局计算
 *
 *     size = 棋盘宽度 × 0.54（手柄图标尺寸基准）
 *     x = 棋盘宽度 / 2（水平居中）
 *     y = 棋盘高度 / 2 - size × 1.2 + size + fontSize × 1.1
 *       ≈ 棋盘中央偏下，让图标和文字整体视觉居中
 *
 * @function renderGamepadNotification
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {boolean} connected - 手柄是否已连接（true=连接，false=断开）
 * @returns {void}
 */
const renderGamepadNotification = (canvas, connected) => {
  // 解构渲染所需的棋盘尺寸和字体大小
  const { gameBoard, fontSize } = canvas;
  const { width, height } = gameBoard;

  /** 手柄图标尺寸基准。 取棋盘宽度的 54%，保证图标在不同屏幕尺寸下按比例缩放。 */
  const size = Math.floor(width * 0.54);

  // 水平居中
  const x = width / 2;

  /**
   * 文字垂直位置。
   *
   * 计算逻辑：
   *
   * - Height / 2：棋盘垂直中心
   * - - Size × 1.2：向上偏移图标高度（为图标留空间）
   * - - Size：回到图标底部
   * - - FontSize × 1.1：在图标下方留一个字号的间距
   *
   * 最终文字位于手柄图标的正下方。
   */
  const y = height / 2 - size * 1.2 + size + fontSize * 1.1;

  /** 状态文字。 连接时显示 "CONNECTED"，断开时显示 "DISCONNECTED"。 */
  const text = connected ? 'CONNECTED' : 'DISCONNECTED';

  /** 文字颜色。 连接：绿色（COLORS.GREEN），传达"成功/可用"的信息。 断开：橙色（COLORS.ORANGE），传达"警告/注意"的信息。 */
  const color = connected ? COLORS.GREEN : COLORS.ORANGE;

  // 1. 半透明黑色遮罩
  renderOverlay(canvas);

  // 2. 手柄图标
  renderGamepad(canvas);

  // 3. 居中状态文字
  renderText(canvas, {
    text,
    x,
    y,
    color,
    size: connected ? 1.56 : 1.3,
    center: true,
    baseline: 'middle',
    alpha: 0.95,
  });
};

export default renderGamepadNotification;
