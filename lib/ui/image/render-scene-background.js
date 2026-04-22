import Canvas from '@/lib/ui/core/canvas.js';
import ScenesBackground from '@/lib/ui/constants/images/scenes-background.js';
import FamousBuildings from '@/lib/ui/constants/images/famous-buildings.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';
import getFamousBuildings from '@/lib/utils/get-famous-buildings.js';

const renderSceneBackground = (scene) => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;
  const time = new Date();
  const hour = time.getHours();
  const building = FamousBuildings[getFamousBuildings(hour - 1)];
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
      img = getImage(building);
      size = width * 1.4;
      x = width - size / 1.7;
      y = height - size;
      break;
    }
    case 'paused': {
      img = getImage(ScenesBackground.coffee);
      size = width * 1.5;
      x = width - size * 0.93;
      y = height - size;
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
