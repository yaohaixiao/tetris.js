/**
 * # 数字补零工具函数（增强版）
 *
 * 将输入值转换为字符串，并在左侧补 0，使其达到指定长度。 常用于时间格式化（如：月份、分钟、秒）。
 *
 * 特性：
 *
 * - 自动处理非数字输入（转为数字）
 * - 支持负数（符号保留，数值部分补零）
 * - 对非法长度参数做安全兜底
 *
 * 示例：
 *
 * ```js
 * padStart(5, 2); // "05"
 * padStart(12, 2); // "12"
 * padStart(-3, 3); // "-003"
 * padStart(7, 4); // "0007"
 * ```
 *
 * @function padStart
 * @param {number | string} n - 需要补零的值（会被转为数字）
 * @param {number} len - 目标字符串长度（>= 0）
 * @returns {string} - 补零后的字符串
 */
const padStart = (n, len) => {
  // 转为数字
  const num = Number(n);

  // 非法数字兜底
  if (!Number.isFinite(num)) {
    return '';
  }

  // 长度保护（避免负数或非整数）
  const targetLen = Math.max(0, Math.floor(len));

  const sign = num < 0 ? '-' : '';
  const absStr = Math.abs(num).toString();

  return sign + absStr.padStart(targetLen, '0');
};

export default padStart;
