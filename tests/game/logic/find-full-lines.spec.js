import findFullLines from '@/lib/game/logic/find-full-lines.js';
import Game from '@/lib/game/index.js';
import Configuration from '@/lib/configuration.js';

jest.mock('@/lib/game/index.js', () => ({
  store: {
    getState: jest.fn(),
  },
}));

jest.mock('@/lib/configuration.js', () => ({
  Board: {
    rows: 20,
    cols: 10,
  },
}));

describe('findFullLines', () => {
  const ROWS = 20;
  const COLS = 10;

  const makeBoard = (filledRows = []) => {
    const board = [];
    for (let y = 0; y < ROWS; y++) {
      board.push(
        Array.from({ length: COLS }).map(() =>
          filledRows.includes(y) ? 1 : 0
        )
      );
    }
    return board;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== 基础检测 ==========
  test('无满行时返回空数组', () => {
    Game.store.getState.mockReturnValue({
      board: makeBoard([]),
    });

    const result = findFullLines();
    expect(result).toEqual([]);
  });

  test('底下一行满行', () => {
    Game.store.getState.mockReturnValue({
      board: makeBoard([19]),
    });

    const result = findFullLines();
    expect(result).toEqual([19]);
  });

  test('底部多行满行', () => {
    Game.store.getState.mockReturnValue({
      board: makeBoard([17, 18, 19]),
    });

    const result = findFullLines();
    expect(result).toEqual([19, 18, 17]); // 从下往上
  });

  test('中间行满行', () => {
    Game.store.getState.mockReturnValue({
      board: makeBoard([5, 10, 15]),
    });

    const result = findFullLines();
    expect(result).toEqual([15, 10, 5]);
  });

  test('全部满行', () => {
    const allRows = Array.from({ length: ROWS }, (_, i) => i);
    Game.store.getState.mockReturnValue({
      board: makeBoard(allRows),
    });

    const result = findFullLines();
    expect(result).toEqual(allRows.reverse());
  });

  // ========== 不完整行 ==========
  test('行中有空位不视为满行', () => {
    const board = makeBoard([19]);
    board[19][3] = 0; // 留一个空位
    Game.store.getState.mockReturnValue({ board });

    const result = findFullLines();
    expect(result).toEqual([]);
  });

  test('行中全是 0 不是满行', () => {
    Game.store.getState.mockReturnValue({
      board: makeBoard([]),
    });

    const result = findFullLines();
    expect(result).toEqual([]);
  });

  // ========== 方块类型 ==========
  test('不同方块值都视为满行', () => {
    Game.store.getState.mockReturnValue({
      board: (() => {
        const board = makeBoard([]);
        // 用不同数字代表不同方块类型
        board[19] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        return board;
      })(),
    });

    const result = findFullLines();
    expect(result).toEqual([19]);
  });

  test('falsy 值（0/undefined/null）视为空格', () => {
    const board = makeBoard([]);
    board[19] = [1, 0, 1, undefined, 1, null, 1, 1, 1, 1];
    Game.store.getState.mockReturnValue({ board });

    const result = findFullLines();
    expect(result).toEqual([]);
  });
});
