import darken from '@/lib/utils/color/darken.js';
import lighten from '@/lib/utils/color/lighten.js';

/**
 * 绘制一层嵌套矩形。
 *
 * 在指定缩进层级绘制一个实心矩形。 steps 越大矩形越小，形成嵌套视觉效果。
 *
 * @function layer
 * @param {object} options - 参数对象
 * @param {CanvasRenderingContext2D} options.ctx - 2D 渲染上下文
 * @param {number} options.px - 方块左上角像素 X 坐标
 * @param {number} options.py - 方块左上角像素 Y 坐标
 * @param {number} options.w - 方块总宽度（像素）
 * @param {number} options.h - 方块总高度（像素）
 * @param {number} options.u - 单元宽度（blockSize / 8）
 * @param {number} options.steps - 缩进层数
 * @param {string} options.color - 填充颜色
 * @returns {void}
 */
const layer = (options) => {
  const { ctx, px, py, w, h, u, steps, color } = options;

  ctx.fillStyle = color;
  ctx.fillRect(
    px + u * steps,
    py + u * steps,
    w - u * steps * 2,
    h - u * steps * 2,
  );
};

/**
 * 绘制 3 层嵌套矩形（0 → 1 → 2）。
 *
 * 外框暗色 → 中层主色 → 内层暗色， 产生立体凹槽效果。
 *
 * @function drawLayers
 * @param {object} options - 参数对象（同 layer）
 * @param {string} options.color - 方块主色
 * @param {string} options.darkColor - 暗色
 * @returns {void}
 */
const drawLayers = (options) => {
  const { ctx, px, py, w, h, u, color, darkColor } = options;

  // 外框暗色
  layer({ ctx, px, py, w, h, u, steps: 0, color: darkColor });
  // 中层主色
  layer({ ctx, px, py, w, h, u, steps: 1, color });
  // 内层暗色
  layer({ ctx, px, py, w, h, u, steps: 2, color: darkColor });
};

/**
 * ============================================================
 *
 * # 绘制像素风格方块
 *
 * ============================================================
 *
 * 通过逐层缩小的矩形叠加产生立体凹槽的像素风格效果。 每种方块有不同的嵌套层数和内部细节。
 *
 * ## 方块类型
 *
 * | 图案   | 层数 | 特点              |
 * | :----- | :--- | :---------------- |
 * | square | 3    | 外→中→内 三层嵌套 |
 * | jay    | 4    | 最内层亮色        |
 * | ell    | 2    | 外→中 两层        |
 * | zee    | 3    | 同 square         |
 * | tee    | 2+   | 横竖条细节        |
 *
 * @function renderPixelBlock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext 游戏画布渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块主色（十六进制）
 * @param {string} [pattern='square'] - 图案类型. Default is `'square'`
 * @returns {void}
 */
const renderPixelBlock = (canvas, x, y, color, pattern = 'square') => {
  const { gameBoardContext: ctx, blockSize } = canvas;

  // 单元宽度：blockSize / 8，作为每层缩进单位
  const u = blockSize / 8;
  // 方块左上角像素坐标
  const px = x * blockSize;
  const py = y * blockSize;
  const w = blockSize;
  const h = blockSize;

  // 从主色派生的暗色和亮色
  const darkColor = darken(color, 0.4);
  const lightColor = lighten(color, 0.5);

  switch (pattern) {
    // Jay：4 层嵌套，最内层用亮色
    case 'jay': {
      drawLayers({ ctx, px, py, w, h, u, color, darkColor });
      layer({ ctx, px, py, w, h, u, steps: 3, color: lightColor });
      break;
    }

    // Ell：2 层嵌套（外暗→主色）
    case 'ell': {
      layer({ ctx, px, py, w, h, u, steps: 0, color: darkColor });
      layer({ ctx, px, py, w, h, u, steps: 1, color });
      break;
    }

    // Tee：2 层 + 横竖条内部细节
    case 'tee': {
      layer({ ctx, px, py, w, h, u, steps: 0, color: darkColor });
      layer({ ctx, px, py, w, h, u, steps: 1, color });

      // 白色竖条
      ctx.fillStyle = lightColor;
      ctx.fillRect(px + u * 2, py + u * 2, u, h - u * 4);

      // 白色横条
      ctx.fillRect(px + u * 2, py + u * 2, w - u * 4, u);

      // 暗色横条
      ctx.fillStyle = darkColor;
      ctx.fillRect(px + u * 2, py + u * 5, w - u * 4, u);

      // 暗色竖条
      ctx.fillRect(px + u * 5, py + u * 3, u, h - u * 6);
      break;
    }

    // Square：3 层嵌套（默认）
    default: {
      drawLayers({ ctx, px, py, w, h, u, color, darkColor });
    }
  }
};

export default renderPixelBlock;
