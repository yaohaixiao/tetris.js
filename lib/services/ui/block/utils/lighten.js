/**
 * ## 将十六进制颜色变亮
 *
 * @param {string} hex - 十六进制颜色值（如 `#ffa500`）
 * @param {number} factor - 变亮比例（0-1，0.5 即提升 50% 亮度）
 * @returns {string} 变亮后的十六进制颜色值
 */
const lighten = (hex, factor) => {
  // 解析 R、G、B 通道值
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  // 各通道按比例向 255 靠近
  const lr = Math.min(255, Math.floor(r + (255 - r) * factor));
  const lg = Math.min(255, Math.floor(g + (255 - g) * factor));
  const lb = Math.min(255, Math.floor(b + (255 - b) * factor));

  // 重新拼接为十六进制颜色
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
};

export default lighten;
