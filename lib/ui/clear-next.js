import Canvas from './canvas.js';

const clearNext = () => {
  const { nextPiece, nextPieceContext } = Canvas;
  const { width, height } = nextPiece;

  // 清空预览画布
  nextPieceContext.clearRect(0, 0, width, height);
};

export default clearNext;
