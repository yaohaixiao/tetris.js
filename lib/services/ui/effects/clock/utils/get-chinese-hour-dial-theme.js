/**
 * ============================================================
 *
 * # 获取中国时辰表盘主题色
 *
 * ============================================================
 *
 * 根据当前小时返回对应的表盘主题色名称。 每 2 小时更换一种颜色，24 小时共 12 种颜色循环。
 *
 * ## 颜色映射
 *
 * | 小时  | 主题色 | 说明         |
 * | :---- | :----- | :----------- |
 * | 0     | Red    | 子时（夜半） |
 * | 1-2   | White  | 丑时         |
 * | 3-4   | Orange | 寅时         |
 * | 5-6   | Cyan   | 卯时         |
 * | 7-8   | Blue   | 辰时         |
 * | 9-10  | Coral  | 巳时         |
 * | 11-12 | Purple | 午时         |
 * | 13-14 | Green  | 未时         |
 * | 15-16 | Yellow | 申时         |
 * | 17-18 | Pink   | 酉时         |
 * | 19-20 | Teal   | 戌时         |
 * | 21-22 | Violet | 亥时         |
 * | 23    | Red    | 回到子时     |
 *
 * @function getChineseHourDialTheme
 * @param {number} hour - 当前小时（0-23）
 * @returns {string} 主题色名称（如 'Red'、'Blue' 等）
 */
const getChineseHourDialTheme = (hour) => {
  // 24 小时对应 12 种颜色，每 2 小时换一种
  const map = [
    'Red', // 0  子时
    'White', // 1  丑时
    'White', // 2
    'Orange', // 3  寅时
    'Orange', // 4
    'Cyan', // 5  卯时
    'Cyan', // 6
    'Blue', // 7  辰时
    'Blue', // 8
    'Coral', // 9  巳时
    'Coral', // 10
    'Purple', // 11 午时
    'Purple', // 12
    'Green', // 13 未时
    'Green', // 14
    'Yellow', // 15 申时
    'Yellow', // 16
    'Pink', // 17 酉时
    'Pink', // 18
    'Teal', // 19 戌时
    'Teal', // 20
    'Violet', // 21 亥时
    'Violet', // 22
    'Red', // 23 回到子时
  ];

  return map[hour];
};

export default getChineseHourDialTheme;
