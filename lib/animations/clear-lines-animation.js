import BOARD from '@/lib/ui/constants/board.js';
import GAME from '@/lib/game/constants/game.js';
import GameState from '@/lib/game/state/game-state.js';
import renderActiveOnly from '@/lib/ui/render-active-only.js';
import renderClear from '@/lib/ui/render-clear.js';
import updateHUD from '@/lib/ui/update-hud.js';
import startLevelUp from '@/lib/controllers/level-up-controller.js';

class ClearLinesAnimation {
  constructor(lines) {
    this.lines = lines.map((y) => ({
      y,
      alpha: 1,
      timer: 0,
    }));
    this.name = 'clear-lines';
    this.layer = 200;
    this.blocking = true;
  }

  update(delta) {
    let done = true;

    for (const line of this.lines) {
      const phase = Math.floor(line.timer / 0.12);

      line.alpha = phase % 2 === 0 ? 1 : 0;
      line.timer += delta;

      if (line.timer < 0.72) {
        done = false;
      }
    }

    if (done) {
      this.finish();
      // animation 结束
      return false;
    }

    return true;
  }

  render() {
    renderActiveOnly();
    renderClear({ lines: this.lines });
  }

  finish() {
    const { ROWS, COLS } = BOARD;
    const { CLEAR_SCORES, MAX_LEVEL } = GAME;

    let cleared = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
      const isFullLine = GameState.board[y].every(Boolean);

      if (isFullLine) {
        GameState.board.splice(y, 1);
        GameState.board.unshift(Array.from({ length: COLS }).fill(0));
        cleared++;
        y++;
      }
    }

    GameState.lines += cleared;
    GameState.score += CLEAR_SCORES[cleared] * GameState.level;

    const totalLines = GameState.baseLines + GameState.lines;
    const newLevel = Math.floor(totalLines / 10) + 1;

    if (newLevel > GameState.level) {
      startLevelUp();
    }

    GameState.level = Math.min(Math.max(GameState.level, newLevel), MAX_LEVEL);

    updateHUD(
      GameState.score,
      GameState.lines,
      GameState.level,
      GameState.highScore,
    );
  }
}

export default ClearLinesAnimation;
