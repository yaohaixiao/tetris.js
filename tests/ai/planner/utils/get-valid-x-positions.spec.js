import getValidXPositions from '@/lib/ai/planner/utils/get-valid-x-positions.js';

describe('getValidXPositions', () => {
  const createBoard = (cols = 10) =>
    Array.from({ length: 20 }, () => Array.from({ length: cols }, () => 0));

  it('1×4 的 I 块在 10 列棋盘上有 7 个合法位置', () => {
    const board = createBoard();
    const shape = [[1, 1, 1, 1]];
    expect(getValidXPositions(board, shape)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('2×2 的 O 块在 10 列棋盘上有 9 个合法位置', () => {
    const board = createBoard();
    const shape = [
      [1, 1],
      [1, 1],
    ];
    expect(getValidXPositions(board, shape)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it('3×2 的 T 块在 10 列棋盘上有 8 个合法位置', () => {
    const board = createBoard();
    const shape = [
      [0, 1, 0],
      [1, 1, 1],
    ];
    expect(getValidXPositions(board, shape)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('方块宽度等于棋盘宽度时只有 1 个合法位置', () => {
    const board = createBoard(4);
    const shape = [[1, 1, 1, 1]];
    expect(getValidXPositions(board, shape)).toEqual([0]);
  });
});
