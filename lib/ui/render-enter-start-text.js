import COLORS from '@/lib/constants/colors.js';
import GAME from '@/lib/game/constants/game.js';
import Canvas from '@/lib/ui/canvas.js';

const renderEnterStartText = () => {
  const { TEAL } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = Canvas;
  const { width, height } = gameBoard;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${fontSize * 1.15}px ${FONT_FAMILY}`;
  ctx.fillStyle = TEAL;
  ctx.fillText('ENTER START', width / 2, height * 0.7);
  ctx.restore();
};

export default renderEnterStartText;
