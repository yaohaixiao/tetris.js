/**
 * ============================================================
 *
 * # 计算旋转后的 rotation 状态值（0-3 循环）
 *
 * ============================================================
 *
 * 在 0（初始）、1（R，顺时针一次）、2（两次）、3（L，逆时针一次）之间循环。 用于索引 SRS 墙踢数据表中的偏移组。
 *
 * ## 公式
 *
 * NewRotation = (current + direction + 4) % 4
 *
 * - +4 确保被取余前为非负数
 * - %4 将值限制在 0-3 范围内
 *
 * ## 示例
 *
 * | current | direction | 计算过程  | newRotation |
 * | :------ | :-------- | :-------- | :---------- |
 * | 0       | 1         | (0+1+4)%4 | 1（R）      |
 * | 1       | 1         | (1+1+4)%4 | 2           |
 * | 3       | 1         | (3+1+4)%4 | 0           |
 * | 0       | -1        | (0-1+4)%4 | 3（L）      |
 *
 * @function computeNewRotation
 * @param {number} current - 当前 rotation 值（0-3）
 * @param {number} direction - 旋转方向（1=顺时针，-1=逆时针）
 * @returns {number} 新的 rotation 值（0-3）
 */
const computeNewRotation = (current, direction) =>
  ((current ?? 0) + direction + 4) % 4;

export default computeNewRotation;
