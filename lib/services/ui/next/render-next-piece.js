import COLORS from '@/lib/constants/colors.js';
import clearNextPiece from '@/lib/services/ui/next/clear-next-piece.js';

/**
 * # 渲染"下一个方块"预览区域（Next Piece Preview）
 *
 * 在预览画布中居中绘制下一个方块的形状， 帮助玩家提前规划放置策略。
 *
 * ## 渲染流程
 *
 * 1. 获取 next piece 数据
 * 2. 清空预览画布
 * 3. 计算居中偏移（使方块在 5×5 网格中居中显示）
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
  const { RGBA_BLACK } = COLORS;
  const { nextPiece, nextPieceContext: ctx } = canvas;
  const { width, height } = nextPiece;

  // 没有预览方块，直接退出
  if (!next) {
    return;
  }

  const { shape } = next;

  // 预览网格配置（5×5 固定区域）
  const gridSize = 5;

  // 单个方块的尺寸（根据画布宽度自适应）
  const blockSize = Math.floor(width / gridSize);

  // 计算水平居中偏移
  const ox = Math.floor((width - shape[0].length * blockSize) / 2);
  // 计算垂直居中偏移
  const oy = Math.floor((height - shape.length * blockSize) / 2);

  // 清空预览区域，移除上一帧的残留图形
  clearNextPiece(canvas);

  // 遍历形状矩阵并绘制
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // 跳过空格子
      if (!shape[y][x]) {
        continue;
      }

      // 方块之间的间隔间隙（1px）
      const gap = 1;
      // 实际绘制的方块大小（扣除两侧间隙）
      const size = blockSize - gap;
      // 计算绘制坐标（加上居中偏移和间隙）
      const px = ox + x * blockSize + gap;
      const py = oy + y * blockSize + gap;

      // 填充方块颜色
      ctx.fillStyle = next.color;
      ctx.fillRect(px, py, size, size);

      // 绘制黑色边框
      ctx.strokeStyle = RGBA_BLACK;
      ctx.strokeRect(px, py, size, size);
    }
  }
};

export default renderNextPiece;
