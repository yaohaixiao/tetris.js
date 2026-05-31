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
      // -2.55 - 6.0 - 0.9 = -9.45
      expect(score).toBeCloseTo(-9.45, 2);
    });

    it('最高列应该额外受罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 10; y < 20; y++) board[y][0] = 1;
      for (let y = 17; y < 20; y++) board[y][1] = 1;
      for (let y = 17; y < 20; y++) board[y][2] = 1;

      const score = evaluateBoard(board);
      // x=0 高 10, x=1 高 3, x=2 高 3, 其余 0
      // aggregateHeight=16, maxHeight=10, bumpiness=7+3+3+7×0=13
      // -8.16 - 12 - 5.6 - 2.34 = -28.1
      expect(score).toBeLessThan(-20);
    });

    it('均匀堆叠比集中堆叠得分高', () => {
      const boardA = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // 均匀：5列各高4
      for (let x = 0; x < 5; x++) {
        for (let y = 16; y < 20; y++) boardA[y][x] = 1;
      }

      const boardB = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // 集中：1列高20
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
      // -1.53 - 3.6 - 0.35 - 0.54 = -6.02
      expect(score).toBeCloseTo(-6.02, 2);
    });

    it('没有空洞的满列不受空洞惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1;

      const score = evaluateBoard(board);
      // aggregateHeight=3, maxHeight=3, bumpiness=3
      // -1.53 - 3.6 - 0.54 = -5.67
      expect(score).toBeCloseTo(-5.67, 2);
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
      expect(score).toBeCloseTo(-5.4, 2);
    });

    it('相邻列高度差应该受到惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) board[y][0] = 1;
      board[19][1] = 1;

      const score = evaluateBoard(board);
      // aggregateHeight=6, maxHeight=5, bumpiness=5
      // -3.06 - 6.0 - 0.9 = -9.96
      expect(score).toBeCloseTo(-9.96, 2);
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
      // -5.1 - 1.2 + 1.5 = -4.8
      expect(score).toBeCloseTo(-4.8, 2);
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
      // -20.4 - 4.8 + 24 = -1.2
      expect(score).toBeCloseTo(-1.2, 2);
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
      expect(score).toBe(8.5); // 0 + 800*0.01 + 1*0.5
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
      // 0 + 12 + 5 + 0.5 = 17.5
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
      // 0 + 12 + 3 + 0.5 = 15.5
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
      // 0 + 1 + 10 + 0.5 = 11.5
      expect(score).toBeCloseTo(11.5, 2);
    });

    it('Combo 奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { clearScore: 300, combo: 5 };

      const score = evaluateBoard(board, undefined, clearResult);
      // 0 + 3 + 2.5 = 5.5
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
      // -1.53 - 3.6 - 0.75 - 0.54 = -6.42
      expect(score).toBeCloseTo(-6.42, 2);
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
      // -11.5 - 1.2 + 6 = -6.7
      expect(score).toBeCloseTo(-6.7, 2);
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
      // -102 - 24 + 600 = 474
      expect(score).toBeCloseTo(474, 2);
    });

    it('传入非零值（颜色字符串）也应正确处理', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = '#00c8ff';

      const score = evaluateBoard(board);
      // aggregateHeight=1, maxHeight=1, bumpiness=1
      // -0.51 - 1.2 - 0.18 = -1.89
      expect(score).toBeCloseTo(-1.89, 2);
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
