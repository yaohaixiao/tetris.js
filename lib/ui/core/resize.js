import BOARD from '@/lib/ui/constants/board.js';
import Canvas from '@/lib/ui/core/canvas.js';

const resize = () => {
  const { ROWS, COLS } = BOARD;
  const { gameBoard, nextPiece } = Canvas;

  const h = globalThis.innerHeight * 0.9;

  Canvas.blockSize = Math.floor(h / ROWS);

  gameBoard.width = Canvas.blockSize * COLS;
  gameBoard.height = Canvas.blockSize * ROWS;

  Canvas.fontSize = Math.floor(gameBoard.height * 0.032);

  const nextSize = Math.min(
    globalThis.innerWidth * 0.1,
    globalThis.innerHeight * 0.18,
  );

  nextPiece.width = nextSize;
  nextPiece.height = nextSize;
};

export default resize;
