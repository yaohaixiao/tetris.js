import lock from '@/lib/game/logic/lock';
import Game from '@/lib/game';

jest.mock('@/lib/game', () => ({
  store: {
    getState: jest.fn(),
    setState: jest.fn(),
  },
}));

describe('lock', () => {
  const COLS = 10;
  const ROWS = 20;

  const makeBoard = () =>
    Array.from({ length: ROWS }, () => Array.from({ length: COLS }).fill(0));

  const O_PIECE = {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'yellow',
  };

  const I_PIECE = {
    shape: [[1, 1, 1, 1]],
    color: 'cyan',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('将 O 方块锁定到棋盘中', () => {
    const board = makeBoard();
    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 4,
      cy: 0,
      board,
    });

    lock();

    const call = Game.store.setState.mock.calls;
    expect(call.length).toBeGreaterThan(0);

    const finalState = call[call.length - 1][0];
    // board[0][4], board[0][5], board[1][4], board[1][5] 应为 'yellow'
    expect(finalState.board[0][4]).toBe('yellow');
    expect(finalState.board[0][5]).toBe('yellow');
    expect(finalState.board[1][4]).toBe('yellow');
    expect(finalState.board[1][5]).toBe('yellow');
  });

  test('将 I 方块锁定到棋盘中', () => {
    const board = makeBoard();
    Game.store.getState.mockReturnValue({
      curr: I_PIECE,
      cx: 3,
      cy: 5,
      board,
    });

    lock();

    const call = Game.store.setState.mock.calls;
    const finalState = call[call.length - 1][0];

    expect(finalState.board[5][3]).toBe('cyan');
    expect(finalState.board[5][4]).toBe('cyan');
    expect(finalState.board[5][5]).toBe('cyan');
    expect(finalState.board[5][6]).toBe('cyan');
  });

  test('锁定时保留已有方块', () => {
    const board = makeBoard();
    board[10][0] = 'red'; // 已有方块
    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 4,
      cy: 5,
      board,
    });

    lock();

    const call = Game.store.setState.mock.calls;
    const finalState = call[call.length - 1][0];
    expect(finalState.board[10][0]).toBe('red'); // 保留
    expect(finalState.board[5][4]).toBe('yellow'); // 新锁
  });

  test('方块有空隙时只锁定非空位置', () => {
    const T_PIECE = {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: 'purple',
    };

    const board = makeBoard();
    Game.store.getState.mockReturnValue({
      curr: T_PIECE,
      cx: 4,
      cy: 3,
      board,
    });

    lock();

    const call = Game.store.setState.mock.calls;
    const finalState = call[call.length - 1][0];

    // 空位不被覆盖
    expect(finalState.board[3][4]).toBe(0);
    expect(finalState.board[3][5]).toBe('purple');
    expect(finalState.board[3][6]).toBe(0);
    expect(finalState.board[4][4]).toBe('purple');
    expect(finalState.board[4][5]).toBe('purple');
    expect(finalState.board[4][6]).toBe('purple');
  });
});
