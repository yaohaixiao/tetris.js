import Canvas from '@/lib/ui/core/canvas.js';
import Images from '@/lib/ui/constants/images/scenes-background.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';

const renderGamepadImage = () => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;
  const img = getImage(Images.gamepad);
  const size = Math.floor(width * 0.54);
  const x = width / 2 - size / 2;
  const y = height / 2 - size * 1.2;

  renderImage(ctx, img, x, y, size);
};

export default renderGamepadImage;
