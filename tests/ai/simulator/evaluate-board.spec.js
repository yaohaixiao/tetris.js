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

  // ==================== 补充覆盖 124: T-Spin Mini ====================
  describe('T-Spin Mini 奖励', () => {
    it('T-Spin Mini 应该获得 +2 奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 2,
        clearScore: 600,
        isTSpin: false,
        isTSpinMini: true,
        combo: 1,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=4 × 4=16, clearScore×0.01=6, TSpinMini=2, combo×0.5=0.5
      // 16 + 6 + 2 + 0.5 = 24.5
      expect(score).toBeCloseTo(24.5, 2);
    });

    it('T-Spin Mini 优先级低于 T-Spin（互斥）', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // T-Spin 和 T-Spin Mini 同时为 true 时，走 T-Spin 分支（+5）
      const clearResult = {
        cleared: 3,
        clearScore: 1600,
        isTSpin: true,
        isTSpinMini: true, // 同时为 true
        combo: 2,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=8 × 4=32, clearScore×0.01=16, TSpin=5, combo×0.5=1
      // 32 + 16 + 5 + 1 = 54
      expect(score).toBeCloseTo(54, 2);
    });

    it('T-Spin Mini 在 Tetris 中不生效（isTSpinMini 独立）', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 1200,
        isTSpin: false,
        isTSpinMini: true,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=12, TSpinMini=2
      // 80 + 12 + 2 = 94
      expect(score).toBeCloseTo(94, 2);
    });
  });

  // ==================== 补充覆盖 128: Back-to-Back ====================
  describe('Back-to-Back 奖励', () => {
    it('Back-to-Back 应该获得 +3 奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 1200,
        isBackToBack: true,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=12, backToBack=3
      // 80 + 12 + 3 = 95
      expect(score).toBeCloseTo(95, 2);
    });

    it('Back-to-Back 配合 T-Spin', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 2,
        clearScore: 1800,
        isTSpin: true,
        isBackToBack: true,
        combo: 1,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=4 × 4=16, clearScore×0.01=18, TSpin=5, backToBack=3, combo×0.5=0.5
      // 16 + 18 + 5 + 3 + 0.5 = 42.5
      expect(score).toBeCloseTo(42.5, 2);
    });

    it('Back-to-Back 独立于其他奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // 仅 Back-to-Back，无 T-Spin、无 All Clear
      const clearResult = {
        cleared: 1,
        clearScore: 200,
        isTSpin: false,
        isTSpinMini: false,
        isBackToBack: true,
        isAllClear: false,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=1 × 4=4, clearScore×0.01=2, backToBack=3
      // 4 + 2 + 3 = 9
      expect(score).toBeCloseTo(9, 2);
    });

    it('多次 Back-to-Back 不叠加', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      // combo 是连击，Back-to-Back 是独立标志
      const clearResult = {
        cleared: 4,
        clearScore: 1200,
        isBackToBack: true,
        combo: 5, // 高 combo
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=12, backToBack=3, combo×0.5=2.5
      // 80 + 12 + 3 + 2.5 = 97.5
      expect(score).toBeCloseTo(97.5, 2);
    });
  });

  // ==================== 补充覆盖 132: All Clear ====================
  describe('All Clear 奖励', () => {
    it('All Clear 应该获得 +10 重奖', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 2000,
        isAllClear: true,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=20, allClear=10
      // 80 + 20 + 10 = 110
      expect(score).toBeCloseTo(110, 2);
    });

    it('All Clear 配合 T-Spin（完美操作）', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 3200,
        isTSpin: true,
        isAllClear: true,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=32, TSpin=5, allClear=10
      // 80 + 32 + 5 + 10 = 127
      expect(score).toBeCloseTo(127, 2);
    });

    it('All Clear 配合 Back-to-Back', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 2400,
        isBackToBack: true,
        isAllClear: true,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=24, backToBack=3, allClear=10
      // 80 + 24 + 3 + 10 = 117
      expect(score).toBeCloseTo(117, 2);
    });

    it('All Clear 全部奖励叠加', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 5000,
        isTSpin: true,
        isBackToBack: true,
        isAllClear: true,
        combo: 4,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=50, TSpin=5, backToBack=3, allClear=10, combo×0.5=2
      // 80 + 50 + 5 + 3 + 10 + 2 = 150
      expect(score).toBeCloseTo(150, 2);
    });

    it('非 All Clear 不得分', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 2000,
        isAllClear: false,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=20
      // 80 + 20 = 100（无 allClear 奖励）
      expect(score).toBeCloseTo(100, 2);
    });

    it('All Clear 优先级测试（无 T-Spin 时仍有重奖）', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 1,
        clearScore: 800,
        isTSpin: false,
        isTSpinMini: false,
        isBackToBack: false,
        isAllClear: true,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=1 × 4=4, clearScore×0.01=8, allClear=10
      // 4 + 8 + 10 = 22
      expect(score).toBeCloseTo(22, 2);
    });
  });

  // ==================== 权重覆盖测试 ====================
  describe('自定义权重', () => {
    it('应支持自定义权重覆盖默认值', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1;

      const customWeights = {
        height: -0.5,
        holes: -10,
        bumpiness: -0.1,
        completeLines: 10,
      };

      const score = evaluateBoard(board, customWeights);
      // agg=3 × -0.5 = -1.5, bump=3 × -0.1 = -0.3
      // -1.5 - 0.3 = -1.8
      expect(score).toBeCloseTo(-1.8, 2);
    });

    it('部分自定义权重应合并默认值', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;

      // 只覆盖 holes 权重
      const score = evaluateBoard(board, { holes: -10 });
      // agg=3 × -0.3 = -0.9, bump=3 × -0.2 = -0.6, holes=1 × -10 = -10
      // -0.9 - 0.6 - 10 = -11.5
      expect(score).toBeCloseTo(-11.5, 2);
    });
  });

  // ==================== 综合场景 ====================
  describe('综合场景', () => {
    it('空棋盘 + All Clear 应返回最大奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 2000,
        isAllClear: true,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeGreaterThan(100);
    });

    it('满棋盘即使有 Tetris 也应负分', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 1),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 800,
        isTSpin: true,
        isBackToBack: true,
        isAllClear: false,
        combo: 10,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // 危险区惩罚极重，即使所有奖励加满也应该是负分
      expect(score).toBeLessThan(0);
    });

    it('所有奖励标志都为 false 时应仅得消行基础分', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 2,
        clearScore: 300,
        isTSpin: false,
        isTSpinMini: false,
        isBackToBack: false,
        isAllClear: false,
        combo: 0,
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=4 × 4=16, clearScore×0.01=3
      // 16 + 3 = 19
      expect(score).toBeCloseTo(19, 2);
    });

    it('combo 累加应有上限', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 800,
        combo: 20, // 极高 combo
      };

      const score = evaluateBoard(board, undefined, clearResult);
      // lineReward=20 × 4=80, clearScore×0.01=8, combo×0.5=10
      // 80 + 8 + 10 = 98
      expect(score).toBeCloseTo(98, 2);
    });
  });
});
