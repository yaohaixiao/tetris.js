import Base from '@/lib/core';
import VersusState from '@/lib/battle/versus-state.js';
import BattleHUD from '@/lib/battle/battle-hud.js';
import { calculateGarbage, applyGarbage } from '@/lib/battle/garbage-system.js';

class BattleController extends Base {
  constructor(options) {
    super(options);

    this.playerGame = options.playerGame;

    this.aiGame = options.aiGame;

    this.state = new VersusState();

    this.hud = new BattleHUD(this.playerGame, this.aiGame);

    this.subscribe();
  }

  start() {
    this.state.running = true;

    /** 开启 AI */
    this.aiGame.AI.start();
  }

  stop() {
    this.state.running = false;

    this.aiGame.AI.stop();
  }

  sendGarbage(from, to, amount) {
    const board = to.Store.getBoard();

    const next = applyGarbage(board, amount);

    to.Store.setBoard(next);

    to.emit('ui:update:board');
  }

  subscribe() {
    /** 玩家消行 */
    this.playerGame.on('game:clear-lines', this._onPlayerClearLines);

    /** AI 消行 */
    this.aiGame.on('game:clear-lines', this._onAIClearLines);

    /** 玩家死亡 */
    this.playerGame.on('game:over', this._onPlayerLose);

    /** AI 死亡 */
    this.aiGame.on('game:over', this._onAILose);
  }

  /** 玩家消行 */
  _onPlayerClearLines = ({ lines }) => {
    const garbage = calculateGarbage(lines);

    if (garbage <= 0) {
      return;
    }

    this.sendGarbage(this.playerGame, this.aiGame, garbage);
  };

  /** AI 消行 */
  _onAIClearLines = ({ lines }) => {
    const garbage = calculateGarbage(lines);

    if (garbage <= 0) {
      return;
    }

    this.sendGarbage(this.aiGame, this.playerGame, garbage);
  };

  _onPlayerLose = () => {
    this.state.winner = 'AI';

    console.log('AI WIN');

    this.stop();
  };

  _onAILose = () => {
    this.state.winner = 'PLAYER';

    console.log('PLAYER WIN');

    this.stop();
  };
}

export default BattleController;
