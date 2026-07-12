/**
 * ============================================================
 *
 * # 获取十二时辰对应的字符键名
 *
 * ============================================================
 *
 * 根据当前小时（0-23）返回对应的中国地支时辰字符标识。 每 2 小时对应一个时辰，24 小时共 12 个时辰循环。
 *
 * ## 十二时辰映射
 *
 * | 小时  | 字符 | 地支 | 时辰名称     |
 * | :---- | :--- | :--- | :----------- |
 * | 0, 23 | zi   | 子   | 子时（夜半） |
 * | 1-2   | chou | 丑   | 丑时         |
 * | 3-4   | yin  | 寅   | 寅时         |
 * | 5-6   | mao  | 卯   | 卯时         |
 * | 7-8   | chen | 辰   | 辰时         |
 * | 9-10  | si   | 巳   | 巳时         |
 * | 11-12 | wu   | 午   | 午时         |
 * | 13-14 | wei  | 未   | 未时         |
 * | 15-16 | shen | 申   | 申时         |
 * | 17-18 | you  | 酉   | 酉时         |
 * | 19-20 | xu   | 戌   | 戌时         |
 * | 21-22 | hai  | 亥   | 亥时         |
 *
 * ## 用途
 *
 * 返回值作为 ChineseHourCharacters 对象的键名， 用于获取对应的时辰汉字 SVG 图标进行渲染。
 *
 * ## 示例
 *
 * ```javascript
 * getChineseHourCharacter(0); // 'zi'（子时）
 * getChineseHourCharacter(12); // 'wu'（午时）
 * getChineseHourCharacter(23); // 'zi'（子时）
 * ```
 *
 * @function getChineseHourCharacter
 * @param {number} hour - 当前小时（0-23）
 * @returns {string} 时辰字符键名（如 'zi'、'wu' 等）
 */
const getChineseHourCharacter = (hour) => {
  // 24 小时对应的 12 时辰字符映射表
  const map = [
    'zi', // 0  子时
    'chou', // 1  丑时
    'chou', // 2  丑时
    'yin', // 3  寅时
    'yin', // 4  寅时
    'mao', // 5  卯时
    'mao', // 6  卯时
    'chen', // 7  辰时
    'chen', // 8  辰时
    'si', // 9  巳时
    'si', // 10 巳时
    'wu', // 11 午时
    'wu', // 12 午时
    'wei', // 13 未时
    'wei', // 14 未时
    'shen', // 15 申时
    'shen', // 16 申时
    'you', // 17 酉时
    'you', // 18 酉时
    'xu', // 19 戌时
    'xu', // 20 戌时
    'hai', // 21 亥时
    'hai', // 22 亥时
    'zi', // 23 子时（回归）
  ];

  return map[hour];
};

export default getChineseHourCharacter;
