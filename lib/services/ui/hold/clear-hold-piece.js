const clearHoldPiece = (canvas) => {
  const { nextPiece, holdPieceContext } = canvas;
  const { width, height } = nextPiece;

  // 清空预览画布的整个区域
  holdPieceContext.clearRect(0, 0, width, height);
};

export default clearHoldPiece;
