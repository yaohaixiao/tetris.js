import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';
import Game from '@/lib/game/index.js';

// Mock Game.store
jest.mock('@/lib/game/index.js', () => ({
  store: {
    getState: jest.fn(),
  },
}));

describe('applyClearLines', () => {
  const COLS = 10;
  const ROWS = 20;

  const makeBoard = (filledRows = []) => {
    const board = [];
    for (let y = 0; y < ROWS; y++) {
      board.push(
        Array.from({ length: COLS }).map(() =>
          filledRows.includes(y) ? 1 : 0,
        ),
      );
    }
    return board;
  };

  test('消一行', () => {
    const board = makeBoard([19]); // 最底下一行满
    Game.store.getState.mockReturnValue({
      board,
      clearLines: [19],
      lines: 0,
      baseLines: 0,
      score: 0,
      level: 1,
    });

    const result = applyClearLines();

    expect(result.levelUp).toBe(false);
    expect(result.level).toBe(1);
  });

  test('消四行', () => {
    const board = makeBoard([16, 17, 18, 19]);
    Game.store.getState.mockReturnValue({
      board,
      clearLines: [16, 17, 18, 19],
      lines: 0,
      baseLines: 0,
      score: 0,
      level: 1,
    });

    const result = applyClearLines();

    expect(result.levelUp).toBe(false);
  });

  test('升级：累计消行达到 10 行', () => {
    const board = makeBoard([19]);
    Game.store.getState.mockReturnValue({
      board,
      clearLines: [19],
      lines: 9, // 之前已经消了 9 行
      baseLines: 0,
      score: 0,
      level: 1,
    });

    const result = applyClearLines();

    expect(result.levelUp).toBe(true);
    expect(result.level).toBe(2);
  });

  test('分数计算', () => {
    const board = makeBoard([19]);
    Game.store.getState.mockReturnValue({
      board,
      clearLines: [19],
      lines: 0,
      baseLines: 0,
      score: 0,
      level: 1,
    });

    const result = applyClearLines();
    const nextState = result.stateHandler({
      score: 0,
      lines: 0,
      level: 1,
      board: [],
      clearLines: [],
    });

    // 基础分 100 × level 1 = 100
    expect(nextState.score).toBe(100);
  });
});
