import clearHoldPiece from '@/lib/services/ui/hold/clear-hold-piece.js';
import renderBlock from '@/lib/services/ui/block/render-block.js';

/**
 * ============================================================
 *
 * # 渲染暂存方块预览区域
 *
 * ============================================================
 *
 * 在暂存预览画布中居中绘制暂存方块的形状， 帮助玩家了解当前暂存的方块。
 *
 * ## 渲染流程
 *
 * 1. 从 state 中获取暂存方块（hold）数据
 * 2. 如果没有暂存方块，直接返回
 * 3. 清空暂存预览画布，避免新旧方块重叠
 * 4. 计算居中偏移量，让方块在预览区域中居中显示
 * 5. 遍历形状矩阵，逐个格子绘制方块
 *
 * ## 居中计算
 *
 * - BlockSize：根据预览区域宽度计算，取宽度的 1/6
 * - Ox：水平居中偏移
 * - Oy：垂直居中偏移
 *
 * @function renderHoldPiece
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.holdPieceContext 暂存预览画布的 2D 渲染上下文
 * @param {object} canvas.holdPiece - 暂存预览区域尺寸配置
 * @param {number} canvas.holdPiece.width - 预览区域宽度
 * @param {number} canvas.holdPiece.height - 预览区域高度
 * @param {string} [canvas.style='classic'] - 方块渲染风格. Default is `'classic'`
 * @param {string} [canvas.pattern='square'] - 方块纹理样式. Default is `'square'`
 * @param {object} state - 游戏状态对象
 * @param {object} [state.hold] - 暂存方块对象
 * @param {number[][]} state.hold.shape - 暂存方块的形状矩阵
 * @param {string} state.hold.color - 暂存方块的颜色
 * @returns {void}
 */
const renderHoldPiece = (canvas, state) => {
  const { hold } = state;
  const {
    holdPieceContext: ctx,
    holdPiece: holdCanvas,
    style = 'classic',
    pattern = 'square',
  } = canvas;
  const { width, height } = holdCanvas;

  // 暂存区为空时无需渲染
  if (!hold) {
    return;
  }

  // 计算居中偏移
  const { shape } = hold;
  const blockSize = Math.ceil(width / 6);
  const ox = Math.floor((width - shape[0].length * blockSize) / 2);
  const oy = Math.floor((height - shape.length * blockSize) / 2);

  // 清空预览区域
  clearHoldPiece(canvas);

  // 平移画布原点并绘制方块
  ctx.save();
  ctx.translate(ox, oy);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;

      renderBlock(
        {
          gameBoardContext: ctx,
          blockSize,
          style,
          pattern,
        },
        x,
        y,
        hold.color,
      );
    }
  }

  // 恢复画布状态
  ctx.restore();
};

export default renderHoldPiece;
