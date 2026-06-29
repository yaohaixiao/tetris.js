import simulateClearResult from '@/lib/ai/simulator/simulate-clear-result.js';

// Mock GAME 常量，包含 T_SPIN_SCORES 和 T_SPIN_MINI_SCORES
jest.mock('@/lib/game/constants/game.js', () => ({
  __esModule: true,
  default: {
    CLEAR_LINE_SCORES: [0, 100, 300, 500, 800, 1200],
    T_SPIN_SCORES: [400, 800, 1200, 1600],
    T_SPIN_MINI_SCORES: [100, 200, 400],
  },
}));

describe('simulateClearResult', () => {
  // ==================== 辅助函数 ====================

  /** 创建空棋盘（20 行 × 10 列，全部为 0） */
  const createBoard = () =>
    Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => 0));

  /** 创建模拟快照，包含 combo、backToBack、tSpin 字段 */
  const createSnapshot = (overrides = {}) => ({
    combo: 0,
    backToBack: false,
    tSpin: null,
    ...overrides,
  });

  // ==================== 无消行 ====================
  describe('无消行', () => {
    it('空棋盘应该返回 null', () => {
      const board = createBoard();
      const snapshot = createSnapshot();

      const result = simulateClearResult(board, snapshot);

      expect(result).toBeNull();
    });

    it('没有满行时应该返回 null', () => {
      const board = createBoard();
      board[19][0] = 1;
      const snapshot = createSnapshot();

      const result = simulateClearResult(board, snapshot);

      expect(result).toBeNull();
    });
  });

  // ==================== actualCleared 参数 ====================
  describe('actualCleared 参数', () => {
    it('传入 actualCleared 时应该使用传入值而非棋盘检测', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot();

      // 不传 actualCleared：自动检测到 1 行满
      const autoResult = simulateClearResult(board, snapshot);
      expect(autoResult.cleared).toBe(1);

      // 传 actualCleared=4：使用传入值
      const manualResult = simulateClearResult(board, snapshot, 4);
      expect(manualResult.cleared).toBe(4);
      expect(manualResult.baseScore).toBe(800);
    });

    it('actualCleared=0 且非 T-Spin 时返回 null', () => {
      const board = createBoard();
      const snapshot = createSnapshot();

      const result = simulateClearResult(board, snapshot, 0);

      expect(result).toBeNull();
    });

    it('actualCleared=0 但 T-Spin 时不应返回 null', () => {
      const board = createBoard();
      const snapshot = createSnapshot({
        tSpin: { isTSpin: true, isTSpinMini: false },
      });

      const result = simulateClearResult(board, snapshot, 0);

      expect(result).not.toBeNull();
      expect(result.cleared).toBe(0);
      expect(result.baseScore).toBe(400);
    });
  });

  // ==================== 普通消行 ====================
  describe('普通消行', () => {
    it('消 1 行应该返回 cleared=1', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot();

      const result = simulateClearResult(board, snapshot);

      expect(result.cleared).toBe(1);
      expect(result.baseScore).toBe(100);
      expect(result.clearScore).toBe(100);
    });

    it('消 2 行应该返回 cleared=2, baseScore=300', () => {
      const board = createBoard();
      board[18] = Array(10).fill(1);
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot();

      const result = simulateClearResult(board, snapshot);

      expect(result.cleared).toBe(2);
      expect(result.baseScore).toBe(300);
    });

    it('消 4 行应该返回 cleared=4, baseScore=800', () => {
      const board = createBoard();
      board[16] = Array(10).fill(1);
      board[17] = Array(10).fill(1);
      board[18] = Array(10).fill(1);
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot();

      const result = simulateClearResult(board, snapshot);

      expect(result.cleared).toBe(4);
      expect(result.baseScore).toBe(800);
    });
  });

  // ==================== T-Spin ====================
  describe('T-Spin', () => {
    it('T-Spin 消 0 行应该返回 baseScore=400', () => {
      const board = createBoard();
      const snapshot = createSnapshot({
        tSpin: { isTSpin: true, isTSpinMini: false },
      });

      const result = simulateClearResult(board, snapshot);

      expect(result.isTSpin).toBe(true);
      expect(result.cleared).toBe(0);
      expect(result.baseScore).toBe(400);
      expect(result.clearScore).toBe(400);
    });

    it('T-Spin 消 1 行应该返回 baseScore=800', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({
        tSpin: { isTSpin: true, isTSpinMini: false },
      });

      const result = simulateClearResult(board, snapshot);

      expect(result.cleared).toBe(1);
      expect(result.baseScore).toBe(800);
    });

    it('T-Spin 消 2 行应该返回 baseScore=1200', () => {
      const board = createBoard();
      board[18] = Array(10).fill(1);
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({
        tSpin: { isTSpin: true, isTSpinMini: false },
      });

      const result = simulateClearResult(board, snapshot);

      expect(result.cleared).toBe(2);
      expect(result.baseScore).toBe(1200);
    });

    it('T-Spin Mini 消 0 行应该返回 baseScore=100', () => {
      const board = createBoard();
      const snapshot = createSnapshot({
        tSpin: { isTSpin: false, isTSpinMini: true },
      });

      const result = simulateClearResult(board, snapshot);

      expect(result.isTSpinMini).toBe(true);
      expect(result.cleared).toBe(0);
      expect(result.baseScore).toBe(100);
    });

    it('T-Spin Mini 消 1 行应该返回 baseScore=200', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({
        tSpin: { isTSpin: false, isTSpinMini: true },
      });

      const result = simulateClearResult(board, snapshot);

      expect(result.isTSpinMini).toBe(true);
      expect(result.cleared).toBe(1);
      expect(result.baseScore).toBe(200);
    });

    it('T-Spin Mini 消 2 行应该返回 baseScore=400', () => {
      const board = createBoard();
      board[18] = Array(10).fill(1);
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({
        tSpin: { isTSpin: false, isTSpinMini: true },
      });

      const result = simulateClearResult(board, snapshot);

      expect(result.isTSpinMini).toBe(true);
      expect(result.cleared).toBe(2);
      expect(result.baseScore).toBe(400);
    });
  });

  // ==================== Back-to-Back ====================
  describe('Back-to-Back', () => {
    it('Tetris 接 Tetris 应该触发 Back-to-Back', () => {
      const board = createBoard();
      board[16] = Array(10).fill(1);
      board[17] = Array(10).fill(1);
      board[18] = Array(10).fill(1);
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({ backToBack: true });

      const result = simulateClearResult(board, snapshot);

      expect(result.isBackToBack).toBe(true);
      expect(result.clearScore).toBe(1200); // 800 × 1.5
    });

    it('第一次 Tetris 不应该触发 Back-to-Back', () => {
      const board = createBoard();
      board[16] = Array(10).fill(1);
      board[17] = Array(10).fill(1);
      board[18] = Array(10).fill(1);
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({ backToBack: false });

      const result = simulateClearResult(board, snapshot);

      expect(result.isBackToBack).toBe(false);
      expect(result.clearScore).toBe(800);
    });

    it('普通消行不触发 Back-to-Back', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({ backToBack: true });

      const result = simulateClearResult(board, snapshot);

      expect(result.isBackToBack).toBe(false);
      expect(result.clearScore).toBe(100);
    });

    it('T-Spin + Back-to-Back 正确叠加', () => {
      const board = createBoard();
      board[18] = Array(10).fill(1);
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({
        tSpin: { isTSpin: true, isTSpinMini: false },
        backToBack: true,
      });

      const result = simulateClearResult(board, snapshot);

      expect(result.isBackToBack).toBe(true);
      // T-Spin Double: 1200 × 1.5 = 1800
      expect(result.clearScore).toBe(1800);
    });
  });

  // ==================== Combo ====================
  describe('Combo', () => {
    it('首次消行 combo=1，不加分', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({ combo: 0 });

      const result = simulateClearResult(board, snapshot);

      expect(result.combo).toBe(1);
      expect(result.comboScore).toBe(0);
    });

    it('combo=2 时额外加 50', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({ combo: 1 });

      const result = simulateClearResult(board, snapshot);

      expect(result.combo).toBe(2);
      expect(result.comboScore).toBe(50);
      expect(result.clearScore).toBe(150); // 100 + 50
    });

    it('combo=4 时额外加 150', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({ combo: 3 });

      const result = simulateClearResult(board, snapshot);

      expect(result.combo).toBe(4);
      expect(result.comboScore).toBe(150);
      expect(result.clearScore).toBe(250); // 100 + 150
    });

    it('无消行时 combo 不增加', () => {
      const board = createBoard();
      const snapshot = createSnapshot({ combo: 5 });

      // 无消行且非 T-Spin → 返回 null，不更新 combo
      const result = simulateClearResult(board, snapshot);

      expect(result).toBeNull();
    });
  });

  // ==================== All Clear ====================
  describe('All Clear', () => {
    it('消行后棋盘全空应该标记 isAllClear=true', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot();

      // 传入 actualCleared=1，消行后棋盘检查：实际 board 不全空（有 1 行满尚未消除）
      // 需要模拟消行后的棋盘——这里传入空 board
      const emptyBoard = createBoard();
      const result = simulateClearResult(emptyBoard, snapshot, 1);

      expect(result.isAllClear).toBe(true);
      expect(result.allClearScore).toBe(2000);
      expect(result.clearScore).toBe(2100); // 100 + 2000
    });

    it('非全清时 isAllClear 为 false', () => {
      const board = createBoard();
      board[18] = Array(10).fill(1);
      board[19][0] = 1;
      const snapshot = createSnapshot();

      const result = simulateClearResult(board, snapshot, 1);

      expect(result.isAllClear).toBe(false);
      expect(result.allClearScore).toBe(0);
    });

    it('T-Spin 0 行即使棋盘全空也不算 All Clear', () => {
      const board = createBoard();
      const snapshot = createSnapshot({
        tSpin: { isTSpin: true, isTSpinMini: false },
      });

      // actualCleared=0, cleared===0, 所以 isAllClear=false
      const result = simulateClearResult(board, snapshot, 0);

      expect(result.isAllClear).toBe(false);
      expect(result.allClearScore).toBe(0);
      expect(result.clearScore).toBe(400);
    });
  });

  // ==================== 综合场景 ====================
  describe('综合场景', () => {
    it('T-Spin + Back-to-Back + Combo 叠加', () => {
      const board = createBoard();
      board[18] = Array(10).fill(1);
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot({
        tSpin: { isTSpin: true, isTSpinMini: false },
        backToBack: true,
        combo: 2,
      });

      const result = simulateClearResult(board, snapshot);

      expect(result.isTSpin).toBe(true);
      expect(result.isBackToBack).toBe(true);
      expect(result.combo).toBe(3);
      // T-Spin Double: 1200 × 1.5 + (3-1)×50 = 1800 + 100 = 1900
      expect(result.clearScore).toBe(1900);
    });

    it('isBigMove 判定正确', () => {
      // Tetris（4 行消除）
      const board1 = createBoard();
      board1[16] = Array(10).fill(1);
      board1[17] = Array(10).fill(1);
      board1[18] = Array(10).fill(1);
      board1[19] = Array(10).fill(1);
      expect(simulateClearResult(board1, createSnapshot()).isBigMove).toBe(
        true,
      );

      // T-Spin 消 0 行
      const board2 = createBoard();
      expect(
        simulateClearResult(
          board2,
          createSnapshot({ tSpin: { isTSpin: true, isTSpinMini: false } }),
        ).isBigMove,
      ).toBe(true);

      // T-Spin Mini
      expect(
        simulateClearResult(
          board2,
          createSnapshot({ tSpin: { isTSpin: false, isTSpinMini: true } }),
        ).isBigMove,
      ).toBe(true);

      // 普通消行（3 行）
      const board3 = createBoard();
      board3[17] = Array(10).fill(1);
      board3[18] = Array(10).fill(1);
      board3[19] = Array(10).fill(1);
      expect(simulateClearResult(board3, createSnapshot()).isBigMove).toBe(
        false,
      );
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('snapshot 中缺少字段时应使用默认值', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = {};

      const result = simulateClearResult(board, snapshot);

      expect(result).not.toBeNull();
      expect(result.combo).toBe(1);
      expect(result.isBackToBack).toBe(false);
    });

    it('清除 5 行应正确计分', () => {
      const board = createBoard();
      board[15] = Array(10).fill(1);
      board[16] = Array(10).fill(1);
      board[17] = Array(10).fill(1);
      board[18] = Array(10).fill(1);
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot();

      const result = simulateClearResult(board, snapshot);

      expect(result.cleared).toBe(5);
      expect(result.baseScore).toBe(1200);
    });

    it('snapshot.tSpin 为 null 时不应报错', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = { tSpin: null };

      const result = simulateClearResult(board, snapshot);

      expect(result).not.toBeNull();
      expect(result.isTSpin).toBe(false);
      expect(result.isTSpinMini).toBe(false);
    });

    it('snapshot.combo 为 undefined 时默认从 0 开始', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = { combo: undefined };

      const result = simulateClearResult(board, snapshot);

      expect(result.combo).toBe(1);
    });

    it('返回的对象应包含所有必要字段', () => {
      const board = createBoard();
      board[19] = Array(10).fill(1);
      const snapshot = createSnapshot();

      const result = simulateClearResult(board, snapshot);

      expect(result).toHaveProperty('cleared');
      expect(result).toHaveProperty('baseScore');
      expect(result).toHaveProperty('clearScore');
      expect(result).toHaveProperty('isTSpin');
      expect(result).toHaveProperty('isTSpinMini');
      expect(result).toHaveProperty('isBigMove');
      expect(result).toHaveProperty('isBackToBack');
      expect(result).toHaveProperty('isAllClear');
      expect(result).toHaveProperty('combo');
      expect(result).toHaveProperty('comboScore');
      expect(result).toHaveProperty('allClearScore');
    });
  });
});
