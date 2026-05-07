const Configuration = {
  // 请始终保持 1:2
  Board: {
    cols: 10,
    rows: 20,
  },
  // 请始终保持 min > max
  Level: {
    min: 11,
    max: 12,
  },
  Elements: {
    Canvas: {
      board: 'game-board',
      next: 'next-piece',
    },
    Hud: {
      score: 'score',
      lines: 'lines',
      level: 'level',
      highScore: 'high-score',
    },
  },
};

export default Configuration;
