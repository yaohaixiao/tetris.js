import Canvas from '@/lib/ui/core/canvas.js';
import ChineseHourAnimals from '@/lib/ui/constants/images/chinese-hour-animals.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';
import getChineseHourAnimal from '@/lib/ui/image/utils/get-chinese-hour-animal.js';

/**
 * # 渲染十二时辰生肖动物
 *
 * 根据当前时间（小时）映射对应的中国十二时辰生肖，并在画布中心绘制对应图片。
 *
 * 流程：
 *
 * 1. 获取当前系统小时
 * 2. 映射到十二时辰动物
 * 3. 从 SVG/Image 缓存中获取图片
 * 4. 居中渲染到画布
 */
const renderChineseHourAnimal = () => {
  const { gameBoard } = Canvas;
  const { width } = gameBoard;

  // 获取当前时间
  const time = new Date();

  // 当前小时（0-23）
  const hour = time.getHours();

  // 根据小时映射到十二时辰动物
  const animal = getChineseHourAnimal(hour - 1);

  // 获取对应图片（带缓存）
  const img = getImage(ChineseHourAnimals[animal]);

  // 图片尺寸（画布宽度比例）
  const size = Math.floor(width * 0.38);

  // 居中绘制坐标
  const x = -size / 2;
  const y = -size / 2;

  // 渲染图片
  renderImage(img, x, y, size);
};

export default renderChineseHourAnimal;
