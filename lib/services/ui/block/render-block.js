import renderClassicBlock from '@/lib/services/ui/block/render-classic-block.js';
import renderFrostedBlock from '@/lib/services/ui/block/render-frosted-block.js';
import renderGlassBlock from '@/lib/services/ui/block/render-glass-block.js';
import renderGlossyBlock from '@/lib/services/ui/block/render-glossy-block.js';
import renderGradientBlock from '@/lib/services/ui/block/render-gradient-block.js';
import renderInsetBlock from './render-inset-block.js';
import renderPixelBlock from '@/lib/services/ui/block/render-pixel-block.js';
import renderShadedBlock from '@/lib/services/ui/block/render-shaded-block.js';

/**
 * ============================================================
 *
 * # 绘制单个方块（网格单元）
 *
 * ============================================================
 *
 * 在 Canvas 上绘制一个指定风格的实心方块。 每个方块之间有 1px 的间隙，形成网格分离效果。
 *
 * ## 视觉规格
 *
 * - 间隙：方块之间 1px 间隙
 * - 填充：使用传入的颜色值
 * - 边框：各风格自行处理
 *
 * ## 渲染风格
 *
 * | 风格     | 说明             | 视觉特征                     |
 * | :------- | :--------------- | :--------------------------- |
 * | classic  | 经典纯色（默认） | 纯色填充 + 黑色边框          |
 * | frosted  | 毛玻璃质感       | 半透明 + 噪点纹理 + 深色边框 |
 * | glass    | 光面玻璃质感     | 半透明 + 高光 + 深色边框     |
 * | glossy   | 光泽风格         | 渐变 + 高光                  |
 * | gradient | 垂直渐变风格     | 上亮下暗 + L 形暗色 + 边框   |
 * | inset    | 内嵌风格         | 凹陷立体感                   |
 * | pixel    | 像素风格         | 像素化纹理                   |
 * | shaded   | 立体阴影风格     | 4 色几何分块模拟光照         |
 *
 * ## 设计说明
 *
 * 所有风格实现统一的 renderXxxBlock(canvas, x, y, color) 接口， 通过 canvas.style 和
 * canvas.pattern 动态路由到对应渲染函数。
 *
 * @function renderBlock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块填充颜色
 * @returns {void}
 */
const renderBlock = (canvas, x, y, color) => {
  const { style = 'classic', pattern = 'square' } = canvas;

  // 颜色为空时跳过绘制（空格子）
  if (!color) {
    return;
  }

  // 根据渲染风格路由到对应的渲染函数
  switch (style) {
    case 'frosted': {
      renderFrostedBlock(canvas, x, y, color);
      break;
    }
    case 'glass': {
      renderGlassBlock(canvas, x, y, color);
      break;
    }
    case 'glossy': {
      renderGlossyBlock(canvas, x, y, color);
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
      // 默认使用经典风格
      renderClassicBlock(canvas, x, y, color);
      break;
    }
  }
};

export default renderBlock;
