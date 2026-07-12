import GAME from '@/lib/game/constants/game.js';

/**
 * Canvas 文本基线类型。
 *
 * @typedef {'top'
 *   | 'hanging'
 *   | 'middle'
 *   | 'alphabetic'
 *   | 'ideographic'
 *   | 'bottom'} CanvasTextBaseline
 */

/**
 * ============================================================
 *
 * # 通用 Canvas 文本渲染工具
 *
 * ============================================================
 *
 * 在 Canvas 上绘制文本，支持填充、描边、透明度、 字体缩放、居中对齐等常用配置。
 *
 * ## 支持特性
 *
 * - 填充文字（fillText）
 * - 描边文字（strokeText）
 * - 自定义颜色 / 描边颜色
 * - 字体大小缩放
 * - 居中控制
 * - 透明度（渐隐效果）
 *
 * @function renderText
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} options - 文本绘制参数
 * @param {string} options.text - 要绘制的文本内容
 * @param {number} options.x - X 坐标
 * @param {number} options.y - Y 坐标
 * @param {string} options.color - 文本颜色
 * @param {string} [options.strokeColor] - 描边颜色
 * @param {number} [options.size=1] - 字体缩放倍数. Default is `1`
 * @param {boolean} [options.center=true] - 是否水平居中. Default is `true`
 * @param {CanvasTextBaseline} [options.baseline='alphabetic'] 文本基线. Default is
 *   `'alphabetic'`
 * @param {boolean} [options.stroke=false] - 是否绘制描边. Default is `false`
 * @param {number} [options.lineWidth=2] - 描边宽度. Default is `2`
 * @param {number} [options.alpha=1] - 透明度 0-1. Default is `1`
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

  /*
   * ============================================================
   * 步骤 1：设置基础样式
   * ============================================================
   */

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

  /*
   * ============================================================
   * 步骤 2：绘制描边（可选）
   * ============================================================
   */
  if (stroke) {
    ctx.strokeStyle = strokeColor || color;
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
  }

  /*
   * ============================================================
   * 步骤 3：绘制填充文本
   * ============================================================
   */
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  // 恢复全局透明度，避免污染后续绘制
  if (alpha < 1) {
    ctx.globalAlpha = 1;
  }

  ctx.restore();
};

export default renderText;
