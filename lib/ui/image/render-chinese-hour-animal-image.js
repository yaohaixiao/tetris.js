import Canvas from '@/lib/ui/core/canvas.js';
import Images from '@/lib/ui/constants/images.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';
import getChineseHourAnimal from '@/lib/utils/get-chinese-hour-animal.js';

const renderChineseHourAnimalImage = () => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width } = gameBoard;
  const time = new Date();
  const hour = time.getHours();
  const animal = getChineseHourAnimal(hour - 1);
  const img = getImage(Images[animal]);
  const size = Math.floor(width * 0.3);
  const x = -size / 2;
  const y = -size / 2;

  renderImage(ctx, img, x, y, size);
};

export default renderChineseHourAnimalImage;
