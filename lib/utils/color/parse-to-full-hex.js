/**
 * ============================================================
 *
 * # 将短格式十六进制颜色转为标准 6 位格式
 *
 * ============================================================
 *
 * 将 #RGB 短格式扩展为 #RRGGBB 标准格式。 如果已是 6 位格式则原样返回。
 *
 * ## 示例
 *
 * ```javascript
 * parseToFullHex('#fff'); // '#ffffff'
 * parseToFullHex('#0af'); // '#00aaff'
 * parseToFullHex('#FF6B6B'); // '#FF6B6B'（原样返回）
 * ```
 *
 * @function parseToFullHex
 * @param {string} hex - 十六进制颜色值（#RGB 或 #RRGGBB）
 * @returns {string} 6 位标准格式的十六进制颜色值
 */
const parseToFullHex = (hex) =>
  hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;

export default parseToFullHex;
