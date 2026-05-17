const collision = (board, shape, offsetX, offsetY) => {
  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) {
        continue;
      }

      const bx = offsetX + x;
      const by = offsetY + y;

      if (bx < 0 || bx >= board[0].length || by >= board.length) {
        return true;
      }

      if (by >= 0 && board[by][bx]) {
        return true;
      }
    }
  }

  return false;
};

export default collision;
