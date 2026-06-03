import renderClassicBlock from '@/lib/services/ui/block/render-classic-block.js';
import renderGlassBlock from '@/lib/services/ui/block/render-glass-block.js';
import renderGradientBlock from '@/lib/services/ui/block/render-gradient-block.js';
import renderInsetBlock from './render-inset-block.js';
import renderPixelBlock from '@/lib/services/ui/block/render-pixel-block.js';
import renderShadedBlock from '@/lib/services/ui/block/render-shaded-block.js';

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
 * @param {number} x - 方块在网格中的 X 坐标（列索引）
 * @param {number} y - 方块在网格中的 Y 坐标（行索引）
 * @param {string} color - 方块的填充颜色（十六进制、rgb、颜色名等）
 * @returns {void}
 */
const renderBlock = (canvas, x, y, color) => {
  const { style = 'classic', pattern = 'square' } = canvas;

  switch (style) {
    case 'glass': {
      renderGlassBlock(canvas, x, y, color);
      break;
    }
    case 'gradient': {
      renderGradientBlock(canvas, x, y, color);
      break;
    }
    case 'inset': {
      renderInsetBlock(canvas, x, y, color);
      break;
    }
    case 'pixel': {
      renderPixelBlock(canvas, x, y, color, pattern);
      break;
    }
    case 'shaded': {
      renderShadedBlock(canvas, x, y, color);
      break;
    }
    default: {
      renderClassicBlock(canvas, x, y, color);
      break;
    }
  }
};

export default renderBlock;
