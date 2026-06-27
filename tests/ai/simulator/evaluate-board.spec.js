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
      // agg=5 × -0.7 = -3.5, bump=5 × -0.35 = -1.75 → -5.25
      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-5.25, 2);
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
      // agg=3×-0.7=-2.1, bump=3×-0.35=-1.05, holes=1×-8=-8 → -11.15
      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-11.15, 2);
    });

    it('没有空洞的满列不受空洞惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1;
      // agg=3×-0.7=-2.1, bump=3×-0.35=-1.05 → -3.15
      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-3.15, 2);
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
      // agg=30×-0.7=-21
      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-21, 2);
    });

    it('相邻列高度差应受惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) board[y][0] = 1;
      board[19][1] = 1;
      // agg=6×-0.7=-4.2, bump=5×-0.35=-1.75 → -5.95
      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-5.95, 2);
    });
  });

  // ==================== 危险区惩罚 ====================
  describe('危险区惩罚', () => {
    it('超过 12 行触发指数惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 6; y < 20; y++) board[y][0] = 1; // max=14
      // 危险区: -(14-12)²×0.5 = -2
      const score = evaluateBoard(board);
      expect(score).toBeLessThan(-2);
    });

    it('12 行以内不触发', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 8; y < 20; y++) board[y][0] = 1; // max=12
      const score = evaluateBoard(board);
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
      // lineReward=40×(20/4)=200, clearScore×0.03=24, combo×0.8=0.8 → 224.8
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(224.8, 2);
    });

    it('消 1 行奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { cleared: 1, clearScore: 100, combo: 1 };
      // lineReward=2×(20/4)=10, clearScore×0.03=3, combo×0.8=0.8 → 13.8
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(13.8, 2);
    });

    it('无 clearResult 时无消行奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let x = 0; x < 10; x++) board[19][x] = 1;
      // agg=10×-0.7=-7
      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-7, 2);
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
      // lineReward=6×(20/4)=30, clearScore×0.03=36, TSpin=8, combo×0.8=0.8 → 74.8
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(74.8, 2);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('全满棋盘触发最大危险区惩罚', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 1),
      );
      // agg=200×-0.7=-140, maxPenalty=-(20-12)²×0.5=-32 → -172
      const score = evaluateBoard(board);
      expect(score).toBeLessThan(-140);
    });

    it('颜色字符串也应正确处理', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = '#00c8ff';
      // agg=1×-0.7=-0.7, bump=1×-0.35=-0.35 → -1.05
      const score = evaluateBoard(board);
      expect(score).toBeCloseTo(-1.05, 2);
    });
  });

  // ==================== T-Spin Mini 奖励 ====================
  describe('T-Spin Mini 奖励', () => {
    it('T-Spin Mini 应该获得 +3 奖励', () => {
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
      // lineReward=6×(20/4)=30, clearScore×0.03=18, TSpinMini=3, combo×0.8=0.8 → 51.8
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(51.8, 2);
    });

    it('T-Spin Mini 优先级低于 T-Spin（互斥）', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 3,
        clearScore: 1600,
        isTSpin: true,
        isTSpinMini: true,
        combo: 2,
      };
      // lineReward=12×(20/4)=60, clearScore×0.03=48, TSpin=8, combo×0.8=1.6 → 117.6
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(117.6, 2);
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
      // lineReward=40×(20/4)=200, clearScore×0.03=36, TSpinMini=3 → 239
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(239, 2);
    });
  });

  // ==================== Back-to-Back 奖励 ====================
  describe('Back-to-Back 奖励', () => {
    it('Back-to-Back 应该获得 +5 奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 1200,
        isBackToBack: true,
        combo: 0,
      };
      // lineReward=40×(20/4)=200, clearScore×0.03=36, B2B=5 → 241
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(241, 2);
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
      // lineReward=6×5=30, clearScore×0.03=54, TSpin=8, B2B=5, combo×0.8=0.8 → 97.8
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(97.8, 2);
    });

    it('Back-to-Back 独立于其他奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 1,
        clearScore: 200,
        isTSpin: false,
        isTSpinMini: false,
        isBackToBack: true,
        isAllClear: false,
        combo: 0,
      };
      // lineReward=2×5=10, clearScore×0.03=6, B2B=5 → 21
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(21, 2);
    });

    it('多次 Back-to-Back 不叠加', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 1200,
        isBackToBack: true,
        combo: 5,
      };
      // lineReward=40×5=200, clearScore×0.03=36, B2B=5, combo×0.8=4 → 245
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(245, 2);
    });
  });

  // ==================== All Clear 奖励 ====================
  describe('All Clear 奖励', () => {
    it('All Clear 应该获得 +20 重奖', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 2000,
        isAllClear: true,
        combo: 0,
      };
      // lineReward=40×5=200, clearScore×0.03=60, AllClear=20 → 280
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(280, 2);
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
      // lineReward=40×5=200, clearScore×0.03=96, TSpin=8, AllClear=20 → 324
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(324, 2);
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
      // lineReward=40×5=200, clearScore×0.03=72, B2B=5, AllClear=20 → 297
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(297, 2);
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
      // lineReward=40×5=200, clearScore×0.03=150, TSpin=8, B2B=5, AllClear=20, combo×0.8=3.2 → 386.2
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(386.2, 2);
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
      // lineReward=40×5=200, clearScore×0.03=60 → 260
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(260, 2);
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
      // lineReward=2×5=10, clearScore×0.03=24, AllClear=20 → 54
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(54, 2);
    });
  });

  // ==================== 自定义权重 ====================
  describe('自定义权重', () => {
    it('应支持自定义权重覆盖默认值', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 17; y < 20; y++) board[y][0] = 1;
      // agg=3×-0.5=-1.5, bump=3×-0.1=-0.3 → -1.8
      const score = evaluateBoard(board, {
        height: -0.5,
        holes: -10,
        bumpiness: -0.1,
        completeLines: 10,
      });
      expect(score).toBeCloseTo(-1.8, 2);
    });

    it('部分自定义权重应合并默认值', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;
      // agg=3×-0.7=-2.1, bump=3×-0.35=-1.05, holes=1×-10=-10 → -13.15
      const score = evaluateBoard(board, { holes: -10 });
      expect(score).toBeCloseTo(-13.15, 2);
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
      expect(score).toBeGreaterThan(250);
    });

    it('满棋盘即使有 Tetris 也应正分（所有奖励远超惩罚）', () => {
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
      // 奖励足够大，即使结构差也是正分
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeGreaterThan(0);
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
      // lineReward=6×5=30, clearScore×0.03=9 → 39
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(39, 2);
    });

    it('combo 累加应有上限', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = {
        cleared: 4,
        clearScore: 800,
        combo: 20,
      };
      // lineReward=40×5=200, clearScore×0.03=24, combo×0.8=16 → 240
      const score = evaluateBoard(board, undefined, clearResult);
      expect(score).toBeCloseTo(240, 2);
    });
  });

  // ==================== 对战模式 (versus) ====================
  describe('对战模式 (versus)', () => {
    it('versus 模式应使用更严格的权重', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      for (let y = 15; y < 20; y++) board[y][0] = 1;
      // survival: agg=5×-0.7=-3.5, bump=5×-0.35=-1.75 → -5.25
      // versus:   agg=5×-0.8=-4.0, bump=5×-0.4=-2.0 → -6.0
      const survivalScore = evaluateBoard(board, undefined, undefined, 'survival');
      const versusScore = evaluateBoard(board, undefined, undefined, 'versus');
      expect(versusScore).toBeLessThan(survivalScore);
      expect(versusScore).toBeCloseTo(-6.0, 2);
    });

    it('versus 模式消行奖励缩放因子更大', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { cleared: 4, clearScore: 800, combo: 0 };
      // survival: lineReward=40×(20/4)=200, clearScore×0.03=24 → 224
      // versus:   lineReward=40×(25/4)=250, clearScore×0.03=24 → 274
      const survivalScore = evaluateBoard(board, undefined, clearResult, 'survival');
      const versusScore = evaluateBoard(board, undefined, clearResult, 'versus');
      expect(versusScore).toBeGreaterThan(survivalScore);
      expect(versusScore).toBeCloseTo(299, 2);
    });

    it('versus 模式攻击力奖励 - 消 2 行', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { cleared: 2, clearScore: 300, combo: 0 };
      // survival: lineReward=6×(20/4)=30, clearScore×0.03=9 → 39
      // versus:   lineReward=6×(25/4)=37.5, clearScore×0.03=9, attack=10 → 56.5
      const survivalScore = evaluateBoard(board, undefined, clearResult, 'survival');
      const versusScore = evaluateBoard(board, undefined, clearResult, 'versus');
      expect(versusScore).toBeGreaterThan(survivalScore);
      expect(versusScore).toBeCloseTo(46.5, 2);
    });

    it('versus 模式攻击力奖励 - 消 4 行 (Tetris)', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { cleared: 4, clearScore: 800, combo: 0 };
      // survival: lineReward=40×(20/4)=200, clearScore×0.03=24 → 224
      // versus:   lineReward=40×(25/4)=250, clearScore×0.03=24, attack=50 → 324
      const survivalScore = evaluateBoard(board, undefined, clearResult, 'survival');
      const versusScore = evaluateBoard(board, undefined, clearResult, 'versus');
      expect(versusScore).toBeGreaterThan(survivalScore);
      expect(versusScore).toBeCloseTo(299, 2);
    });

    it('versus 模式消 1 行无攻击力奖励', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      const clearResult = { cleared: 1, clearScore: 100, combo: 0 };
      // survival: lineReward=2×(20/4)=10, clearScore×0.03=3 → 13
      // versus:   lineReward=2×(25/4)=12.5, clearScore×0.03=3, attack=0 → 15.5
      const survivalScore = evaluateBoard(board, undefined, clearResult, 'survival');
      const versusScore = evaluateBoard(board, undefined, clearResult, 'versus');
      expect(versusScore).toBeGreaterThan(survivalScore);
      expect(versusScore).toBeCloseTo(15.5, 2);
    });

    it('versus 模式空洞惩罚更严格', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19][0] = 1;
      board[18][0] = 0;
      board[17][0] = 1;
      // survival: agg=3×-0.7=-2.1, bump=3×-0.35=-1.05, holes=1×-8=-8 → -11.15
      // versus:   agg=3×-0.8=-2.4, bump=3×-0.4=-1.2, holes=1×-9=-9 → -12.6
      const survivalScore = evaluateBoard(board, undefined, undefined, 'survival');
      const versusScore = evaluateBoard(board, undefined, undefined, 'versus');
      expect(versusScore).toBeLessThan(survivalScore);
      expect(versusScore).toBeCloseTo(-12.6, 2);
    });
  });
});
