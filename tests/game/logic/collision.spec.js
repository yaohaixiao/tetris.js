import collision from '@/lib/game/logic/collision';
import Game from '@/lib/game';
import Configuration from '@/lib/configuration';

jest.mock('@/lib/configuration', () => ({
  Board: {
    rows: 20,
    cols: 10,
  },
}));

jest.mock('@/lib/game', () => ({
  store: {
    getState: jest.fn(),
  },
}));

describe('collision', () => {
  const COLS = 10;
  const ROWS = 20;

  const makeBoard = () =>
    Array.from({ length: ROWS }, () => Array.from({ length: COLS }).fill(0));

  const O_PIECE = {
    shape: [
      [1, 1],
      [1, 1],
    ],
  };

  const I_PIECE = {
    shape: [[1, 1, 1, 1]],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== 无碰撞 ==========
  test('方块在棋盘中央无碰撞', () => {
    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 4,
      cy: 0,
      board: makeBoard(),
    });

    expect(collision(0, 1)).toBe(false); // 向下移动 1
  });

  test('横向移动不越界时无碰撞', () => {
    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 4,
      cy: 5,
      board: makeBoard(),
    });

    expect(collision(-1, 0)).toBe(false); // 左移
    expect(collision(1, 0)).toBe(false); // 右移
  });

  // ========== 边界碰撞 ==========
  test('超出左边界', () => {
    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 0,
      cy: 5,
      board: makeBoard(),
    });

    expect(collision(-1, 0)).toBe(true);
  });

  test('超出右边界', () => {
    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 8,
      cy: 5,
      board: makeBoard(),
    });

    expect(collision(1, 0)).toBe(true);
  });

  test('I 方块超出右边界', () => {
    Game.store.getState.mockReturnValue({
      curr: I_PIECE,
      cx: 7,
      cy: 0,
      board: makeBoard(),
    });

    // I 方块占 4 列，cx=7 时最右为 7+3=10，超出 cols(10)
    expect(collision(0, 0)).toBe(true);
  });

  test('超出底部', () => {
    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 4,
      cy: 18,
      board: makeBoard(),
    });

    expect(collision(0, 1)).toBe(true);
  });

  test('I 方块超出底部', () => {
    Game.store.getState.mockReturnValue({
      curr: I_PIECE,
      cx: 3,
      cy: 19,
      board: makeBoard(),
    });

    expect(collision(0, 1)).toBe(true);
  });

  // ========== 与已有方块碰撞 ==========
  test('向下移动碰到已放置方块', () => {
    const board = makeBoard();
    board[6][4] = 1; // (4, 6) 有方块
    board[6][5] = 1;

    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 4,
      cy: 4, // 当前在行 4-5，下一行 5-6 叠上
      board,
    });

    expect(collision(0, 1)).toBe(true);
  });

  test('横向移动碰到已放置方块', () => {
    const board = makeBoard();
    board[5][3] = 1;

    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 4,
      cy: 5,
      board,
    });

    expect(collision(-1, 0)).toBe(true);
  });

  test('方块在顶部但 ny < 0 时不检查 board', () => {
    const board = makeBoard();

    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      cx: 4,
      cy: 0,
      board,
    });

    // 向上移动，ny = -1，不在合法范围内，跳过 hitBlock 检查
    expect(collision(0, -1)).toBe(false);
  });

  // ========== curr 为 null ==========
  test('curr 为 null 时无碰撞', () => {
    Game.store.getState.mockReturnValue({
      curr: null,
      cx: 4,
      cy: 5,
      board: makeBoard(),
    });

    expect(collision(0, 1)).toBe(false);
  });

  test('curr 为 undefined 时无碰撞', () => {
    Game.store.getState.mockReturnValue({
      cx: 4,
      cy: 5,
      board: makeBoard(),
    });

    expect(collision(0, 1)).toBe(false);
  });
});
