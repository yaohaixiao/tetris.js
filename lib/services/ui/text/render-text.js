import GAME from '@/lib/game/constants/game.js';

/**
 * @typedef {'top'
 *   | 'hanging'
 *   | 'middle'
 *   | 'alphabetic'
 *   | 'ideographic'
 *   | 'bottom'} CanvasTextBaseline
 */

/**
 * # 通用 Canvas 文本渲染工具（增强版）
 *
 * 支持：
 *
 * - 填充文字（fillText）
 * - 描边文字（strokeText）
 * - 自定义颜色 / 描边颜色
 * - 字体大小缩放
 * - 居中控制
 *
 * @function renderText
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} options - 描述如何绘制文本的参数对象
 * @param {string} options.text - 文本内容
 * @param {number} options.x - X 坐标
 * @param {number} options.y - Y 坐标
 * @param {string} options.color - 填充颜色
 * @param {string} [options.strokeColor] - 描边颜色（可选）
 * @param {number} [options.size=1] - 字体倍率. Default is `1`
 * @param {boolean} [options.center=true] - 是否居中. Default is `true`
 * @param {CanvasTextBaseline} [options.baseline=''] - 字母基线对齐方式. Default is `''`
 * @param {boolean} [options.stroke=false] - 是否启用描边. Default is `false`
 * @param {number} [options.lineWidth=2] - 描边宽度. Default is `2`
 * @returns {void}
 */
const renderText = (canvas, options) => {
  const {
    text,
    x,
    y,
    color,
    strokeColor,
    size = 1,
    center = true,
    baseline = 'alphabetic',
    stroke = false,
    lineWidth = 2,
    alpha = 1,
  } = options;
  const { FONT_FAMILY } = GAME;
  const { gameBoardContext: ctx, fontSize } = canvas;

  ctx.save();

  // ======== 基础样式 ========

  // 设置透明度（渐隐效果）
  if (alpha < 1) {
    ctx.globalAlpha = alpha;
  }

  // 文本对齐方式
  if (center) {
    ctx.textAlign = 'center';
  }

  ctx.textBaseline = baseline;

  ctx.font = `${fontSize * size}px ${FONT_FAMILY}`;

  // ======== 描边配置 ========
  if (stroke) {
    ctx.strokeStyle = strokeColor || color;
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
  }

  // ======== 填充文本 ========
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  // 恢复全局透明度，避免污染后续绘制
  if (alpha < 1) {
    ctx.globalAlpha = 1;
  }

  ctx.restore();
};

export default renderText;
