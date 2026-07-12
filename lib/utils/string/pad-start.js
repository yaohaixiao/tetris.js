/**
 * ============================================================
 *
 * # 数字补零工具函数（增强版）
 *
 * ============================================================
 *
 * 将输入值转换为字符串，并在左侧补 0 使其达到指定长度。 常用于时间格式化（月份、分钟、秒）或 UI 数字显示。
 *
 * ## 特性
 *
 * - 自动处理非数字输入：'5' 转为数字 5
 * - 支持负数：符号保留，数值部分补零（-3 → '-003'）
 * - 非法输入兜底：NaN、Infinity、非法长度做安全处理
 * - 长度保护：负数长度或非整数长度被修正为合法值
 *
 * ## 示例
 *
 * ```javascript
 * padStart(5, 2); // "05"
 * padStart(12, 2); // "12"
 * padStart(-3, 3); // "-003"
 * padStart(7, 4); // "0007"
 * padStart(NaN, 2); // ""
 * ```
 *
 * @function padStart
 * @param {number | string} n - 需要补零的值（转为数字）
 * @param {number} len - 目标字符串长度（>= 0，取整）
 * @returns {string} 补零后的字符串，非法输入返回空字符串
 */
const padStart = (n, len) => {
  // 转为数字（处理字符串输入）
  const num = Number(n);

  // 非法数字（NaN、Infinity）返回空字符串
  if (!Number.isFinite(num)) {
    return '';
  }

  // 长度保护：避免负数或非整数，取整且最小为 0
  const targetLen = Math.max(0, Math.floor(len));

  // 处理符号：负数保留 '-'，正数无符号
  const sign = num < 0 ? '-' : '';
  // 取绝对值后转字符串
  const absStr = Math.abs(num).toString();

  // 使用 String.prototype.padStart 补零
  return sign + absStr.padStart(targetLen, '0');
};

export default padStart;
