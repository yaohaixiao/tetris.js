const Configuration = {
  // 请始终保持 1:2
  Board: {
    cols: 10,
    rows: 20,
  },
  Level: {
    min: 10,
    max: 99,
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
