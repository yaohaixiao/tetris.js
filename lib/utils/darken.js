/**
 * # 将十六进制颜色变暗
 *
 * 将十六进制颜色值的 R、G、B 三个通道按指定比例降低亮度， 返回变暗后的颜色值。用于生成方块边框、阴影等需要比主色更暗的颜色。
 *
 * ## 算法
 *
 * 1. 解析 hex 字符串，提取 R、G、B 三个通道的十进制值
 * 2. 每个通道值乘以 `(1 - factor)`，降低亮度
 * 3. 重新拼接为 `#RRGGBB` 格式的十六进制字符串
 *
 * ## 示例
 *
 * - `darken("#FF6B6B", 0.35)` → `#A64545`（降低 35% 亮度）
 * - `darken("#80FF00", 0.5)` → `#407F00`（降低 50% 亮度）
 *
 * @param {string} hex - 十六进制颜色值，格式为 #RRGGBB（如 `#FFA500`）
 * @param {number} factor - 变暗比例，取值范围 0-1。0 表示不变，1 表示变为纯黑。例如 0.4 即降低 40% 亮度
 * @returns {string} 变暗后的十六进制颜色值，格式为 #RRGGBB
 */
const darken = (hex, factor) => {
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
   * ==================== 按比例降低亮度 ====================
   *
   * 每个通道值乘以 (1 - factor)，Math.floor 向下取整确保结果为整数
   */
  const dr = Math.floor(r * (1 - factor));
  const dg = Math.floor(g * (1 - factor));
  const db = Math.floor(b * (1 - factor));

  /*
   * ==================== 拼接为十六进制颜色 ====================
   *
   * 将三个通道值转回十六进制字符串，padStart(2, '0') 确保单字符时前面补 0
   * 例如：dr = 10 → "0a"，dr = 166 → "a6"
   */
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
};

export default darken;
