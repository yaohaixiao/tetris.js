import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import clearNextPiece from '@/lib/ui/next/clear-next-piece.js';

/**
 * # 绘制预览方块
 *
 * 在预览画布中央居中显示下一个方块的形状和颜色
 *
 * @function renderNextPiece
 * @param {object | null} next - 下一个预览方块对象
 * @param {number[][]} next.shape - 预览方块的形状矩阵
 * @param {string} next.color - 预览方块的填充颜色
 * @returns {void}
 */
const renderNextPiece = (next) => {
  const { BLACK } = COLORS;
  const { nextPiece, nextPieceContext: ctx } = Canvas;
  const { width, height } = nextPiece;
  // 预览区域固定为 5x5 网格大小
  const gridSize = 5;
  // 计算单个预览方块的尺寸（自适应预览画布）
  const blockSize = Math.floor(width / gridSize);

  if (!next) {
    return;
  }

  const { shape } = next;
  // 计算水平居中偏移量
  const ox = Math.floor((width - shape[0].length * blockSize) / 2);
  // 计算垂直居中偏移量
  const oy = Math.floor((height - shape.length * blockSize) / 2);

  // 清空预览画布
  clearNextPiece();

  // 遍历预览方块形状矩阵
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // 当前位置有方块时进行绘制
      if (shape[y][x]) {
        const px = ox + x * blockSize;
        const py = oy + y * blockSize;

        // 绘制填充方块与黑色边框
        ctx.fillStyle = next.color;
        ctx.fillRect(px, py, blockSize - 2, blockSize - 2);
        ctx.strokeStyle = BLACK;
        ctx.strokeRect(px, py, blockSize - 2, blockSize - 2);
      }
    }
  }
};

export default renderNextPiece;
