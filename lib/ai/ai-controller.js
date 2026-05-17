import Base from '@/lib/core';
import generateMoves from '@/lib/ai/generate-moves.js';
import evaluateBoard from '@/lib/ai/evaluate-board.js';

class AIController extends Base {
  constructor(options) {
    super(options);

    this.enabled = false;

    this.actions = [];

    this.aiSchedulerId = 0;
  }

  start() {
    this.enabled = true;

    this.loop();
  }

  stop() {
    this.enabled = false;

    this.actions = [];

    this.Scheduler.cancel(this.aiSchedulerId);

    this.aiSchedulerId = 0;
  }

  loop = () => {
    if (!this.enabled) {
      return;
    }

    const state = this.Game.Store.getState();

    if (state.mode !== 'playing') {
      this.aiSchedulerId = this.Scheduler.delay(this.loop, 100);
      return;
    }

    /** 当前没有 action plan */
    if (this.actions.length === 0) {
      const best = this.think(state);

      if (best) {
        this.actions = [...best.actions];
      }
    }

    /** 一次只执行一个 action */
    const action = this.actions.shift();

    if (action) {
      this.Game.emit('dispatch:input', {
        device: 'ai',
        action,
        payload: {
          Game: this.Game,
        },
      });
    }

    this.aiSchedulerId = this.Scheduler.delay(this.loop, 80);
  };

  think(state) {
    const moves = generateMoves({
      board: state.board,
      piece: state.piece,
    });

    let best = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      const score = evaluateBoard(move.board);

      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }

    return best;
  }
}

export default AIController;
