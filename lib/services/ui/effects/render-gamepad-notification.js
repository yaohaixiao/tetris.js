import COLORS from '@/lib/constants/colors.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderGamepad from '@/lib/services/ui/image/render-gamepad.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * ============================================================
 *
 * # 渲染手柄连接/断开通知
 *
 * ============================================================
 *
 * 在棋盘中央显示闪烁的手柄图标 + 状态文字提示。 由 GamepadNotificationAnimation.render() 每帧调用。
 *
 * ## 视觉表现
 *
 * - 半透明黑色遮罩覆盖棋盘
 * - 居中显示手柄图标
 * - 图标下方显示状态文字： "CONNECTED"（绿色，已连接） "DISCONNECTED"（橙色，已断开）
 *
 * ## 渲染层次
 *
 * 1. 半透明黑色遮罩（renderOverlay）
 * 2. 手柄图标（renderGamepad）
 * 3. 状态文字（renderText）
 *
 * @function renderGamepadNotification
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {boolean} connected - 手柄是否已连接
 * @returns {void}
 */
const renderGamepadNotification = (canvas, connected) => {
  const { gameBoard, fontSize } = canvas;
  const { width, height } = gameBoard;

  // 手柄图标尺寸：棋盘宽度的 54%
  const size = Math.floor(width * 0.54);

  // 水平居中
  const x = width / 2;

  // 文字垂直位置：图标下方
  const y = height / 2 - size * 1.2 + size + fontSize * 1.1;

  // 状态文字和颜色
  const text = connected ? 'CONNECTED' : 'DISCONNECTED';
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
