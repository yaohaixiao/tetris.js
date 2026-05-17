class BattleHUD {
  constructor(playerGame, aiGame) {
    this.playerGame = playerGame;
    this.aiGame = aiGame;
  }

  render() {
    /** 这里后面接你的 UI 系统 */

    const playerScore = this.playerGame.Store.getScore();

    const aiScore = this.aiGame.Store.getScore();

    console.log('PLAYER:', playerScore, 'AI:', aiScore);
  }
}

export default BattleHUD;
