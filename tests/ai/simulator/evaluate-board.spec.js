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

  // ==================== 总高度（背景压力） ====================
  describe('总高度（背景压力）', () => {
    it('单列有方块应返回负分', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) board[y][0] = 1;

      const score = evaluateBoard(board);
      // agg=5 × -0.3 = -1.5, bump=5 × -0.2 = -1.0
      // -1.5 - 1.0 = -2.5
      expect(score).toBeCloseTo(-2.5, 2);
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

      expect(evaluateBoard(boardA)).toBeGreaterThan(evaluateBoard(boardB));
    });
  });

  // ==================== 空洞惩罚（核心指标） ====================
  describe('空洞惩罚', () => {
    it('有一个空洞应受重罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;

      const score = evaluateBoard(board);
      // agg=3 × -0.3 = -0.9, bump=3 × -0.2 = -0.6, holes=1 × -5 = -5
      // -0.9 - 0.6 - 5 = -6.5
      expect(score).toBeCloseTo(-6.5, 2);
    });

    it('没有空洞的满列不受空洞惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1;

      const score = evaluateBoard(board);
      // agg=3 × -0.3 = -0.9, bump=3 × -0.2 = -0.6
      // -0.9 - 0.6 = -1.5
      expect(score).toBeCloseTo(-1.5, 2);
    });
  });

  // ==================== 不平整度 ====================
  describe('不平整度', () => {
    it('完全平整只有高度惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) {
        for (let y = 17; y < 20; y++) board[y][x] = 1;
      }

      const score = evaluateBoard(board);
      // agg=30 × -0.3 = -9, bump=0
      expect(score).toBeCloseTo(-9, 2);
    });

    it('相邻列高度差应受惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) board[y][0] = 1;
      board[19][1] = 1;

      const score = evaluateBoard(board);
      // agg=6 × -0.3 = -1.8, bump=5 × -0.2 = -1.0
      // -1.8 - 1.0 = -2.8
      expect(score).toBeCloseTo(-2.8, 2);
    });
  });

  // ==================== 危险区惩罚 ====================
  describe('危险区惩罚', () => {
    it('超过 10 行触发指数惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 8; y < 20; y++) board[y][0] = 1; // max=12

      const score = evaluateBoard(board);
      // 危险区: -(12-10)² × 1 = -4
      expect(score).toBeLessThan(-4);
    });

    it('10 行以内不触发', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 10; y < 20; y++) board[y][0] = 1; // max=10

      const score = evaluateBoard(board);
      // 危险区不触发
      expect(score).toBeGreaterThan(-20);
    });
  });

  // ==================== 消行奖励（clearResult） ====================
  describe('消行奖励', () => {
    it('Tetris 应获得高奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { cleared: 4, clearScore: 800, combo: 1 };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=8, combo×0.5=0.5
      // 80 + 8 + 0.5 = 88.5
      expect(score).toBeCloseTo(88.5, 2);
    });

    it('消 1 行奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { cleared: 1, clearScore: 100, combo: 1 };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=1 × 4=4, clearScore×0.01=1, combo×0.5=0.5
      // 4 + 1 + 0.5 = 5.5
      expect(score).toBeCloseTo(5.5, 2);
    });

    it('无 clearResult 时无消行奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) board[19][x] = 1;

      const score = evaluateBoard(board);
      // 没有 clearResult，lineReward=0
      // agg=10 × -0.3 = -3
      expect(score).toBeCloseTo(-3, 2);
    });
  });

  // ==================== 计分奖励 ====================
  describe('计分奖励', () => {
    it('T-Spin 额外奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 2,
        clearScore: 1200,
        isTSpin: true,
        combo: 1,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=4 × 4=16, clearScore×0.01=12, TSpin=5, combo×0.5=0.5
      // 16 + 12 + 5 + 0.5 = 33.5
      expect(score).toBeCloseTo(33.5, 2);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('全满棋盘触发最大危险区惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 1),
      );

      const score = evaluateBoard(board);
      // agg=200×-0.3=-60, maxPenalty=-(20-10)²×1=-100
      // -60 - 100 = -160
      expect(score).toBeLessThan(-150);
    });

    it('颜色字符串也应正确处理', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = '#00c8ff';

      const score = evaluateBoard(board);
      // agg=1×-0.3=-0.3, bump=1×-0.2=-0.2
      // -0.3 - 0.2 = -0.5
      expect(score).toBeCloseTo(-0.5, 2);
    });
  });
});
