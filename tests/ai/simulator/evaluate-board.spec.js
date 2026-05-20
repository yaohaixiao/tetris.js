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
      // 高度 = 5，不平整度 = |5-0| + 8×0 = 5
      // 惩罚 = 5 * -0.51 + 5 * -0.18 = -3.45
      expect(score).toBeCloseTo(-3.45, 2);
    });

    it('多列高度应该累加惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1;
      for (let y = 15; y < 20; y++) board[y][1] = 1;

      const score = evaluateBoard(board);
      // 高度 = 8，不平整度 = |3-5| + |5-0| + 7×0 = 7
      // 惩罚 = 8 * -0.51 + 7 * -0.18 = -5.34
      expect(score).toBeCloseTo(-5.34, 2);
    });

    it('最高列（满列）应该受到最大惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 0; y < 20; y++) board[y][5] = 1;

      const score = evaluateBoard(board);
      // 高度 = 20，不平整度 = 40
      // 惩罚 = 20 * -0.51 + 40 * -0.18 = -17.4
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
      board[18][0] = 0;
      board[17][0] = 1;

      const score = evaluateBoard(board);
      // 高度 = 3，空洞 = 1，不平整度 = 3
      // 惩罚 = 3 * -0.51 + 1 * -0.35 + 3 * -0.18 = -2.42
      expect(score).toBeCloseTo(-2.42, 2);
    });

    it('多列有多个空洞应该累加惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;
      board[16][0] = 0;
      board[15][0] = 1;
      board[19][1] = 1;
      board[18][1] = 0;
      board[17][1] = 1;

      const score = evaluateBoard(board);
      // 高度 = 8，空洞 = 3，不平整度 = 5
      // 惩罚 = 8 * -0.51 + 3 * -0.35 + 5 * -0.18 = -6.03
      expect(score).toBeCloseTo(-6.03, 2);
    });

    it('没有空洞的满列不受空洞惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1;

      const score = evaluateBoard(board);
      // 高度 = 3，空洞 = 0，不平整度 = 3
      // 惩罚 = 3 * -0.51 + 3 * -0.18 = -2.07
      expect(score).toBeCloseTo(-2.07, 2);
    });
  });

  // ==================== bumpiness（不平整度） ====================
  describe('不平整度惩罚', () => {
    it('完全平整的表面不应该受 bumpiness 惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) {
        for (let y = 17; y < 20; y++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      // 总高度 = 30，不平整度 = 0，completeLines = 3，奖励 = 4.5
      // score = -15.3 + 4.5 = -10.8
      expect(score).toBeCloseTo(-10.8, 2);
    });

    it('相邻列高度差应该受到惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) board[y][0] = 1;
      board[19][1] = 1;

      const score = evaluateBoard(board);
      // 高度 = 6，不平整度 = 5
      // 惩罚 = 6 * -0.51 + 5 * -0.18 = -3.96
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
      // 总高度 = 20，不平整度 = 18，completeLines = 1，奖励 = 1.5
      // score = -10.2 - 3.24 + 1.5 = -11.94
      expect(score).toBeCloseTo(-11.94, 2);
    });
  });

  // ==================== completeLines（消除行奖励） ====================
  describe('消除行奖励', () => {
    it('消除 1 行应该获得奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) board[19][x] = 1;

      const score = evaluateBoard(board);
      // 高度 = 10，消除行 = 1，奖励 = 1.5
      // score = -5.1 + 1.5 = -3.6
      expect(score).toBeCloseTo(-3.6, 2);
    });

    it('消除 4 行（Tetris）应该获得高奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 16; y < 20; y++) {
        for (let x = 0; x < 10; x++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      // 总高度 = 40，消除行 = 4，奖励 = 6.0
      // score = -20.4 + 6.0 = -14.4
      expect(score).toBeCloseTo(-14.4, 2);
    });

    it('消除行奖励应该能抵消部分高度惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 10; y < 20; y++) {
        for (let x = 0; x < 10; x++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      // 总高度 = 100，消除行 = 10，奖励 = 15
      // score = -51 + 15 = -36
      expect(score).toBeCloseTo(-36, 2);
    });

    it('未满行不应该计入消除行奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 9; x++) board[19][x] = 1;

      const score = evaluateBoard(board);
      // 高度 = 9，不平整度 = 1
      // score = -4.59 - 0.18 = -4.77
      expect(score).toBeCloseTo(-4.77, 2);
    });
  });

  // ==================== 综合场景 ====================
  describe('综合场景', () => {
    it('典型的中等堆叠状态', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 3; x++) {
        for (let y = 15; y < 20; y++) board[y][x] = 1;
      }
      board[19][3] = 1;
      board[17][3] = 1;
      for (let x = 4; x < 7; x++) {
        for (let y = 16; y < 20; y++) board[y][x] = 1;
      }
      for (let x = 7; x < 10; x++) {
        for (let y = 14; y < 20; y++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-22.73, 2);
    });

    it('即将消除一行的状态应该比纯堆叠得分高', () => {
      const boardA = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 9; x++) boardA[19][x] = 1;

      const boardB = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) boardB[19][x] = 1;

      const scoreA = evaluateBoard(boardA);
      const scoreB = evaluateBoard(boardB);

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
      // 总高度 = 200，消除行 = 20，奖励 = 30
      // score = -102 + 30 = -72
      expect(score).toBeCloseTo(-72, 2);
    });

    it('传入非零值（如颜色字符串）也应该能正确处理', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = '#00c8ff';

      const score = evaluateBoard(board);
      // 高度 = 1，不平整度 = 1
      // score = -0.51 - 0.18 = -0.69
      expect(score).toBeCloseTo(-0.69, 2);
    });
  });

  // ==================== 自定义权重 ====================
  describe('自定义权重', () => {
    it('应该支持传入自定义权重', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;

      const weights = {
        holes: -0.75,
        height: -0.51,
        bumpiness: -0.18,
        completeLines: 1.5,
      };

      const score = evaluateBoard(board, weights);
      // 高度 = 3，空洞 = 1，不平整度 = 3
      // score = -1.53 - 0.75 - 0.54 = -2.82
      expect(score).toBeCloseTo(-2.82, 2);
    });

    it('应该支持部分自定义权重（其余用默认值）', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;

      const weights = { holes: -0.99 };

      const score = evaluateBoard(board, weights);
      // 高度 = 3，空洞 = 1，不平整度 = 3
      // score = -1.53 - 0.99 - 0.54 = -3.06
      expect(score).toBeCloseTo(-3.06, 2);
    });

    it('NORMAL 难度权重', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) board[19][x] = 1;

      const weights = {
        holes: -0.75,
        height: -0.45,
        bumpiness: -0.18,
        completeLines: 6.0,
      };

      const score = evaluateBoard(board, weights);
      // 高度 = 10，消除行 = 1
      // score = -4.5 + 6.0 = 1.5
      expect(score).toBeCloseTo(1.5, 2);
    });

    it('HARD 难度权重', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) board[19][x] = 1;

      const weights = {
        holes: -0.9,
        height: -0.55,
        bumpiness: -0.2,
        completeLines: 6.5,
      };

      const score = evaluateBoard(board, weights);
      // 高度 = 10，消除行 = 1
      // score = -5.5 + 6.5 = 1.0
      expect(score).toBeCloseTo(1.0, 2);
    });
  });
});
