const rotateMatrix = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const next = Array.from({ length: cols }, () =>
    Array.from({ length: rows }).fill(0),
  );

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      next[x][rows - y - 1] = matrix[y][x];
    }
  }

  return next;
};

export default rotateMatrix;
