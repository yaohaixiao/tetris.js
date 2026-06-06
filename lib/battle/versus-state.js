import Base from '@/lib/core';

class VersusState extends Base {
  constructor(options) {
    super(options);
    this.initialize();
  }

  initialize() {
    this._initialize();
  }

  _initialize() {
    const { games } = this;

    this.running = false;
    this.winner = null;
    this.scores = {};

    for (const game of games) {
      const { Player } = game;
      const playerId = `${Player.name}-${Player.index}`;

      this.scores[playerId] = 0;
    }
  }

  setRunning(running) {
    this.running = running;
  }

  isRunning() {
    return this.running;
  }

  setWinner(winner) {
    this.winner = winner;
  }

  getWinner() {
    return this.winner;
  }

  getScore(id) {
    return this.scores[id];
  }

  updateScores(options) {
    const { winner, loser } = options;
    const winnerPlayer = winner.Player;
    const winnerId = `${winnerPlayer.name}-${winnerPlayer.index}`;
    let winnerScore = this.scores[winnerId];

    const loserPlayer = loser.Player;
    const loserId = `${loserPlayer.name}-${loserPlayer.index}`;
    let loserScore = this.scores[loserId];

    winnerScore += 1;

    if (loserScore <= 0) {
      loserScore = 0;
    }

    this.scores[winnerId] = winnerScore;
    this.scores[loserId] = loserScore;
  }

  reset() {
    this._initialize();
  }
}

export default VersusState;
