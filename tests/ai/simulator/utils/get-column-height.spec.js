import getColumnHeight from '@/lib/ai/simulator/utils/get-column-height.js';

describe('getColumnHeight', () => {
  const ROWS = 20;
  const COLS = 10;

  const createBoard = () =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(0));

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('空列应该返回 0', () => {
      const board = createBoard();
      expect(getColumnHeight(board, 0)).toBe(0);
    });

    it('底部有一个方块时应该返回 1', () => {
      const board = createBoard();
      board[19][0] = 1;
      expect(getColumnHeight(board, 0)).toBe(1);
    });

    it('底部有 3 个连续方块时应该返回 3', () => {
      const board = createBoard();
      for (let y = 17; y < 20; y++) {
        board[y][0] = 1;
      }
      expect(getColumnHeight(board, 0)).toBe(3);
    });

    it('满列应该返回棋盘总行数', () => {
      const board = createBoard();
      for (let y = 0; y < ROWS; y++) {
        board[y][0] = 1;
      }
      expect(getColumnHeight(board, 0)).toBe(ROWS);
    });

    it('顶部有一个方块时应该返回棋盘总行数', () => {
      const board = createBoard();
      board[0][0] = 1;
      expect(getColumnHeight(board, 0)).toBe(ROWS);
    });
  });

  // ==================== 方块位置 ====================
  describe('方块位置', () => {
    it('方块在中间位置时应该正确计算高度', () => {
      const board = createBoard();
      // 在 y=10 处放一个方块，高度 = 20 - 10 = 10
      board[10][3] = 1;
      expect(getColumnHeight(board, 3)).toBe(10);
    });

    it('方块在 y=15 时高度应该为 5', () => {
      const board = createBoard();
      board[15][5] = 1;
      expect(getColumnHeight(board, 5)).toBe(5);
    });

    it('多个方块时应该以最顶部的方块为准', () => {
      const board = createBoard();
      // 最顶部的方块在 y=5，高度 = 20 - 5 = 15
      board[5][2] = 1;
      board[10][2] = 1;
      board[19][2] = 1;
      expect(getColumnHeight(board, 2)).toBe(15);
    });
  });

  // ==================== 多列测试 ====================
  describe('多列测试', () => {
    it('不同列应该独立计算高度', () => {
      const board = createBoard();
      // 第 0 列高度 3
      for (let y = 17; y < 20; y++) board[y][0] = 1;
      // 第 5 列高度 1
      board[19][5] = 1;
      // 第 9 列高度 5
      for (let y = 15; y < 20; y++) board[y][9] = 1;

      expect(getColumnHeight(board, 0)).toBe(3);
      expect(getColumnHeight(board, 5)).toBe(1);
      expect(getColumnHeight(board, 9)).toBe(5);
    });

    it('所有空列应该返回 0', () => {
      const board = createBoard();
      for (let x = 0; x < COLS; x++) {
        expect(getColumnHeight(board, x)).toBe(0);
      }
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('应该正确处理非 1 的值（如颜色字符串）', () => {
      const board = createBoard();
      board[17][0] = '#00c8ff';
      expect(getColumnHeight(board, 0)).toBe(3);
    });

    it('应该正确处理 null 和 undefined（视为空）', () => {
      const board = createBoard();
      board[19][0] = null;
      expect(getColumnHeight(board, 0)).toBe(0);

      board[19][0] = undefined;
      expect(getColumnHeight(board, 0)).toBe(0);
    });

    it('第一列和最后一列应该都能正常计算', () => {
      const board = createBoard();
      board[19][0] = 1;
      board[18][9] = 1;

      expect(getColumnHeight(board, 0)).toBe(1);
      expect(getColumnHeight(board, 9)).toBe(2);
    });
  });

  // ==================== 不可变性 ====================
  describe('不可变性', () => {
    it('不应该修改原始棋盘', () => {
      const board = createBoard();
      board[19][0] = 1;
      const boardCopy = board.map((row) => [...row]);

      getColumnHeight(board, 0);

      expect(board).toEqual(boardCopy);
    });
  });
});
