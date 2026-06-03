/**
 * # 将十六进制颜色字符串转换为 rgba 格式，支持透明度控制
 *
 * 这是实现玻璃质感方块的核心工具函数，让实色能变成半透明。
 *
 * ## 转换规则
 *
 * - 输入格式：#RRGGBB（如 "#FF6B6B"）
 * - 输出格式：rgba(R, G, B, Alpha)（如 "rgba(255, 107, 107, 0.7)"）
 * - R、G、B 分别取十六进制的前两位、中间两位、后两位
 * - Alpha 由调用方传入，范围通常为 0 ~ 1
 *
 * ## 使用示例
 *
 * - HexToRgba("#FF0000", 0.5) → "rgba(255, 0, 0, 0.5)"
 * - HexToRgba("#00FF00", 0.8) → "rgba(0, 255, 0, 0.8)"
 * - HexToRgba("#0000FF", 1) → "rgba(0, 0, 255, 1)"
 *
 * @param {string} hex - 十六进制颜色字符串，格式为 #RRGGBB
 * @param {number} alpha - 不透明度，取值范围 0（完全透明）到 1（完全不透明）
 * @returns {string} Rgba 格式的颜色字符串
 */
const hexToRgba = (hex, alpha) => {
  /*
   * ==================== 提取 RGB 通道 ====================
   *
   * 使用 Number.parseInt 将十六进制子串转为十进制整数。
   *
   * - hex.slice(1, 3)：提取第 1~2 位（红色通道），基数 16 表示十六进制解析
   * - hex.slice(3, 5)：提取第 3~4 位（绿色通道）
   * - hex.slice(5, 7)：提取第 5~6 位（蓝色通道）
   *
   * 例如 "#FF6B6B"：
   *   R = parseInt("FF", 16) = 255
   *   G = parseInt("6B", 16) = 107
   *   B = parseInt("6B", 16) = 107
   */
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  /*
   * ==================== 拼接 rgba 字符串 ====================
   *
   * 使用模板字符串直接嵌入变量，生成 CSS rgba() 函数格式。
   * 例如 "rgba(255, 107, 107, 0.7)"
   */
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default hexToRgba;
