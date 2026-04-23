import Canvas from '@/lib/ui/core/canvas.js';
import ScenesBackground from '@/lib/ui/constants/images/scenes-background.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';

const renderSceneBackground = (scene) => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;
  const hours = new Date().getHours();
  const icon = hours > 11 ? 'tower' : 'temple';
  let img;
  let size;
  let x;
  let y;

  switch (scene) {
    case 'main-menu':
    case 'countdown': {
      img = getImage(ScenesBackground.tetris);
      size = width;
      x = width / 2 - size / 2;
      y = height - size;
      break;
    }
    case 'playing': {
      img = getImage(ScenesBackground[icon]);
      size = width * (hours > 11 ? 1.8 : 1.46);
      x = width - (hours > 11 ? size / 1.6 : size);
      y = height - size;
      break;
    }
    case 'paused': {
      img = getImage(ScenesBackground.coffee);
      size = width * 0.86;
      x = width / 2 - size / 2;
      y = height - size * 0.94;
      break;
    }
    case 'game-over': {
      img = getImage(ScenesBackground.happy);
      size = Math.floor(width * 0.42);
      x = width / 2 - size / 2;
      y = height / 2 - size * 1.35;
      break;
    }
  }

  renderImage(ctx, img, x, y, size);
};

export default renderSceneBackground;
