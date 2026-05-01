import renderBlock from '@/lib/ui/core/render-block.js';

/**
 * # 绘制当前方块
 *
 * 遍历当前方块的形状矩阵，在指定位置绘制所有格子
 *
 * @function renderActivePieces
 * @param {object} curr - 当前活动方块对象
 * @param {number[][]} curr.shape - 方块的形状矩阵（二维数组，非0表示有格子）
 * @param {string} curr.color - 方块的填充颜色
 * @param {number} cx - 方块左上角在棋盘上的 X 坐标（列）
 * @param {number} cy - 方块左上角在棋盘上的 Y 坐标（行）
 * @returns {boolean} - 执行完成，返回 true，否则返回 false
 */
const renderActivePieces = (curr, cx, cy) => {
  // 获取当前方块的形状矩阵
  const { shape, color } = curr;
  const { length } = shape;

  // 双层循环遍历方块的形状矩阵
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // 如果当前位置有方块，则绘制到棋盘对应位置
      if (shape[y][x]) {
        renderBlock(cx + x, cy + y, color);
      }
    }
  }

  return true;
};

export default renderActivePieces;
