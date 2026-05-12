const Configuration = {
  // 请始终保持 min > max
  Level: {
    min: 11,
    max: 99,
  },
  Elements: {
    Main: {
      cols: 10,
      rows: 20,
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
