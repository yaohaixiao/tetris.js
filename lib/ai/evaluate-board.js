const evaluateBoard = (board) => {
  const height = board.length;
  const width = board[0].length;

  let aggregateHeight = 0;
  let holes = 0;
  let bumpiness = 0;

  const heights = [];

  for (let x = 0; x < width; x += 1) {
    let columnHeight = 0;
    let blockFound = false;

    for (let y = 0; y < height; y += 1) {
      if (board[y][x]) {
        if (!blockFound) {
          columnHeight = height - y;
          blockFound = true;
        }
      } else if (blockFound) {
        holes += 1;
      }
    }

    heights.push(columnHeight);
    aggregateHeight += columnHeight;
  }

  for (let i = 0; i < heights.length - 1; i += 1) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }

  return -0.51066 * aggregateHeight + -0.35663 * holes + -0.184483 * bumpiness;
};

export default evaluateBoard;
