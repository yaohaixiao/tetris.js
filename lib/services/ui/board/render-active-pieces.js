import renderBlock from '@/lib/services/ui/core/render-block.js';

/**
 * # 绘制当前活动方块
 *
 * 遍历当前方块的形状矩阵，在棋盘的指定偏移位置绘制所有实心格子。 每个实心格子通过 `renderBlock` 以带边框的彩色方块形式呈现。
 *
 * ## 坐标计算
 *
 * - 棋盘坐标 = 方块左上角坐标 (cx, cy) + 形状内偏移 (x, y)
 * - 只绘制 `shape[y][x]` 为非零值的格子
 *
 * @function renderActivePieces
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} curr - 当前活动方块对象
 * @param {number} cx - 方块左上角在棋盘上的 X 坐标（列索引）
 * @param {number} cy - 方块左上角在棋盘上的 Y 坐标（行索引）
 * @returns {boolean} 始终返回 true，表示绘制完成
 */
const renderActivePieces = (canvas, curr, cx, cy) => {
  // 获取当前方块的形状矩阵和颜色
  const { shape, color } = curr;
  const { length } = shape;

  // 遍历形状矩阵的每个格子
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // 只绘制非空格子（实心部分）
      if (shape[y][x]) {
        // 在棋盘的 (cx + x, cy + y) 位置绘制带颜色的方块
        renderBlock(canvas, cx + x, cy + y, color);
      }
    }
  }

  return true;
};

export default renderActivePieces;
