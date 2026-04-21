// utils/find-full-lines.js
const findFullLines = (board) => {
  const lines = [];

  for (let y = 0; y < board.length; y++) {
    if (board[y].every(Boolean)) {
      lines.push(y);
    }
  }

  return lines;
};

export default findFullLines;
