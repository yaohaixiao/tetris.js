import Configuration from '@/lib/configuration.js';

const { board, next } = Configuration.Elements.Canvas;

// 游戏画布
const gameBoard = document.querySelector(`#${board}`);
const gameBoardContext = gameBoard.getContext('2d');

// 预览画布
const nextPiece = document.querySelector(`#${next}`);
const nextPieceContext = nextPiece.getContext('2d');

const fontSize = 0;
const blockSize = 0;

const Canvas = {
  gameBoard,
  gameBoardContext,
  nextPiece,
  nextPieceContext,
  fontSize,
  blockSize,
};

export default Canvas;
