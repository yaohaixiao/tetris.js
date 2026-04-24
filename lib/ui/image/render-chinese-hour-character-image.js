import Canvas from '@/lib/ui/core/canvas.js';
import ChineseHourCharacters from '@/lib/ui/constants/images/chinese-hour-characters.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';
import getChineseHourCharacter from '@/lib/ui/image/utils/get-chinese-hour-character.js';

const renderChineseHourCharacterImage = () => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;
  const time = new Date();
  const hour = time.getHours();
  const character = getChineseHourCharacter(hour);
  const img = getImage(ChineseHourCharacters[character]);
  let size;
  let x;
  let y;

  if (hour >= 0 && hour <= 3) {
    size = Math.floor(width * 0.48);
    x = width - size * 0.7;
    y = height / 2 - size * 1.4;
  } else if (hour > 4 && hour <= 7) {
    size = Math.floor(width * 0.52);
    x = width - size * 1.1;
    y = height / 2 - size * 1.7;
  } else if (hour > 7 && hour <= 11) {
    size = Math.floor(width * 0.58);
    x = width - size * 1.2;
    y = height / 2 - size * 1.75;
  } else if (hour > 11 && hour <= 14) {
    size = Math.floor(width * 0.68);
    x = width / 2 - size / 2;
    y = -size * 0.1;
  } else if (hour > 14 && hour <= 16) {
    size = Math.floor(width * 0.58);
    x = size * 0.2;
    y = height / 2 - size * 1.75;
  } else if (hour > 16 && hour <= 19) {
    size = Math.floor(width * 0.52);
    x = size * 0.1;
    y = height / 2 - size * 1.7;
  } else {
    size = Math.floor(width * 0.48);
    x = width / 2 - size / 2;
    y = -size * 0.1;
  }

  renderImage(ctx, img, x, y, size);
};

export default renderChineseHourCharacterImage;
