import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';

describe('evaluateBoard', () => {
  // ==================== 空棋盘 ====================
  describe('空棋盘', () => {
    it('应该返回 0（没有任何惩罚或奖励）', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );

      expect(evaluateBoard(board)).toBe(0);
    });
  });

  // ==================== aggregateHeight（总高度） ====================
  describe('总高度惩罚', () => {
    it('单列有方块时应该返回负分', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) {
        board[y][0] = 1;
      }

      const score = evaluateBoard(board);
      // 高度 = 5，空洞 = 0，不平整度 = |5-0| + 0×8 = 5
      // 惩罚 = 5 * -0.51 + 5 * -0.18 = -2.55 - 0.9 = -3.45
      expect(score).toBeCloseTo(-3.45, 2);
    });

    it('多列高度应该累加惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1; // 高度 3
      for (let y = 15; y < 20; y++) board[y][1] = 1; // 高度 5

      const score = evaluateBoard(board);
      // 高度 = 8，空洞 = 0，不平整度 = |3-5| + |5-0| + 7×0 = 2 + 5 = 7
      // 惩罚 = 8 * -0.51 + 7 * -0.18 = -4.08 - 1.26 = -5.34
      expect(score).toBeCloseTo(-5.34, 2);
    });

    it('最高列（满列）应该受到最大惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 0; y < 20; y++) board[y][5] = 1;

      const score = evaluateBoard(board);
      // 高度 = 20，空洞 = 0，不平整度 = |20-0| + 8×0 + |0-20|（两侧）= 20 + 20 = 40
      // 实际：第 5 列高 20，两边列高 0
      // |0-0| ×4 + |0-20| + |20-0| + |0-0| ×3 = 20 + 20 = 40
      // 惩罚 = 20 * -0.51 + 40 * -0.18 = -10.2 - 7.2 = -17.4
      expect(score).toBeCloseTo(-17.4, 2);
    });
  });

  // ==================== holes（空洞数） ====================
  describe('空洞惩罚', () => {
    it('单列有一个空洞应该受到惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0; // 空洞
      board[17][0] = 1;

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-2.52, 2);
    });

    it('多列有多个空洞应该累加惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;
      board[16][0] = 0;
      board[15][0] = 1; // 列0: 高度5, 空洞2
      board[19][1] = 1;
      board[18][1] = 0;
      board[17][1] = 1; // 列1: 高度3, 空洞1

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-6.33, 2);
    });

    it('没有空洞的满列不受空洞惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1;

      const score = evaluateBoard(board);
      // 高度 = 3，空洞 = 0，不平整度 = |3-0| + 8×0 = 3
      // 惩罚 = 3 * -0.51 + 3 * -0.18 = -1.53 - 0.54 = -2.07
      expect(score).toBeCloseTo(-2.07, 2);
    });
  });

  // ==================== bumpiness（不平整度） ====================
  describe('不平整度惩罚', () => {
    it('完全平整的表面不应该受惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) {
        for (let y = 17; y < 20; y++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-12.3, 2);
    });

    it('相邻列高度差应该受到惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) board[y][0] = 1; // 高度 5
      board[19][1] = 1; // 高度 1

      const score = evaluateBoard(board);
      // 高度 = 6，空洞 = 0，不平整度 = |5-1| + |1-0| + 7×0 = 4 + 1 = 5
      // 惩罚 = 6 * -0.51 + 5 * -0.18 = -3.06 - 0.90 = -3.96
      expect(score).toBeCloseTo(-3.96, 2);
    });

    it('锯齿状表面应该受较大惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const heights = [1, 3, 1, 3, 1, 3, 1, 3, 1, 3];
      for (let x = 0; x < 10; x++) {
        for (let y = 20 - heights[x]; y < 20; y++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-12.44, 2);
    });
  });

  // ==================== completeLines（消除行奖励） ====================
  describe('消除行奖励', () => {
    it('消除 1 行应该获得奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // 最后一行填满
      for (let x = 0; x < 10; x++) board[19][x] = 1;

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-4.1, 2);
    });

    it('消除 4 行（Tetris）应该获得高奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // 最后 4 行填满
      for (let y = 16; y < 20; y++) {
        for (let x = 0; x < 10; x++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-16.4, 2);
    });

    it('消除行奖励应该能抵消部分高度惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // 填满下半部分（10 行满）
      for (let y = 10; y < 20; y++) {
        for (let x = 0; x < 10; x++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      // 总高度 = 100，空洞 = 0，不平整度 = 0，消除行 = 10
      // 分数 = 100 * -0.51 + 10 * 1.5 = -51 + 15 = -36
      expect(score).toBeCloseTo(-41, 2);
    });

    it('未满行不应该计入消除行奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 9; x++) board[19][x] = 1;

      const score = evaluateBoard(board);
      // 高度：9 列高度 1，1 列高度 0，总高度 = 9
      // 不平整度 = |1-1|×7 + |1-1| + |1-0| = 1（第 8 列到第 9 列：|1-0|）
      // 实际：前 9 列高度都是 1，互相之间差为 0；第 9 列到第 10 列：|1-0| = 1
      // bumpiness = 1, holes = 0, completeLines = 0
      // 惩罚 = 9 * -0.51 + 1 * -0.18 = -4.59 - 0.18 = -4.77
      expect(score).toBeCloseTo(-4.77, 2);
    });
  });

  // ==================== 综合场景 ====================
  describe('综合场景', () => {
    it('典型的中等堆叠状态', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // 模拟一个不太理想的堆叠：
      // 第 0-2 列高度 5，第 3 列高度 2（有个空洞），第 4-6 列高度 4，第 7-9 列高度 6
      // 没有满行

      // 第 0-2 列
      for (let x = 0; x < 3; x++) {
        for (let y = 15; y < 20; y++) board[y][x] = 1;
      }
      // 第 3 列（有空洞）
      board[19][3] = 1;
      board[18][3] = 0; // 空洞
      board[17][3] = 1;
      // 第 4-6 列
      for (let x = 4; x < 7; x++) {
        for (let y = 16; y < 20; y++) board[y][x] = 1;
      }
      // 第 7-9 列
      for (let x = 7; x < 10; x++) {
        for (let y = 14; y < 20; y++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-23.83, 2);
    });

    it('即将消除一行的状态应该比纯堆叠得分高', () => {
      const boardA = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // 状态 A：堆了 9 列高度 1，第 10 列空着（无消除）
      for (let x = 0; x < 9; x++) boardA[19][x] = 1;

      const boardB = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // 状态 B：完整填满一行（可消除）
      for (let x = 0; x < 10; x++) boardB[19][x] = 1;

      const scoreA = evaluateBoard(boardA);
      const scoreB = evaluateBoard(boardB);

      // 状态 B 有消行奖励，应该比状态 A 得分高
      expect(scoreB).toBeGreaterThan(scoreA);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('应该处理高度为 1 的棋盘', () => {
      const board = Array.from({ length: 1 }, () =>
        Array.from({ length: 10 }, () => 0),
      );

      expect(evaluateBoard(board)).toBe(0);
    });

    it('应该处理宽度为 1 的棋盘', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 1 }, () => 0),
      );

      expect(evaluateBoard(board)).toBe(0);
    });

    it('全满棋盘', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 1),
      );

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-82, 2);
    });

    it('传入非零值（如颜色字符串）也应该能正确处理', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = '#00c8ff';

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-0.69, 2);
    });
  });
});
