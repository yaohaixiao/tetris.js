import BOARD from '@/lib/services/ui/constants/board.js';
import GAME from '@/lib/game/constants/game.js';
import Game from '@/lib/game';

/**
 * # 应用消除行
 *
 * 将游戏面板中满行的层消除掉，并返回消除后的一些数据
 *
 * @function applyClearLines
 * @returns {object} - 返回应用消除行后的一些数据
 */
const applyClearLines = () => {
  const state = Game.store.getState();
  const { ROWS, COLS } = BOARD;
  const { CLEAR_LINE_SCORES, MAX_LEVEL } = GAME;
  const lines = state.clearLines || [];
  const cleared = lines.length;

  /**
   * 1. 真实消行逻辑（直接操作 board 结构）
   *
   * 这里属于“结构型数据修改”，暂时不纳入 setState
   */
  const board = structuredClone(state.board);

  for (let y = ROWS - 1; y >= 0; y--) {
    const isFullLine = board[y].every(Boolean);

    if (isFullLine) {
      board.splice(y, 1);
      board.unshift(Array.from({ length: COLS }).fill(0));
      y++;
    }
  }

  // 2. 状态收敛
  const nextLines = state.lines + cleared;
  const totalLines = state.baseLines + nextLines;
  const newLevel = Math.floor(totalLines / 10) + 1;
  const levelUp = newLevel > state.level;

  return {
    stateHandler: (prev) => ({
      ...prev,
      clearLines: [],
      lines: nextLines,
      score: prev.score + CLEAR_LINE_SCORES[cleared] * prev.level,
      level: Math.min(Math.max(prev.level, newLevel), MAX_LEVEL),
      board,
    }),
    levelUp,
    level: newLevel,
  };
};

export default applyClearLines;
