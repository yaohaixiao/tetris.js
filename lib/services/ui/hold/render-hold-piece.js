import clearHoldPiece from '@/lib/services/ui/hold/clear-hold-piece.js';
import renderBlock from '@/lib/services/ui/block/render-block.js';

/**
 * # 渲染暂存方块预览区域（Hold Piece Preview）
 *
 * 在暂存预览画布中居中绘制暂存方块的形状， 帮助玩家了解当前暂存的方块。
 *
 * ## 渲染流程
 *
 * 1. 获取 holdPiece 数据
 * 2. 清空暂存预览画布
 * 3. 计算居中偏移
 * 4. 遍历 shape 矩阵，绘制实心格子
 *
 * @function renderHoldPiece
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 游戏状态（含 holdPiece 字段）
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

  if (!hold) {
    return;
  }

  const { shape } = hold;
  const blockSize = Math.ceil(width / 6);
  const ox = Math.floor((width - shape[0].length * blockSize) / 2);
  const oy = Math.floor((height - shape.length * blockSize) / 2);

  // 清空暂存预览画布
  clearHoldPiece(canvas);

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

  ctx.restore();
};

export default renderHoldPiece;
