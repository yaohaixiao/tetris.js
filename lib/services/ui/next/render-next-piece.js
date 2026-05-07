import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/services/ui/core/canvas.js';
import clearNextPiece from '@/lib/services/ui/next/clear-next-piece.js';

/**
 * # 渲染“下一个方块”预览区域（Next Piece Preview）
 *
 * 该函数负责在预览画布中居中绘制下一个 Tetris 方块的形状。
 *
 * 渲染流程：
 *
 * 1. 获取 next piece 数据
 * 2. 清空预览画布
 * 3. 计算居中偏移
 * 4. 遍历 shape 矩阵并绘制方块
 *
 * 特点：
 *
 * - 固定 5x5 预览网格
 * - 自动居中显示
 * - 支持方块颜色渲染 + 黑色描边
 *
 * @function renderNextPiece
 * @param {object} state - 游戏状态
 * @returns {void}
 */
const renderNextPiece = (state) => {
  const { next } = state;
  const { RGBA_BLACK } = COLORS;
  const { nextPiece, nextPieceContext: ctx } = Canvas;
  const { width, height } = nextPiece;

  // ======== 无预览方块时直接退出 ========
  if (!next) {
    return;
  }

  const { shape } = next;

  // ======== 预览网格配置（5x5固定区域） ========
  const gridSize = 5;

  // 单个方块尺寸（自适应画布）
  const blockSize = Math.floor(width / gridSize);

  // ======== 计算居中偏移 ========
  const ox = Math.floor((width - shape[0].length * blockSize) / 2);
  const oy = Math.floor((height - shape.length * blockSize) / 2);

  // ======== 清空预览区域 ========
  clearNextPiece();

  // ======== 绘制方块 ========
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) {
        continue;
      }

      // 方块之间的间隔间隙
      const gap = 1;
      // 实际绘制的方块大小（扣除两侧间隙）
      const size = blockSize - gap;
      const px = ox + x * blockSize + gap;
      const py = oy + y * blockSize + gap;

      // 填充方块
      ctx.fillStyle = next.color;
      ctx.fillRect(px, py, size, size);

      // 边框
      ctx.strokeStyle = RGBA_BLACK;
      ctx.strokeRect(px, py, size, size);
    }
  }
};

export default renderNextPiece;
