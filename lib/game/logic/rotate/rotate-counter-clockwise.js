/**
 * # 逆时针旋转矩阵
 *
 * 将二维矩阵逆时针旋转 90°，行列互换并调整元素位置。
 *
 * ## 旋转原理
 *
 * 原矩阵中的元素 `matrix[i][j]` 会移动到 `rotated[cols - 1 - j][i]`：
 *
 * - 新行索引 = 矩阵总列数 - 1 - 旧列索引 j
 * - 新列索引 = 旧行索引 i
 *
 * ## 尺寸变化
 *
 * 旋转后矩阵维度互换：原 N×M 矩阵变为 M×N 矩阵。
 *
 * ## 旋转示例
 *
 *     输入 (2×3)：        输出 (3×2)：
 *     [1, 1, 0]          [1, 0]
 *     [0, 1, 1]          [1, 1]
 *                         [0, 1]
 *
 * ## 与顺时针旋转的对比
 *
 * | 方向   | 映射公式                 |
 * | ------ | ------------------------ |
 * | 顺时针 | rotated[j][rows - 1 - i] |
 * | 逆时针 | rotated[cols - 1 - j][i] |
 *
 * @param {number[][]} matrix - 原始矩阵，元素为 0 或 1（0 表示空格，1 表示方块）
 * @returns {number[][]} 逆时针旋转 90° 后的新矩阵，行列维度互换
 */
const rotateCounterClockwise = (matrix) => {
  /*
   * ==================== 获取原始矩阵尺寸 ====================
   *
   * rows — 原始矩阵的行数（旋转后变为列数）
   * cols — 原始矩阵的列数（旋转后变为行数）
   */
  const rows = matrix.length;
  const cols = matrix[0].length;

  /*
   * ==================== 创建旋转后的空矩阵 ====================
   *
   * 新矩阵维度：cols 行 × rows 列
   * 先用 Array.from 创建指定长度的数组，再填充 0 作为初始值
   */
  const rotated = Array.from({ length: cols })
    .fill(0)
    .map(() => Array.from({ length: rows }).fill(0));

  /*
   * ==================== 执行旋转映射 ====================
   *
   * 遍历原矩阵的每个元素，按逆时针公式映射到新位置：
   * rotated[cols - 1 - j][i] = matrix[i][j]
   */
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[cols - 1 - j][i] = matrix[i][j];
    }
  }

  return rotated;
};

export default rotateCounterClockwise;
