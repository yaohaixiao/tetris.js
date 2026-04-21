import Canvas from '@/lib/ui/core/canvas.js';
import Images from '@/lib/ui/constants/images.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';

const renderTetrisImage = () => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;
  const img = getImage(Images.tetris);
  const size = width;
  const x = width / 2 - size / 2;
  const y = height - size;

  renderImage(ctx, img, x, y, size);
};

export default renderTetrisImage;
