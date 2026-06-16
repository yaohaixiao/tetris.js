import lighten from '@/lib/utils/color/lighten.js';
import darken from '@/lib/utils/color/darken.js';

/**
 * # 绘制内凹风格方块（Inset Block）
 *
 * 模拟 3D 内凹效果：主色填充 + 左上亮色细线 + 右下暗色细线。 产生"方块嵌入棋盘"的视觉感。
 *
 * ## 视觉规格
 *
 * - **间隙**：方块之间 1px 间隙
 * - **填充**：使用传入的主色
 * - **左上边框**：亮色，2px，模拟光源
 * - **右下边框**：暗色，2px，模拟阴影
 *
 * ## 坐标计算
 *
 * - `px = x × blockSize + gap`：像素 X 坐标
 * - `py = y × blockSize + gap`：像素 Y 坐标
 * - `size = blockSize - gap`：实际绘制尺寸
 *
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 游戏画布渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块填充颜色（十六进制）
 * @returns {void}
 */
const renderInsetBlock = (canvas, x, y, color) => {
  const { gameBoardContext: ctx, blockSize } = canvas;

  const gap = 1;
  const size = blockSize - gap;
  const px = x * blockSize + gap;
  const py = y * blockSize + gap;

  // 主色填充
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);

  // 左上亮色边框（模拟光源从左上方来）
  ctx.strokeStyle = lighten(color, 0.4);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py + size);
  ctx.lineTo(px, py);
  ctx.lineTo(px + size, py);
  ctx.stroke();

  // 右下暗色边框（模拟阴影）
  ctx.strokeStyle = darken(color, 0.6);
  ctx.beginPath();
  ctx.moveTo(px + size, py);
  ctx.lineTo(px + size, py + size);
  ctx.lineTo(px, py + size);
  ctx.stroke();
};

export default renderInsetBlock;
