import countHoles from '@/lib/ai/simulator/utils/count-holes.js';

describe('countHoles', () => {
  const COLS = 10;
  const ROWS = 20;

  const createBoard = () =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(0));

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('空棋盘应该返回 0 个空洞', () => {
      const board = createBoard();
      expect(countHoles(board)).toBe(0);
    });

    it('单列有一个空洞', () => {
      const board = createBoard();
      // 底部有方块，中间留一个空洞
      board[19][0] = 1;
      board[18][0] = 0; // 空洞
      board[17][0] = 1;

      expect(countHoles(board)).toBe(1);
    });

    it('单列有两个空洞', () => {
      const board = createBoard();
      board[19][0] = 1;
      board[18][0] = 0; // 空洞
      board[17][0] = 1;
      board[16][0] = 0; // 空洞
      board[15][0] = 1;

      expect(countHoles(board)).toBe(2);
    });

    it('多列有多个空洞应该累加', () => {
      const board = createBoard();
      // 第 0 列：2 个空洞
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;
      board[16][0] = 0;
      board[15][0] = 1;
      // 第 1 列：1 个空洞
      board[19][1] = 1;
      board[18][1] = 0;
      board[17][1] = 1;

      expect(countHoles(board)).toBe(3);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('没有空洞的满列应该返回 0', () => {
      const board = createBoard();
      // 底部连续 3 个方块，无空洞
      for (let y = 17; y < 20; y++) {
        board[y][0] = 1;
      }

      expect(countHoles(board)).toBe(0);
    });

    it('只有顶部有方块时下方全是空洞', () => {
      const board = createBoard();
      board[0][0] = 1;

      // 顶部有方块，下方 19 行全是空，算 19 个空洞
      expect(countHoles(board)).toBe(19);
    });

    it('只有底部有方块时不应计空洞', () => {
      const board = createBoard();
      board[19][0] = 1;

      // 底部有方块，上方为空，没有"方块下方的空格"
      expect(countHoles(board)).toBe(0);
    });

    it('全满棋盘应该返回 0 个空洞', () => {
      const board = Array.from({ length: ROWS }, () => Array(COLS).fill(1));

      expect(countHoles(board)).toBe(0);
    });

    it('单列中所有方块都在底部时不应计空洞', () => {
      const board = createBoard();
      // 底部连续填满，没有空洞
      for (let y = 10; y < 20; y++) {
        board[y][5] = 1;
      }

      expect(countHoles(board)).toBe(0);
    });

    it('应该正确处理非 1 的值（如颜色字符串）', () => {
      const board = createBoard();
      board[19][0] = '#00c8ff';
      board[18][0] = 0; // 空洞
      board[17][0] = '#f1fa04';

      expect(countHoles(board)).toBe(1);
    });
  });

  // ==================== 复杂场景 ====================
  describe('复杂场景', () => {
    it('锯齿状堆叠的空洞计算', () => {
      const board = createBoard();
      // 模拟一个不平整的堆叠
      // 第 0 列：高度 5，无空洞
      for (let y = 15; y < 20; y++) board[y][0] = 1;
      // 第 1 列：高度 3，有 1 个空洞（在高度 5 和 3 的差之间）
      for (let y = 17; y < 20; y++) board[y][1] = 1;

      // 第 1 列：y=15 到 y=16 之间在方块上方是空，不算空洞
      // y=17 是最顶部方块，它下面没有空洞
      // 所以空洞数应该是 0
      expect(countHoles(board)).toBe(0);
    });

    it('复杂堆叠的空洞计算', () => {
      const board = createBoard();
      // 第 0 列：高度 3，有 1 个空洞
      board[19][0] = 1;
      board[18][0] = 0; // 空洞
      board[17][0] = 1;
      // 第 1 列：高度 4，有 2 个空洞
      board[19][1] = 1;
      board[18][1] = 0; // 空洞
      board[17][1] = 1;
      board[16][1] = 0; // 空洞
      board[15][1] = 1;
      // 第 2 列：高度 2，无空洞
      board[19][2] = 1;
      board[18][2] = 1;

      expect(countHoles(board)).toBe(3);
    });
  });

  // ==================== 不可变性 ====================
  describe('不可变性', () => {
    it('不应该修改原始棋盘', () => {
      const board = createBoard();
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;

      const boardCopy = board.map((row) => [...row]);

      countHoles(board);

      expect(board).toEqual(boardCopy);
    });
  });
});
