/**
 * ============================================================
 *
 * # 顺时针旋转矩阵 90°
 *
 * ============================================================
 *
 * 将二维矩阵顺时针旋转 90 度，用于生成方块的不同旋转状态。
 *
 * ## 算法说明
 *
 * 对于原矩阵中位置 (y, x) 的元素， 旋转后的新位置为 (x, rows - y - 1)。 旋转后行列互换。
 *
 * ## 不可变性
 *
 * 函数不会修改原始矩阵，而是创建并返回一个新矩阵。
 *
 * @function rotateMatrix
 * @param {number[][]} matrix - 原始二维矩阵
 * @returns {number[][]} 顺时针旋转 90° 后的新矩阵
 */
const rotateMatrix = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;

  // 创建旋转后的新矩阵：cols 行 × rows 列
  const next = Array.from({ length: cols }, () =>
    Array.from({ length: rows }).fill(0),
  );

  // 顺时针旋转 90° 的坐标映射：原 (y, x) → 新 (x, rows - y - 1)
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      next[x][rows - y - 1] = matrix[y][x];
    }
  }

  return next;
};

export default rotateMatrix;
