import COLORS from '@/lib/constants/colors.js';
import lighten from '@/lib/utils/lighten.js';
import darken from '@/lib/utils/darken.js';

/**
 * # 绘制渐变风格方块（Gradient Block）
 *
 * 通过垂直渐变 + 淡高光/阴影覆盖，模拟柔和立体光照效果。 相比 Shaded 风格的 4 色硬分块，Gradient 风格过渡更自然。
 *
 * ## 视觉原理
 *
 * 1. 底层：上亮下暗的垂直线性渐变
 * 2. 左覆盖：淡白色三角，模拟左上光源的高光反射
 * 3. 右覆盖：淡黑色三角，模拟右下背光的阴影
 *
 *    ┌─────────┐ │ 上亮渐变 │ │░░高光 │ │ 中色渐变│ │ 阴影▓│ │ 下暗渐变 │ └─────────┘
 *
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 游戏画布渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块主色（十六进制，如 `#ffa500`）
 * @returns {void}
 */
const renderGradientBlock = (canvas, x, y, color) => {
  const { RGBA_BLACK, RGBA_WHITE } = COLORS;
  const { gameBoardContext: ctx, blockSize } = canvas;

  // 方块左上角像素坐标
  const px = x * blockSize;
  const py = y * blockSize;
  const w = blockSize;
  const h = blockSize;

  // 从主色派生的亮色和暗色
  const light = lighten(color, 0.15);
  const dark = darken(color, 0.25);

  /**
   * 1. 垂直渐变
   *
   * 从上到下：亮色 → 主色 → 暗色。 0.5 处为主色本身，保证方块中部保持原色。
   */
  const grad = ctx.createLinearGradient(px, py, px, py + h);
  grad.addColorStop(0, light); // 顶部：微亮
  grad.addColorStop(0.5, color); // 中部：主色
  grad.addColorStop(1, dark); // 底部：微暗
  ctx.fillStyle = grad;
  ctx.fillRect(px, py, w, h);

  /**
   * 2. 左高光覆盖
   *
   * 从左上角到中心偏左到底部，覆盖 8% 透明白色。 顶点在 x=30% 处，面积较小，避免过曝。
   */
  ctx.fillStyle = RGBA_WHITE;
  ctx.beginPath();
  ctx.moveTo(px, py); // 左上角
  ctx.lineTo(px + w * 0.3, py + h * 0.5); // 中心偏左
  ctx.lineTo(px, py + h); // 左下角
  ctx.fill();

  /**
   * 3. 右阴影覆盖
   *
   * 从右上角到中心偏右到底部，覆盖 6% 透明黑色。 顶点在 x=70% 处，面积略大于高光。
   */
  ctx.fillStyle = RGBA_BLACK;
  ctx.beginPath();
  ctx.moveTo(px + w, py); // 右上角
  ctx.lineTo(px + w * 0.7, py + h * 0.5); // 中心偏右
  ctx.lineTo(px + w, py + h); // 右下角
  ctx.fill();

  // 4. 黑色边框
  ctx.strokeStyle = RGBA_BLACK;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, w - 1, h - 1);
};

export default renderGradientBlock;
