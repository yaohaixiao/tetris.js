/**
 * 逆时针旋转矩阵
 *
 * 将二维矩阵逆时针旋转 90 度。例如 2×3 矩阵旋转后变为 3×2 矩阵。
 *
 * 旋转原理： 原矩阵中的元素 matrix[i][j] 会移动到 rotated[cols - 1 - j][i]。
 *
 * @example
 *   // 输入 2×3 矩阵
 *   [
 *     [1, 1, 0],
 *     [0, 1, 1],
 *   ][
 *     // 输出 3×2 矩阵
 *     ([1, 0], [1, 1], [0, 1])
 *   ];
 *
 * @param {number[][]} matrix - 原始矩阵，元素为 0 或 1
 * @returns {number[][]} 逆时针旋转 90 度后的新矩阵
 */
const rotateCounterClockwise = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols })
    .fill(0)
    .map(() => Array.from({ length: rows }).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[cols - 1 - j][i] = matrix[i][j];
    }
  }

  return rotated;
};

export default rotateCounterClockwise;
