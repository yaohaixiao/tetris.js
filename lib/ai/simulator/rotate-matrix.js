/**
 * # 顺时针旋转矩阵 90°
 *
 * 将二维矩阵顺时针旋转 90 度，用于生成方块的不同旋转状态。
 *
 * ## 算法说明
 *
 * 对于原矩阵中位置 (y, x) 的元素，旋转后的新位置为 (x, rows - y - 1)。
 * 旋转后，原矩阵的行数变为新矩阵的列数，原矩阵的列数变为新矩阵的行数。
 *
 * ## 旋转效果示例
 *
 *     T 型方块（初始）：
 *       [0, 1, 0]
 *       [1, 1, 1]
 *
 *     顺时针旋转 90°：
 *       [1, 0]
 *       [1, 1]
 *       [1, 0]
 *
 *     旋转 180°：
 *       [1, 1, 1]
 *       [0, 1, 0]
 *
 *     旋转 270°：
 *       [0, 1]
 *       [1, 1]
 *       [0, 1]
 *
 *     旋转 360°：回到初始状态
 *
 * ## 不可变性
 *
 * 函数不会修改原始矩阵，而是创建并返回一个新矩阵。 传入的 `matrix` 参数在函数调用后保持不变。
 *
 * @example
 *   const shape = [
 *     [0, 1, 0],
 *     [1, 1, 1],
 *   ];
 *   const rotated = rotateMatrix(shape);
 *   // rotated = [[1, 0], [1, 1], [1, 0]]
 *   // shape 保持不变
 *
 * @function rotateMatrix
 * @param {number[][]} matrix - 原始二维矩阵
 * @returns {number[][]} 顺时针旋转 90° 后的新矩阵
 */
const rotateMatrix = (matrix) => {
  // 原始矩阵的行数和列数
  const rows = matrix.length;
  const cols = matrix[0].length;

  /*
   * 创建旋转后的新矩阵：
   * - 新矩阵的行数 = 原矩阵的列数
   * - 新矩阵的列数 = 原矩阵的行数
   * - 初始值全部填充为 0
   */
  const next = Array.from({ length: cols }, () =>
    Array.from({ length: rows }).fill(0),
  );

  // 遍历原始矩阵的每个元素
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      // 顺时针旋转 90° 的坐标映射：原 (y, x) → 新 (x, rows - y - 1)
      next[x][rows - y - 1] = matrix[y][x];
    }
  }

  return next;
};

export default rotateMatrix;
