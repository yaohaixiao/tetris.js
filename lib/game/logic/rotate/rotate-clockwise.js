/**
 * ============================================================
 *
 * # 顺时针旋转矩阵
 *
 * ============================================================
 *
 * 将二维矩阵顺时针旋转 90°，行列互换并调整元素位置。
 *
 * ## 旋转原理
 *
 * 原矩阵中的元素 matrix[i][j] 会移动到 rotated[j][rows - 1 - i]：
 *
 * - 新行索引 = 旧列索引 j
 * - 新列索引 = 矩阵总行数 - 1 - 旧行索引 i
 *
 * ## 尺寸变化
 *
 * 旋转后矩阵维度互换：原 N×M 矩阵变为 M×N 矩阵。
 *
 * ## 旋转示例
 *
 *     输入 (2×3)：        输出 (3×2)：
 *     [1, 1, 0]          [0, 1]
 *     [0, 1, 1]          [1, 1]
 *                        [1, 0]
 *
 * @function rotateClockwise
 * @param {number[][]} matrix - 原始矩阵
 * @returns {number[][]} 顺时针旋转 90° 后的新矩阵
 */
const rotateClockwise = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;

  // 创建旋转后的空矩阵：cols 行 × rows 列
  const rotated = Array.from({ length: cols })
    .fill(0)
    .map(() => Array.from({ length: rows }).fill(0));

  // 执行旋转映射：rotated[j][rows - 1 - i] = matrix[i][j]
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[j][rows - 1 - i] = matrix[i][j];
    }
  }

  return rotated;
};

export default rotateClockwise;
