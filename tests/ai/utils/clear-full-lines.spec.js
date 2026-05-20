import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';

describe('clearFullLines', () => {
  const COLS = 10;
  const ROWS = 20;

  const createEmptyRow = () => Array(COLS).fill(0);
  const createFullRow = () => Array(COLS).fill(1);
  const createBoard = () =>
    Array.from({ length: ROWS }, () => createEmptyRow());

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('没有满行时应该返回相同大小的棋盘', () => {
      const board = createBoard();
      // 放置一些非满行的方块
      board[19][0] = 1;
      board[19][1] = 1;

      const result = clearFullLines(board);

      expect(result.length).toBe(ROWS);
      result.forEach((row) => {
        expect(row.length).toBe(COLS);
      });
    });

    it('没有满行时棋盘内容应该保持不变', () => {
      const board = createBoard();
      board[19][0] = 1;
      board[19][1] = 1;

      const result = clearFullLines(board);

      expect(result[19][0]).toBe(1);
      expect(result[19][1]).toBe(1);
    });

    it('应该消除一行满行', () => {
      const board = createBoard();
      board[19] = createFullRow();
      board[18][0] = 1;

      const result = clearFullLines(board);

      expect(result.length).toBe(ROWS);

      // 原 row 18 被 unshift 下移到 row 19
      expect(result[19][0]).toBe(1);

      // 顶部是补的空行
      expect(result[0].every((cell) => cell === 0)).toBe(true);
    });

    it('应该消除多行满行', () => {
      const board = createBoard();
      // 最后 3 行都是满行
      board[17] = createFullRow();
      board[18] = createFullRow();
      board[19] = createFullRow();
      // 第 16 行有方块但不全满
      board[16][0] = 1;

      const result = clearFullLines(board);

      expect(result.length).toBe(ROWS);

      // 原来第 16 行的方块应该下移到第 19 行
      expect(result[19][0]).toBe(1);

      // 顶部 3 行应该是空行
      for (let y = 0; y < 3; y++) {
        expect(result[y].every((cell) => cell === 0)).toBe(true);
      }
    });

    it('应该消除棋盘中间的一行满行', () => {
      const board = createBoard();
      // 中间一行是满行
      board[10] = createFullRow();
      // 第 9 行和第 11 行有方块
      board[9][0] = 1;
      board[11][0] = 1;

      const result = clearFullLines(board);

      expect(result.length).toBe(ROWS);

      // 满行被消除后，上面的一行（原第 9 行）下移
      // 原第 9 行现在在第 10 行
      expect(result[10][0]).toBe(1);

      // 顶部一行是空行
      expect(result[0].every((cell) => cell === 0)).toBe(true);
    });
  });

  // ==================== 不可变性 ====================
  describe('不可变性', () => {
    it('不应该修改原始棋盘', () => {
      const board = createBoard();
      board[19] = createFullRow();
      board[18][0] = 1;

      const boardCopy = board.map((row) => [...row]);

      clearFullLines(board);

      expect(board).toEqual(boardCopy);
    });

    it('返回的应该是新棋盘而非原棋盘引用', () => {
      const board = createBoard();
      board[19] = createFullRow();

      const result = clearFullLines(board);

      expect(result).not.toBe(board);
    });

    it('满行中的每一行都应该是新数组', () => {
      const board = createBoard();
      board[19] = createFullRow();

      const result = clearFullLines(board);

      // 原满行不应该被修改（它是新棋盘中被剔除的）
      // 验证返回的新棋盘中的行与原棋盘的行不是同一个引用
      expect(result[19]).not.toBe(board[19]);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('全部是满行时应该返回全空棋盘', () => {
      const board = Array.from({ length: ROWS }, () => createFullRow());

      const result = clearFullLines(board);

      expect(result.length).toBe(ROWS);
      // 所有行都应该是空行
      result.forEach((row) => {
        expect(row.every((cell) => cell === 0)).toBe(true);
      });
    });

    it('空棋盘不应该有任何变化', () => {
      const board = createBoard();

      const result = clearFullLines(board);

      expect(result).toEqual(board);
      expect(result).not.toBe(board);
    });

    it('一行满行正好是棋盘总行数时应该全部清空', () => {
      const board = createBoard();
      // 设置多行满行
      for (let y = 0; y < ROWS; y++) {
        board[y] = createFullRow();
      }

      const result = clearFullLines(board);

      expect(result.length).toBe(ROWS);
      result.forEach((row) => {
        expect(row.every((cell) => cell === 0)).toBe(true);
      });
    });

    it('只有一行空行（非满行）时不应该消除', () => {
      const board = createBoard();
      board[0][0] = 1; // 只放一个方块，不是满行

      const result = clearFullLines(board);

      expect(result.length).toBe(ROWS);
      expect(result[0][0]).toBe(1);
    });

    it('应该正确处理所有值都为 truthy 但类型不同的情况', () => {
      const board = createBoard();
      // 使用不同的 truthy 值模拟颜色字符串
      const fullRowWithColors = [
        '#00c8ff',
        '#f1fa04',
        '#d31ac1',
        '#5050ff',
        '#ffa500',
        '#0afa04',
        '#ff3b30',
        '#e64a19',
        '#444',
        '#fff',
      ];
      board[19] = fullRowWithColors;

      const result = clearFullLines(board);

      expect(result.length).toBe(ROWS);
      // 满行被消除，顶部出现空行
      expect(result[0].every((cell) => cell === 0)).toBe(true);
    });

    it('包含 0 的行不应被视为满行', () => {
      const board = createBoard();
      // 除了一个格子是 0，其余都是 1
      board[19] = createFullRow();
      board[19][5] = 0;

      const result = clearFullLines(board);

      // 不是满行，不应被消除
      expect(result[19][5]).toBe(0);
      expect(result[19][0]).toBe(1);
    });
  });

  // ==================== 棋盘尺寸 ====================
  describe('棋盘尺寸', () => {
    it('返回的棋盘行数应始终等于原棋盘行数', () => {
      const board = createBoard();
      board[19] = createFullRow();
      board[18] = createFullRow();
      board[17] = createFullRow();

      const result = clearFullLines(board);

      expect(result.length).toBe(board.length);
    });

    it('返回的棋盘列数应始终等于原棋盘列数', () => {
      const board = createBoard();
      board[19] = createFullRow();

      const result = clearFullLines(board);

      result.forEach((row) => {
        expect(row.length).toBe(COLS);
      });
    });

    it('每行都应该是独立的数组', () => {
      const board = createBoard();
      board[19] = createFullRow();

      const result = clearFullLines(board);

      // 验证顶部补充的空行是独立数组（修改一行不影响其他行）
      result[0][0] = 99;
      expect(result[1][0]).toBe(0);
    });
  });
});
