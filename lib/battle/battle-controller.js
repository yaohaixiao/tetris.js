import Base from '@/lib/core';
import VersusState from '@/lib/battle/versus-state.js';
import BattleHUD from '@/lib/battle/battle-hud.js';
import { calculateGarbage, applyGarbage } from '@/lib/battle/garbage-system.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

class BattleController extends Base {
  constructor(options) {
    super(options);
    this.initialize();
  }

  initialize() {
    const { games } = this;
    const state = new VersusState({ games });

    this.state = state;
    this.hud = new BattleHUD({ games, state });

    this.start();
  }

  start() {
    if (this.state.isRunning()) {
      return;
    }

    this.state.setRunning(true);
  }

  stop() {
    if (!this.state.isRunning()) {
      return;
    }

    this.state.setRunning(false);
  }

  update(loser) {
    const { games } = this;
    const winner = this.getOpponent(loser);

    this.stop();

    // 设置对战胜利者
    this.state.setWinner(winner);
    // 更新对战胜分数
    this.state.updateScores({ winner, loser });

    // 更新对战积 hud 显示
    this.hud.updateScores(winner, loser);

    // 重启游戏实例
    for (const game of games) {
      const events = GameEvents(game.id);
      game.emit(events.RESTART);
    }

    this.start();
  }

  getOpponent(yourself) {
    const { games } = this;
    return games.find((game) => game.id !== yourself.id);
  }

  sendGarbage(payload) {
    const { to, amount } = payload;
    const { Store } = to;
    const { board, difficulty } = Store.getState();
    const next = applyGarbage(board, amount, difficulty);

    // 更新目标玩家方块
    Store.setState({ board: next });
  }

  subscribe() {
    this.on('battle:send:garbage', this._onBattleSendGarbage);
    this.on('battle:update:winner', this._onBattleUpdateWinner);
  }

  unsubscribe() {
    this.off('battle:send:garbage', this._onBattleSendGarbage);
    this.off('battle:update:winner', this._onBattleUpdateWinner);
  }

  /**
   * 玩家消行
   *
   * @param {object} payload - 参数对象
   */
  _onBattleSendGarbage = (payload) => {
    const { from, lines } = payload;
    const to = this.getOpponent(from);
    const garbage = calculateGarbage(lines.length);

    if (garbage <= 0) {
      return;
    }

    this.sendGarbage({ to, amount: garbage });
  };

  _onBattleUpdateWinner = (payload) => {
    const { loser } = payload;
    this.update(loser);
  };
}

export default BattleController;
