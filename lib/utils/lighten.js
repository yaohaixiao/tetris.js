/**
 * # 将十六进制颜色变亮
 *
 * 将十六进制颜色值的 R、G、B 三个通道按指定比例向 255（纯白）靠近， 返回变亮后的颜色值。用于生成高光、悬停态等需要比主色更亮的颜色。
 *
 * ## 算法
 *
 * 1. 解析 hex 字符串，提取 R、G、B 三个通道的十进制值
 * 2. 每个通道值向 255 靠近指定比例：`value + (255 - value) × factor`
 * 3. Math.min 确保结果不超过 255
 * 4. 重新拼接为 `#RRGGBB` 格式的十六进制字符串
 *
 * ## 与 darken 的对比
 *
 * | 函数    | 方向        | 公式                             |
 * | ------- | ----------- | -------------------------------- |
 * | darken  | 向 0 靠近   | `value × (1 - factor)`           |
 * | lighten | 向 255 靠近 | `value + (255 - value) × factor` |
 *
 * ## 示例
 *
 * - `lighten("#804040", 0.5)` → `#BF9F9F`（向白色靠近 50%）
 * - `lighten("#0080FF", 0.3)` → `#4CB3FF`（向白色靠近 30%）
 *
 * @param {string} hex - 十六进制颜色值，格式为 #RRGGBB（如 `#FFA500`）
 * @param {number} factor - 变亮比例，取值范围 0-1。0 表示不变，1 表示变为纯白。例如 0.5 即向白色靠近 50%
 * @returns {string} 变亮后的十六进制颜色值，格式为 #RRGGBB
 */
const lighten = (hex, factor) => {
  /*
   * ==================== 解析 RGB 通道 ====================
   *
   * 使用 Number.parseInt 将十六进制子串转为十进制整数：
   * - hex.slice(1, 3)：红色通道
   * - hex.slice(3, 5)：绿色通道
   * - hex.slice(5, 7)：蓝色通道
   */
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  /*
   * ==================== 按比例向白色靠近 ====================
   *
   * 每个通道值加上 (255 - 当前值) × factor，
   * 即向 255 靠近指定比例。Math.min 确保不超出 255。
   */
  const lr = Math.min(255, Math.floor(r + (255 - r) * factor));
  const lg = Math.min(255, Math.floor(g + (255 - g) * factor));
  const lb = Math.min(255, Math.floor(b + (255 - b) * factor));

  /*
   * ==================== 拼接为十六进制颜色 ====================
   *
   * 将三个通道值转回十六进制字符串，padStart(2, '0') 确保单字符时前面补 0
   */
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
};

export default lighten;
