import COLORS from '@/lib/constants/colors.js';

/**
 * # 绘制单个方块（网格单元）
 *
 * 在 Canvas 上绘制一个带黑色边框的实心方块。 每个方块之间有 1px 的间隙，形成网格分离效果。
 *
 * ## 视觉规格
 *
 * - **间隙**：方块之间 1px 间隙
 * - **填充**：使用传入的颜色值
 * - **边框**：黑色（`RGBA_BLACK`）
 *
 * ## 坐标计算
 *
 * - `px = x × blockSize + gap`：像素 X 坐标
 * - `py = y × blockSize + gap`：像素 Y 坐标
 * - `size = blockSize - gap × 2`：实际绘制尺寸（扣除两侧间隙）
 *
 * @function renderBlock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 游戏画布渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 方块在网格中的 X 坐标（列索引）
 * @param {number} y - 方块在网格中的 Y 坐标（行索引）
 * @param {string} color - 方块的填充颜色（十六进制、rgb、颜色名等）
 * @returns {void}
 */
const renderBlock = (canvas, x, y, color) => {
  const { gameBoardContext: ctx, blockSize } = canvas;
  const { RGBA_BLACK } = COLORS;

  // 方块之间的间隔间隙（1px）
  const gap = 1;
  // 实际绘制的方块大小（扣除两侧间隙）
  const size = blockSize - gap * 2;
  // 计算方块在 Canvas 上的像素 X 坐标
  const px = x * blockSize + gap;
  // 计算方块在 Canvas 上的像素 Y 坐标
  const py = y * blockSize + gap;

  // 填充方块内部颜色
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);

  // 绘制黑色边框
  ctx.strokeStyle = RGBA_BLACK;
  ctx.strokeRect(px, py, size, size);
};

export default renderBlock;
