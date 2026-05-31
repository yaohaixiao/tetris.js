import renderBlock from '@/lib/services/ui/block/render-block.js';

/**
 * # 绘制 Ghost 方块（半透明落点预览）
 *
 * 在当前方块的正下方投影位置绘制半透明方块，帮助玩家预判落点。 仅在 level ≤ 9 时显示，10 关及以上不再绘制。
 *
 * ## 视觉规格
 *
 * - **透明度**：alpha = 0.3（固定）
 * - **颜色**：当前方块颜色
 * - **位置**：Ghost 投影的 (cx, ghostY)
 *
 * @function renderGhostPiece
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} ghost - Ghost 方块的定位信息
 * @returns {void}
 */
const renderGhostPiece = (canvas, ghost) => {
  const { gameBoardContext: ctx } = canvas;
  const { curr, cx, cy } = ghost;
  const { shape, color } = curr;

  // 设置 Ghost 透明度
  ctx.globalAlpha = 0.45;

  // 遍历方块形状矩阵
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        renderBlock(canvas, cx + x, cy + y, color);
      }
    }
  }

  // 恢复全局透明度
  ctx.globalAlpha = 1;
};

export default renderGhostPiece;
