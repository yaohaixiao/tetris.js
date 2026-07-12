import clearNextPiece from '@/lib/services/ui/next/clear-next-piece.js';
import renderBlock from '@/lib/services/ui/block/render-block.js';

/**
 * ============================================================
 *
 * # 渲染下一个方块预览区域
 *
 * ============================================================
 *
 * 在预览画布中居中绘制下一个方块的形状， 帮助玩家提前规划放置策略。
 *
 * ## 渲染流程
 *
 * 1. 获取 next piece 数据
 * 2. 清空预览画布
 * 3. 计算居中偏移（5×5 网格中居中显示）
 * 4. 遍历 shape 矩阵，绘制实心格子
 *
 * ## 视觉特点
 *
 * - 固定 5×5 预览网格
 * - 自动居中显示
 * - 方块填充颜色 + 黑色描边
 *
 * @function renderNextPiece
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 游戏状态（含 next 字段）
 * @returns {void}
 */
const renderNextPiece = (canvas, state) => {
  const { next } = state;
  const {
    style = 'classic',
    pattern = 'square',
    nextPiece,
    nextPieceContext: ctx,
  } = canvas;
  const { width, height } = nextPiece;

  // 没有预览方块，直接退出
  if (!next) {
    return;
  }

  const { shape } = next;

  // 单个方块的尺寸（根据画布宽度自适应）
  const blockSize = Math.ceil(width / 6);

  // 计算居中偏移
  const ox = Math.floor((width - shape[0].length * blockSize) / 2);
  const oy = Math.floor((height - shape.length * blockSize) / 2);

  // 清空预览区域
  clearNextPiece(canvas);

  ctx.save();
  ctx.translate(ox, oy);

  // 遍历形状矩阵并绘制
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // 跳过空格子
      if (!shape[y][x]) {
        continue;
      }

      renderBlock(
        {
          gameBoardContext: ctx,
          blockSize,
          style,
          pattern,
          next: 'ok',
        },
        x,
        y,
        next.color,
      );
    }
  }

  ctx.restore();
};

export default renderNextPiece;
