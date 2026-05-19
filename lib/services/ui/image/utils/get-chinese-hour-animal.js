/**
 * # 获取十二时辰对应的生肖动物键名
 *
 * 根据当前小时（0-23）返回对应的中国十二生肖动物标识。 每 2 小时对应一个生肖，24 小时共 12 个生肖循环。
 *
 * ## 十二生肖与时辰映射
 *
 * | 小时  | 动物      | 地支 | 时辰名称   |
 * | ----- | --------- | ---- | ---------- |
 * | 0, 23 | `rat`     | 子   | 子时（鼠） |
 * | 1-2   | `ox`      | 丑   | 丑时（牛） |
 * | 3-4   | `tiger`   | 寅   | 寅时（虎） |
 * | 5-6   | `rabbit`  | 卯   | 卯时（兔） |
 * | 7-8   | `dragon`  | 辰   | 辰时（龙） |
 * | 9-10  | `snake`   | 巳   | 巳时（蛇） |
 * | 11-12 | `horse`   | 午   | 午时（马） |
 * | 13-14 | `goat`    | 未   | 未时（羊） |
 * | 15-16 | `monkey`  | 申   | 申时（猴） |
 * | 17-18 | `rooster` | 酉   | 酉时（鸡） |
 * | 19-20 | `dog`     | 戌   | 戌时（狗） |
 * | 21-22 | `pig`     | 亥   | 亥时（猪） |
 *
 * ## 用途
 *
 * 返回值作为 `ChineseHourAnimals` 对象的键名， 用于获取对应的生肖动物 SVG 图标，
 * 在暂停界面的模拟时钟表盘上渲染当前时辰的生肖装饰。
 *
 * @example
 *   getChineseHourAnimal(0); // 'rat'（子时鼠）
 *   getChineseHourAnimal(12); // 'horse'（午时马）
 *   getChineseHourAnimal(23); // 'rat'（子时鼠）
 *
 * @function getChineseHourAnimal
 * @param {number} hour - 当前小时（0-23）
 * @returns {string} 生肖动物键名（如 `'rat'`、`'horse'` 等）
 */
const getChineseHourAnimal = (hour) => {
  // 24 小时对应的 12 生肖动物映射表：每 2 小时使用同一个动物，索引对应小时数
  const map = [
    'rat', // 0  子时（鼠）
    'ox', // 1  丑时（牛）
    'ox', // 2  丑时（牛）
    'tiger', // 3  寅时（虎）
    'tiger', // 4  寅时（虎）
    'rabbit', // 5  卯时（兔）
    'rabbit', // 6  卯时（兔）
    'dragon', // 7  辰时（龙）
    'dragon', // 8  辰时（龙）
    'snake', // 9  巳时（蛇）
    'snake', // 10 巳时（蛇）
    'horse', // 11 午时（马）
    'horse', // 12 午时（马）
    'goat', // 13 未时（羊）
    'goat', // 14 未时（羊）
    'monkey', // 15 申时（猴）
    'monkey', // 16 申时（猴）
    'rooster', // 17 酉时（鸡）
    'rooster', // 18 酉时（鸡）
    'dog', // 19 戌时（狗）
    'dog', // 20 戌时（狗）
    'pig', // 21 亥时（猪）
    'pig', // 22 亥时（猪）
    'rat', // 23 子时（鼠，回归）
  ];

  return map[hour];
};

export default getChineseHourAnimal;
