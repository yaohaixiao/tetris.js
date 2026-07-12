import COLORS from '@/lib/constants/colors.js';
import lighten from '@/lib/utils/color/lighten.js';
import darken from '@/lib/utils/color/darken.js';

/**
 * ============================================================
 *
 * # 绘制渐变风格方块
 *
 * ============================================================
 *
 * 通过垂直渐变 + 淡高光/阴影覆盖，模拟柔和立体光照效果。 相比 Shaded 风格的 4 色硬分块，Gradient 风格过渡更自然。
 *
 * ## 视觉原理
 *
 * 1. 底层：上亮下暗的垂直线性渐变
 * 2. 左覆盖：淡白色三角，模拟左上光源的高光反射
 * 3. 右覆盖：淡黑色三角，模拟右下背光的阴影
 *
 * @function renderGradientBlock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext 游戏画布渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块主色（十六进制）
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
  const dark = darken(color, 0.2);

  // 1. 垂直渐变：亮色 → 主色 → 暗色
  const grad = ctx.createLinearGradient(px, py, px, py + h);
  grad.addColorStop(0, light);
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, dark);
  ctx.fillStyle = grad;
  ctx.fillRect(px, py, w, h);

  // 2. 左高光覆盖：8% 透明白色三角
  ctx.fillStyle = RGBA_WHITE;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + w * 0.3, py + h * 0.5);
  ctx.lineTo(px, py + h);
  ctx.fill();

  // 3. 右阴影覆盖：6% 透明黑色三角
  ctx.fillStyle = RGBA_BLACK;
  ctx.beginPath();
  ctx.moveTo(px + w, py);
  ctx.lineTo(px + w * 0.7, py + h * 0.5);
  ctx.lineTo(px + w, py + h);
  ctx.fill();

  // 4. 黑色边框
  ctx.strokeStyle = RGBA_BLACK;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, w - 1, h - 1);
};

export default renderGradientBlock;
