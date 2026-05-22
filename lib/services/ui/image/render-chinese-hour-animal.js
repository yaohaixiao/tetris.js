import ChineseHourAnimals from '@/lib/services/ui/constants/chinese-hour-animals.js';
import { getImage } from '@/lib/services/ui/image/image-manager.js';
import renderImage from '@/lib/services/ui/image/render-image.js';
import getChineseHourAnimal from '@/lib/services/ui/image/utils/get-chinese-hour-animal.js';

/**
 * # 渲染十二时辰生肖动物
 *
 * 根据当前时间（小时）映射对应的中国十二时辰生肖， 在画布左上角区域绘制对应的动物图片。
 *
 * ## 时辰映射
 *
 * 中国古代将一天分为 12 个时辰，每个时辰对应一个生肖动物：
 *
 * | 时辰 | 时间  | 生肖 |
 * | ---- | ----- | ---- |
 * | 子时 | 23-1  | 鼠   |
 * | 丑时 | 1-3   | 牛   |
 * | 寅时 | 3-5   | 虎   |
 * | 卯时 | 5-7   | 兔   |
 * | 辰时 | 7-9   | 龙   |
 * | 巳时 | 9-11  | 蛇   |
 * | 午时 | 11-13 | 马   |
 * | 未时 | 13-15 | 羊   |
 * | 申时 | 15-17 | 猴   |
 * | 酉时 | 17-19 | 鸡   |
 * | 戌时 | 19-21 | 狗   |
 * | 亥时 | 21-23 | 猪   |
 *
 * ## 渲染位置
 *
 * 图片渲染在画布左上角（x = -size/2, y = -size/2）， 尺寸为画布宽度的 38%。
 *
 * @function renderChineseHourAnimal
 * @param {object} canvas - Canvas 画布管理器对象
 * @returns {void}
 */
const renderChineseHourAnimal = (canvas) => {
  const { gameBoard } = canvas;
  const { width } = gameBoard;

  // 获取当前时间
  const time = new Date();

  // 当前小时（0-23）
  const hour = time.getHours();
  // 小时索引减 1（对应 12 时辰的映射偏移）
  const index = hour - 1;

  // 根据小时映射到十二时辰动物，最小索引为 0
  const animal = getChineseHourAnimal(Math.max(index, 0));

  // 获取对应的图片资源（带缓存）
  const img = getImage(ChineseHourAnimals[animal]);

  // 图片尺寸：画布宽度的 38%
  const size = Math.floor(width * 0.38);

  // 绘制起始坐标（左上角偏移）
  const x = -size / 2;
  const y = -size / 2;

  // 渲染图片到画布
  renderImage(canvas, { img, x, y, size });
};

export default renderChineseHourAnimal;
