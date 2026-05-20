import cloneBoard from '@/lib/ai/utils/clone-board.js';

describe('cloneBoard', () => {
  it('应该深拷贝棋盘', () => {
    const board = [
      [1, 0],
      [0, 1],
    ];
    const clone = cloneBoard(board);

    expect(clone).toEqual(board);
    expect(clone).not.toBe(board);
    expect(clone[0]).not.toBe(board[0]);
  });

  it('修改拷贝不应该影响原棋盘', () => {
    const board = [
      [1, 0],
      [0, 1],
    ];
    const clone = cloneBoard(board);

    clone[0][0] = 99;
    expect(board[0][0]).toBe(1);
  });
});
