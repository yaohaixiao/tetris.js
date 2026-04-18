import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';

/**
 * # 绘制单个方块
 *
 * 在 Canvas 上绘制一个带边框的单个方块（网格单元）
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文
 * @param {number} x - 方块在网格中的 X 轴坐标（列数）
 * @param {number} y - 方块在网格中的 Y 轴坐标（行数）
 * @param {string} color - 方块的填充颜色（支持十六进制、rgb、颜色名等）
 * @returns {void}
 */
const renderBlock = (ctx, x, y, color) => {
  const { BLACK } = COLORS;
  const { blockSize } = Canvas;

  // 方块基础尺寸
  const bs = blockSize;
  // 方块之间的间隔间隙
  const gap = 1;
  // 实际绘制的方块大小（扣除两侧间隙）
  const size = bs - gap * 2;
  // 计算方块在 Canvas 上的实际像素坐标 X
  const px = x * bs + gap;
  // 计算方块在 Canvas 上的实际像素坐标 Y
  const py = y * bs + gap;

  // 设置填充色并绘制实心方块
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);
  // 设置黑色边框并绘制方块轮廓
  ctx.strokeStyle = BLACK;
  ctx.strokeRect(px, py, size, size);
};

export default renderBlock;
