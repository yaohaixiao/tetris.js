/**
 * # 将十六进制颜色字符串转换为 rgba 格式，支持透明度控制
 *
 * 这是实现玻璃质感方块的核心工具函数，让实色能变成半透明。
 *
 * ## 转换规则
 *
 * - 输入格式：#RRGGBB（如 "#FF6B6B"）或 #RGB 短格式（如 "#fff"）
 * - 输出格式：rgba(R, G, B, Alpha)（如 "rgba(255, 107, 107, 0.7)"）
 * - 短格式会自动扩展为长格式后再解析
 * - Alpha 由调用方传入，范围通常为 0 ~ 1
 *
 * ## 使用示例
 *
 * - HexToRgba("#FF0000", 0.5) → "rgba(255, 0, 0, 0.5)"
 * - HexToRgba("#fff", 0.8) → "rgba(255, 255, 255, 0.8)"
 *
 * @param {string} hex - 十六进制颜色字符串，格式为 #RRGGBB 或 #RGB
 * @param {number} [alpha=1] - 不透明度，取值范围 0（完全透明）到 1（完全不透明）. Default is `1`
 * @returns {string} Rgba 格式的颜色字符串
 */
const hexToRgba = (hex, alpha = 1) => {
  /*
   * ==================== 统一为 6 位长格式 ====================
   *
   * 如果是 #RGB 短格式（长度为 4），将每位重复一次扩展为 #RRGGBB
   * 例如：#fff → #ffffff，#0af → #00aaff
   */
  let fullHex = hex;

  if (hex.length === 4) {
    fullHex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  /*
   * ==================== 提取 RGB 通道 ====================
   *
   * 使用 Number.parseInt 将十六进制子串转为十进制整数。
   *
   * - fullHex.slice(1, 3)：提取第 1~2 位（红色通道）
   * - fullHex.slice(3, 5)：提取第 3~4 位（绿色通道）
   * - fullHex.slice(5, 7)：提取第 5~6 位（蓝色通道）
   */
  const r = Number.parseInt(fullHex.slice(1, 3), 16);
  const g = Number.parseInt(fullHex.slice(3, 5), 16);
  const b = Number.parseInt(fullHex.slice(5, 7), 16);

  /*
   * ==================== 拼接 rgba 字符串 ====================
   *
   * 使用模板字符串直接嵌入变量，生成 CSS rgba() 函数格式
   */
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default hexToRgba;
