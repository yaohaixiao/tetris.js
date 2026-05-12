import GAME from '@/lib/game/constants/game.js';

/**
 * # 应用消除行
 *
 * 将游戏面板中满行的层消除掉，并返回消除后的一些数据
 *
 * @function applyClearLines
 * @param {object} context - 执行上下文
 * @returns {object} - 返回应用消除行后的一些数据
 */
const applyClearLines = (context) => {
  const { options } = context;
  const state = context.Store.getState();
  const { Elements, Level } = options;
  const { rows, cols } = Elements.Main;
  const { CLEAR_LINE_SCORES } = GAME;
  const lines = state.clearLines || [];
  const cleared = lines.length;

  /**
   * 1. 真实消行逻辑（直接操作 board 结构）
   *
   * 这里属于“结构型数据修改”，暂时不纳入 setState
   */
  const board = structuredClone(state.board);

  for (let y = rows - 1; y >= 0; y--) {
    const isFullLine = board[y].every(Boolean);

    if (isFullLine) {
      board.splice(y, 1);
      board.unshift(Array.from({ length: cols }).fill(0));
      y++;
    }
  }

  // 2. 状态收敛
  const nextLines = state.lines + cleared;
  const totalLines = state.baseLines + nextLines;
  const newLevel = Math.floor(totalLines / 10) + 1;
  const { max } = Level;
  const isMaxOut = newLevel > max;
  const levelUp = newLevel > state.level && !isMaxOut;

  return {
    stateHandler: (prev) => ({
      ...prev,
      clearLines: [],
      lines: nextLines,
      score: prev.score + CLEAR_LINE_SCORES[cleared],
      level: Math.min(Math.max(prev.level, newLevel), max),
      board,
    }),
    levelUp,
    level: isMaxOut ? max : newLevel,
    isMaxOut,
  };
};

export default applyClearLines;
