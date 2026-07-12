import COLORS from '@/lib/constants/colors.js';
import lighten from '@/lib/utils/color/lighten.js';
import darken from '@/lib/utils/color/darken.js';

/**
 * ============================================================
 *
 * # 绘制光泽风格方块
 *
 * ============================================================
 *
 * 纯色填充 + 左上角高光条，模拟光源从左上方照射的光泽效果。 顶部 1/4 和左侧 1/4 使用亮色填充，其余使用主色。
 *
 * ## 视觉规格
 *
 * - 间隙：方块之间 1px 间隙
 * - 填充：使用传入的主色
 * - 高光：顶部 1/4 和左侧 1/4 使用主色的亮色变体
 * - 边框：黑色，1px 描边
 *
 * ## 坐标计算
 *
 * - Px = x × blockSize + gap：像素 X 坐标
 * - Py = y × blockSize + gap：像素 Y 坐标
 * - Size = blockSize - gap：实际绘制尺寸
 *
 * @function renderGlossyBlock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext 游戏画布渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块填充颜色（十六进制）
 * @returns {void}
 */
const renderGlossyBlock = (canvas, x, y, color) => {
  const { gameBoardContext: ctx, blockSize } = canvas;

  const gap = 1;
  const size = blockSize - gap;
  const px = x * blockSize + gap;
  const py = y * blockSize + gap;

  // 主色填充
  ctx.fillStyle = darken(color, 0.15);
  ctx.fillRect(px, py, size, size);

  // 黑色边框
  ctx.strokeStyle = COLORS.BLACK;
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, size, size);

  // 顶部高光条（1/4 高度）
  const highlightColor = lighten(color, 0.25);
  const highlightSize = Math.max(2, Math.floor(size / 4));

  ctx.fillStyle = highlightColor;
  ctx.fillRect(px, py, size, highlightSize);

  // 左侧高光条（1/4 宽度）
  ctx.fillRect(px, py, highlightSize, size);
};

export default renderGlossyBlock;
