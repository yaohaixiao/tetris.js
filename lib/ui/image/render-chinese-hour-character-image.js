import Canvas from '@/lib/ui/core/canvas.js';
import ChineseHourCharacters from '@/lib/ui/constants/images/chinese-hour-characters.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';
import getChineseHourCharacter from '@/lib/utils/get-chinese-hour-character.js';

const renderChineseHourCharacterImage = () => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;
  const time = new Date();
  const hour = time.getHours();
  const character = getChineseHourCharacter(hour);
  const img = getImage(ChineseHourCharacters[character]);
  const size = Math.floor(width * 0.68);
  const x = width / 2 - size;
  const y = height / 2 - size * 1.2;

  renderImage(ctx, img, x, y, size);
};

export default renderChineseHourCharacterImage;
