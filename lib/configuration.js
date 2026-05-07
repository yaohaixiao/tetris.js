const Configuration = {
  Board: {
    cols: 10,
    rows: 20,
  },
  Level: {
    min: 10,
    max: 10,
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
