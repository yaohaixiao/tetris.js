import COLORS from '../constants/colors.js';
import GAME from '../constants/game.js';
import Canvas from './canvas.js';

const drawEnterStartText = () => {
  const { TEAL } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext, fontSize } = Canvas;
  const { width, height } = gameBoard;

  gameBoardContext.save();
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 1.15}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = TEAL;
  gameBoardContext.fillText('ENTER START', width / 2, height * 0.7);
  gameBoardContext.restore();
};

export default drawEnterStartText;
