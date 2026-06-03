import simulatePlacementInPlace from '@/lib/ai/simulator/simulate-placement-in-place.js';

describe('simulatePlacementInPlace', () => {
  const createBoard = () =>
    Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => 0));

  it('回调应接收到放置方块后的棋盘', () => {
    const board = createBoard();
    const shape = [
      [1, 1],
      [1, 1],
    ];

    simulatePlacementInPlace(board, shape, 4, 18, (modifiedBoard) => {
      expect(modifiedBoard[18][4]).toBe(1);
      expect(modifiedBoard[18][5]).toBe(1);
      expect(modifiedBoard[19][4]).toBe(1);
      expect(modifiedBoard[19][5]).toBe(1);
    });
  });

  it('回调执行后棋盘应恢复原样', () => {
    const board = createBoard();
    const shape = [[1]];
    const snapshot = JSON.stringify(board);

    simulatePlacementInPlace(board, shape, 0, 19, () => {});

    expect(JSON.stringify(board)).toBe(snapshot);
  });

  it('应跳过形状中的空格子', () => {
    const board = createBoard();
    const shape = [
      [0, 1, 0],
      [1, 1, 1],
    ];

    simulatePlacementInPlace(board, shape, 3, 18, (modifiedBoard) => {
      // shape[0][0]=0，不应写入
      expect(modifiedBoard[18][3]).toBe(0);
      // shape[0][1]=1，应写入
      expect(modifiedBoard[18][4]).toBe(1);
      // shape[0][2]=0，不应写入
      expect(modifiedBoard[18][5]).toBe(0);
    });
  });

  it('应跳过棋盘外的格子', () => {
    const board = createBoard();
    const shape = [[1]];

    // y=-1，在棋盘上方
    expect(() =>
      simulatePlacementInPlace(board, shape, 0, -1, () => {}),
    ).not.toThrow();
  });

  it('应返回回调的返回值', () => {
    const board = createBoard();
    const shape = [[1]];

    const result = simulatePlacementInPlace(board, shape, 0, 19, () => 42);

    expect(result).toBe(42);
  });

  it('多个方块应正确记录所有修改', () => {
    const board = createBoard();
    board[19][0] = 9; // 原始值不是 0
    const shape = [[1]];

    simulatePlacementInPlace(board, shape, 0, 19, (modifiedBoard) => {
      expect(modifiedBoard[19][0]).toBe(1);
    });

    // 回滚后应恢复为 9
    expect(board[19][0]).toBe(9);
  });

  it('应支持多次调用互不干扰', () => {
    const board = createBoard();
    const shapeA = [[1]];
    const shapeB = [[2]];

    simulatePlacementInPlace(board, shapeA, 0, 19, (modifiedBoard) => {
      expect(modifiedBoard[19][0]).toBe(1);
    });

    simulatePlacementInPlace(board, shapeB, 5, 19, (modifiedBoard) => {
      expect(modifiedBoard[19][5]).toBe(1);
      // 上一次的修改已经回滚，x=0 应恢复为 0
      expect(modifiedBoard[19][0]).toBe(0);
    });
  });
});
