import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';

describe('evaluateBoard', () => {
  // ==================== 空棋盘 ====================
  describe('空棋盘', () => {
    it('应该返回 0', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      expect(evaluateBoard(board)).toBe(0);
    });
  });

  // ==================== 总高度惩罚 ====================
  describe('总高度惩罚', () => {
    it('单列有方块时应该返回负分', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) board[y][0] = 1;

      const score = evaluateBoard(board);
      // aggregateHeight=5, maxHeight=5, bumpiness=5
      // -2.55 - 7.5 - 0.9 = -10.95
      expect(score).toBeCloseTo(-10.95, 2);
    });

    it('最高列应该额外受罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 10; y < 20; y++) board[y][0] = 1;
      for (let y = 17; y < 20; y++) board[y][1] = 1;
      for (let y = 17; y < 20; y++) board[y][2] = 1;

      const score = evaluateBoard(board);
      expect(score).toBeLessThan(-20);
    });

    it('均匀堆叠比集中堆叠得分高', () => {
      const boardA = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 5; x++) {
        for (let y = 16; y < 20; y++) boardA[y][x] = 1;
      }

      const boardB = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 0; y < 20; y++) boardB[y][0] = 1;

      const scoreA = evaluateBoard(boardA);
      const scoreB = evaluateBoard(boardB);

      expect(scoreA).toBeGreaterThan(scoreB);
    });
  });

  // ==================== 空洞惩罚 ====================
  describe('空洞惩罚', () => {
    it('单列有一个空洞应该受到惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;

      const score = evaluateBoard(board);
      // aggregateHeight=3, maxHeight=3, holes=1, bumpiness=3
      // -1.53 - 4.5 - 0.35 - 0.54 = -6.92
      expect(score).toBeCloseTo(-6.92, 2);
    });

    it('没有空洞的满列不受空洞惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1;

      const score = evaluateBoard(board);
      // aggregateHeight=3, maxHeight=3, bumpiness=3
      // -1.53 - 4.5 - 0.54 = -6.57
      expect(score).toBeCloseTo(-6.57, 2);
    });
  });

  // ==================== 不平整度惩罚 ====================
  describe('不平整度惩罚', () => {
    it('完全平整的表面 bumpiness 惩罚为 0', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) {
        for (let y = 17; y < 20; y++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      // aggregateHeight=30, maxHeight=3, completeLines=3
      // -15.3 - 4.5 + 13.5 = -6.3
      expect(score).toBeCloseTo(-6.3, 2);
    });

    it('相邻列高度差应该受到惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) board[y][0] = 1;
      board[19][1] = 1;

      const score = evaluateBoard(board);
      // aggregateHeight=6, maxHeight=5, bumpiness=5
      // -3.06 - 7.5 - 0.9 = -11.46
      expect(score).toBeCloseTo(-11.46, 2);
    });
  });

  // ==================== 消除行奖励 ====================
  describe('消除行奖励', () => {
    it('消除 1 行应该获得奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) board[19][x] = 1;

      const score = evaluateBoard(board);
      // aggregateHeight=10, maxHeight=1, completeLines=1
      // -5.1 - 1.5 + 1.5 = -5.1
      expect(score).toBeCloseTo(-5.1, 2);
    });

    it('消除 4 行（Tetris）应该获得高奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 16; y < 20; y++) {
        for (let x = 0; x < 10; x++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      // aggregateHeight=40, maxHeight=4, completeLines=4
      // -20.4 - 6.0 + 24 = -2.4
      expect(score).toBeCloseTo(-2.4, 2);
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

  // ==================== 计分奖励 ====================
  describe('计分奖励（clearResult）', () => {
    it('消行得分归一化', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { clearScore: 800, combo: 1 };

      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBe(8.5);
    });

    it('T-Spin 额外奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        clearScore: 1200,
        isTSpin: true,
        isTSpinMini: false,
        isBackToBack: false,
        isAllClear: false,
        combo: 1,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(17.5, 2);
    });

    it('Back-to-Back 奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        clearScore: 1200,
        isTSpin: false,
        isTSpinMini: false,
        isBackToBack: true,
        isAllClear: false,
        combo: 1,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(15.5, 2);
    });

    it('All Clear 重奖', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        clearScore: 100,
        isTSpin: false,
        isTSpinMini: false,
        isBackToBack: false,
        isAllClear: true,
        combo: 1,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(11.5, 2);
    });

    it('Combo 奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { clearScore: 300, combo: 5 };

      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBe(5.5);
    });
  });

  // ==================== 自定义权重 ====================
  describe('自定义权重', () => {
    it('应该支持传入自定义权重覆盖默认值', () => {
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
      // aggregateHeight=3, maxHeight=3, holes=1, bumpiness=3
      // -1.53 - 4.5 - 0.75 - 0.54 = -7.32
      expect(score).toBeCloseTo(-7.32, 2);
    });

    it('HARD 难度权重', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) board[19][x] = 1;

      const weights = {
        holes: -0.9,
        height: -1.15,
        bumpiness: -0.25,
        completeLines: 6.0,
      };

      const score = evaluateBoard(board, weights);
      // aggregateHeight=10, maxHeight=1, completeLines=1
      // -11.5 - 1.5 + 6 = -7.0
      expect(score).toBeCloseTo(-7.0, 2);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('全满棋盘', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 1),
      );

      const score = evaluateBoard(board);
      // aggregateHeight=200, maxHeight=20, completeLines=20
      // -102 - 30 + 600 = 468
      expect(score).toBeCloseTo(468, 2);
    });

    it('传入非零值（颜色字符串）也应正确处理', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = '#00c8ff';

      const score = evaluateBoard(board);
      // aggregateHeight=1, maxHeight=1, bumpiness=1
      // -0.51 - 1.5 - 0.18 = -2.19
      expect(score).toBeCloseTo(-2.19, 2);
    });

    it('高度为 1 的棋盘', () => {
      const board = Array.from({ length: 1 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      expect(evaluateBoard(board)).toBe(0);
    });

    it('宽度为 1 的棋盘', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 1 }, () => 0),
      );
      expect(evaluateBoard(board)).toBe(0);
    });
  });
});
