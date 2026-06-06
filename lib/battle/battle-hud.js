import Base from '@/lib/core';

class BattleHUD extends Base {
  constructor(options) {
    super(options);
    this.initialize();
  }

  initialize() {
    const { games } = this;

    this.elements = {};

    for (const game of games) {
      const { Player } = game;
      const id = `${Player.name}-${Player.index}`;
      const $score = document.querySelector(`#${id}-tetris-battle-score`);
      this.elements[id] = $score || null;
    }
  }

  getEl(id) {
    return this.elements[id];
  }

  updateScores(winner, loser) {
    const { state } = this;

    const winnerPlayer = winner.Player;
    const winnerId = `${winnerPlayer.name}-${winnerPlayer.index}`;
    const $winner = this.getEl(winnerId);
    const winnerScore = state.getScore(winnerId);

    const loserPlayer = loser.Player;
    const loserId = `${loserPlayer.name}-${loserPlayer.index}`;
    const $loser = this.getEl(loserId);
    const loserScore = state.getScore(loserId);

    if ($winner) {
      $winner.textContent = winnerScore;
    }

    if ($loser) {
      $loser.textContent = loserScore;
    }
  }
}

export default BattleHUD;
