/**
 * # 数字补零工具函数
 *
 * 将数字转换为字符串并在左侧补 0，使其达到指定长度
 *
 * @function padStart
 * @param {number} n - 需要补零的原始数字
 * @param {number} len - 补零后目标字符串长度
 * @returns {string} - 补零后的固定长度字符串
 */
const padStart = (n, len) => n.toString().padStart(len, '0');

export default padStart;
