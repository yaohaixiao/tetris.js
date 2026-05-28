/**
 * ## 将十六进制颜色变暗
 *
 * @param {string} hex - 十六进制颜色值（如 `#ffa500`）
 * @param {number} factor - 变暗比例（0-1，0.4 即降低 40% 亮度）
 * @returns {string} 变暗后的十六进制颜色值
 */
const darken = (hex, factor) => {
  // 解析 R、G、B 通道值
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  // 各通道按比例降低亮度
  const dr = Math.floor(r * (1 - factor));
  const dg = Math.floor(g * (1 - factor));
  const db = Math.floor(b * (1 - factor));

  // 重新拼接为十六进制颜色
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
};

export default darken;
