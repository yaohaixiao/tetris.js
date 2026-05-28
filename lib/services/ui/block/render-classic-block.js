import COLORS from '@/lib/constants/colors.js';

/**
 * # 绘制经典风格方块（Classic Block）
 *
 * 纯色填充 + 黑色边框，最简洁的方块渲染风格。
 *
 * ## 视觉规格
 *
 * - **间隙**：方块之间 1px 间隙，形成网格分离效果
 * - **填充**：使用传入的颜色值
 * - **边框**：黑色（`BLACK`），1px 描边
 *
 * ## 坐标计算
 *
 * - `px = x × blockSize + gap`：像素 X 坐标（跳过左侧间隙）
 * - `py = y × blockSize + gap`：像素 Y 坐标（跳过上方间隙）
 * - `size = blockSize - gap`：实际绘制尺寸（扣除单侧间隙）
 *
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 游戏画布渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块填充颜色（十六进制）
 * @returns {void}
 */
const renderClassicBlock = (canvas, x, y, color) => {
  const { gameBoardContext: ctx, blockSize } = canvas;
  const { BLACK } = COLORS;

  // 方块之间的间隔间隙（1px）
  const gap = 1;
  // 实际绘制的方块大小（扣除单侧间隙）
  const size = blockSize - gap;
  // 计算方块在 Canvas 上的像素坐标（加上间隙偏移）
  const px = x * blockSize + gap;
  const py = y * blockSize + gap;

  // 填充方块内部颜色
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);

  // 绘制黑色边框
  ctx.strokeStyle = BLACK;
  ctx.strokeRect(px, py, size, size);
};

export default renderClassicBlock;
