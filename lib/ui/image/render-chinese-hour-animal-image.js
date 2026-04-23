import Canvas from '@/lib/ui/core/canvas.js';
import ChineseHourAnimals from '@/lib/ui/constants/images/chinese-hour-animals.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';
import getChineseHourAnimal from '@/lib/ui/image/utils/get-chinese-hour-animal.js';

const renderChineseHourAnimalImage = () => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width } = gameBoard;
  const time = new Date();
  const hour = time.getHours();
  const animal = getChineseHourAnimal(hour - 1);
  const img = getImage(ChineseHourAnimals[animal]);

  const size = Math.floor(width * 0.38);
  const x = -size / 2;
  const y = -size / 2;

  renderImage(ctx, img, x, y, size);
};

export default renderChineseHourAnimalImage;
