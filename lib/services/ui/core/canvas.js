class Canvas {
  constructor(options) {
    const { board, next, cols, rows } = options;

    this.rows = rows;
    this.cols = cols;

    this.gameBoard = document.querySelector(`#${board}`);
    this.gameBoardContext = this.gameBoard.getContext('2d');

    this.nextPiece = document.querySelector(`#${next}`);
    this.nextPieceContext = this.nextPiece.getContext('2d');

    this.fontSize = 0;
    this.blockSize = 0;
  }
}

export default Canvas;
