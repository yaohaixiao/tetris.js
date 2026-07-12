import COLORS from '@/lib/constants/colors.js';

/**
 * ============================================================
 *
 * # 绘制经典风格方块
 *
 * ============================================================
 *
 * 纯色填充 + 黑色边框，最简洁的方块渲染风格。
 *
 * ## 视觉规格
 *
 * - 间隙：方块之间 1px 间隙，形成网格分离效果
 * - 填充：使用传入的颜色值
 * - 边框：黑色（BLACK），1px 描边
 *
 * ## 坐标计算
 *
 * - Px = x × blockSize + gap
 * - Py = y × blockSize + gap
 * - Size = blockSize - gap
 *
 * @function renderClassicBlock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext 游戏画布渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块填充颜色（十六进制）
 * @returns {void}
 */
const renderClassicBlock = (canvas, x, y, color) => {
  const { gameBoardContext: ctx, blockSize } = canvas;
  const { BLACK } = COLORS;

  // 计算坐标和尺寸
  const gap = 1;
  const size = blockSize - gap;
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
