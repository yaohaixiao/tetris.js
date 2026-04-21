import Canvas from '@/lib/ui/core/canvas.js';
import Images from '@/lib/ui/constants/images.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';

const renderTempleImage = () => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;
  const img = getImage(Images.temple);
  const size = width * 1.4;
  const x = width - size / 2;
  const y = height - size;

  renderImage(ctx, img, x, y, size);
};

export default renderTempleImage;
