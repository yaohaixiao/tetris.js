import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';

jest.mock('@/lib/game/constants/game.js', () => ({
  __esModule: true,
  default: {
    CLEAR_LINE_SCORES: [0, 100, 300, 500, 800, 1200],
    MAX_LEVEL: 256,
  },
}));

describe('applyClearLines', () => {
  let mockContext;
  let mockStore;
  let mockState;
  let baseBoard;

  beforeEach(() => {
    jest.clearAllMocks();

    // 底部有 2 行方块，消 1 行不会 All Clear
    baseBoard = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    );
    for (let x = 0; x < 10; x++) {
      baseBoard[18][x] = '#0000FF';
      baseBoard[19][x] = '#FF0000';
    }

    mockState = {
      board: baseBoard,
      clearLines: [],
      lines: 0,
      level: 1,
      score: 0,
      baseLines: 0,
      levelUpSteps: 10,
      backToBack: false,
      tSpin: null,
      combo: 0,
    };

    mockStore = {
      getState: jest.fn().mockReturnValue(mockState),
    };

    mockContext = {
      Store: mockStore,
      Elements: {
        Canvas: {
          rows: 20,
          cols: 10,
        },
      },
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应返回 stateHandler、levelUp、level、isMaxOut', () => {
      const result = applyClearLines(mockContext);
      expect(result).toHaveProperty('stateHandler');
      expect(result).toHaveProperty('levelUp');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('isMaxOut');
    });

    it('stateHandler 应该是函数', () => {
      expect(typeof applyClearLines(mockContext).stateHandler).toBe('function');
    });

    it('应该返回 isBackToBack 字段', () => {
      const result = applyClearLines(mockContext);
      expect(result).toHaveProperty('isBackToBack');
      expect(typeof result.isBackToBack).toBe('boolean');
    });

    it('应该返回 isAllClear 字段', () => {
      const result = applyClearLines(mockContext);
      expect(result).toHaveProperty('isAllClear');
      expect(typeof result.isAllClear).toBe('boolean');
    });
  });

  // ==================== 计分 ====================
  describe('计分（固定分 × newLevel）', () => {
    it('1 级消 1 行 = 100', () => {
      mockState.clearLines = [19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).score).toBe(100);
    });

    it('1 级消 4 行 = 800', () => {
      // 消 4 行后棋盘还剩第15行，不全空
      const board = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board[15][x] = '#888888';
      mockState.board = board;
      mockState.clearLines = [16, 17, 18, 19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).score).toBe(800);
    });

    it('升级当次按新等级计分', () => {
      mockState.lines = 9;
      mockState.clearLines = [19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).score).toBe(200);
    });

    it('分数累加', () => {
      mockState.score = 500;
      mockState.clearLines = [19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).score).toBe(600);
    });
  });

  // ==================== 升级 ====================
  describe('升级（步长 +2，封顶 60）', () => {
    it('初始 10 行升一级', () => {
      mockState.lines = 9;
      mockState.clearLines = [19];
      const result = applyClearLines(mockContext);
      expect(result.levelUp).toBe(true);
      expect(result.level).toBe(2);
    });

    it('不够行数不升级', () => {
      mockState.lines = 8;
      mockState.clearLines = [];
      const result = applyClearLines(mockContext);
      expect(result.levelUp).toBe(false);
      expect(result.level).toBe(1);
    });

    it('升级后 levelUpSteps += 2', () => {
      mockState.lines = 9;
      mockState.clearLines = [19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).levelUpSteps).toBe(12);
    });

    it('连续升级步长累计正确', () => {
      mockState.level = 2;
      mockState.levelUpSteps = 12;
      mockState.lines = 23;
      mockState.clearLines = [19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).levelUpSteps).toBe(14);
    });

    it('步长封顶 60', () => {
      mockState.level = 26;
      mockState.levelUpSteps = 58;
      mockState.lines = 1507;
      mockState.clearLines = [19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).levelUpSteps).toBe(60);
    });

    it('已达 60 不再增长', () => {
      mockState.level = 30;
      mockState.levelUpSteps = 60;
      mockState.lines = 1799;
      mockState.clearLines = [19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).levelUpSteps).toBe(60);
    });

    it('不升级时 levelUpSteps 不变', () => {
      mockState.clearLines = [];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).levelUpSteps).toBe(10);
    });
  });

  // ==================== MAX_LEVEL ====================
  describe('MAX_LEVEL', () => {
    it('达到 256 时 isMaxOut=true', () => {
      mockState.level = 255;
      mockState.levelUpSteps = 60;
      mockState.lines = 15359;
      mockState.clearLines = [19];
      const result = applyClearLines(mockContext);
      expect(result.isMaxOut).toBe(true);
      expect(result.level).toBe(256);
    });

    it('已是 256 级时不再升级', () => {
      mockState.level = 256;
      mockState.levelUpSteps = 60;
      mockState.lines = 20000;
      mockState.clearLines = [19];
      const result = applyClearLines(mockContext);
      expect(result.levelUp).toBe(false);
      expect(result.isMaxOut).toBe(true);
    });
  });

  // ==================== 消行 ====================
  describe('消行', () => {
    it('消除满行顶部补空行', () => {
      const board = structuredClone(baseBoard);
      board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board = board;
      mockState.clearLines = [19];

      const { stateHandler } = applyClearLines(mockContext);
      const newState = stateHandler(mockState);
      expect(newState.board[0].every((c) => c === 0)).toBe(true);
    });

    it('不修改原始 board', () => {
      const board = structuredClone(baseBoard);
      board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board = board;
      mockState.clearLines = [19];

      const snapshot = JSON.stringify(mockState.board);
      applyClearLines(mockContext);
      expect(JSON.stringify(mockState.board)).toBe(snapshot);
    });

    it('清空 clearLines', () => {
      mockState.clearLines = [19, 18];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).clearLines).toEqual([]);
    });
  });

  // ==================== Back-to-Back ====================
  describe('Back-to-Back', () => {
    it('第一次 Tetris 不触发 Back-to-Back（×1.0）', () => {
      const board = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board[15][x] = '#888888';
      mockState.board = board;
      mockState.clearLines = [16, 17, 18, 19];
      mockState.backToBack = false;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(result.isBackToBack).toBe(false);
      expect(newState.score).toBe(800);
      expect(newState.backToBack).toBe(true);
    });

    it('连续两次 Tetris 触发 Back-to-Back（×1.5）', () => {
      const board = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board[15][x] = '#888888';
      mockState.board = board;
      mockState.clearLines = [16, 17, 18, 19];
      mockState.backToBack = true;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(result.isBackToBack).toBe(true);
      expect(newState.score).toBe(1200);
      expect(newState.backToBack).toBe(true);
    });

    it('普通消行中断 Back-to-Back（×1.0）', () => {
      mockState.clearLines = [19];
      mockState.backToBack = true;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(result.isBackToBack).toBe(false);
      expect(newState.score).toBe(100);
      expect(newState.backToBack).toBe(false);
    });

    it('Tetris 后接普通消行再 Tetris 不触发 B2B', () => {
      const board1 = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board1[15][x] = '#888888';
      mockState.board = board1;
      mockState.clearLines = [16, 17, 18, 19];
      mockState.backToBack = false;
      let result = applyClearLines(mockContext);
      let newState = result.stateHandler(mockState);
      expect(newState.backToBack).toBe(true);

      mockState.backToBack = true;
      mockState.clearLines = [19];
      mockState.score = newState.score;
      result = applyClearLines(mockContext);
      newState = result.stateHandler(mockState);
      expect(result.isBackToBack).toBe(false);
      expect(newState.backToBack).toBe(false);

      const board2 = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board2[15][x] = '#888888';
      mockState.board = board2;
      mockState.backToBack = false;
      mockState.clearLines = [16, 17, 18, 19];
      mockState.score = newState.score;
      result = applyClearLines(mockContext);
      newState = result.stateHandler(mockState);
      expect(result.isBackToBack).toBe(false);
      expect(newState.backToBack).toBe(true);
    });

    // T-Spin 触发 Back-to-Back — 消 18,19 行，加第 16 行保底
    it('T-Spin 触发 Back-to-Back', () => {
      const board = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board[16][x] = '#888888';
      mockState.board = board;
      mockState.clearLines = [18, 19];
      mockState.tSpin = { isTSpin: true, isTSpinMini: false };
      mockState.backToBack = true;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(result.isBackToBack).toBe(true);
      expect(newState.score).toBe(1800);
    });

    it('T-Spin Mini 也视为大招', () => {
      mockState.clearLines = [19];
      mockState.tSpin = { isTSpin: false, isTSpinMini: true };
      mockState.backToBack = true;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(result.isBackToBack).toBe(true);
      expect(newState.score).toBe(300);
    });

    it('消 5 行（I5）视为大招触发 Back-to-Back', () => {
      const board = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board[14][x] = '#888888';
      mockState.board = board;
      mockState.clearLines = [15, 16, 17, 18, 19];
      mockState.backToBack = true;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(result.isBackToBack).toBe(true);
      expect(newState.score).toBe(1800);
    });

    // 消 3 行不视为大招，中断 Back-to-Back — 消 17,18,19 行，加第 15 行保底
    it('消 3 行不视为大招，中断 Back-to-Back', () => {
      const board = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board[15][x] = '#888888';
      mockState.board = board;
      mockState.clearLines = [17, 18, 19];
      mockState.backToBack = true;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(result.isBackToBack).toBe(false);
      expect(newState.score).toBe(500);
      expect(newState.backToBack).toBe(false);
    });

    it('Combo 加分不受 Back-to-Back 影响', () => {
      const board = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board[15][x] = '#888888';
      mockState.board = board;
      mockState.clearLines = [16, 17, 18, 19];
      mockState.backToBack = true;
      mockState.combo = 2;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(1300);
    });

    it('Back-to-Back ×1.5 后向下取整', () => {
      mockState.clearLines = [];
      mockState.tSpin = { isTSpin: false, isTSpinMini: true };
      mockState.backToBack = true;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(150);
    });
  });

  // ==================== All Clear ====================
  describe('All Clear', () => {
    it('消行后棋盘全空应该加 2000 分', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board = board;
      mockState.clearLines = [19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(result.isAllClear).toBe(true);
      expect(newState.score).toBe(2100);
    });

    it('非全清时 isAllClear 为 false', () => {
      mockState.clearLines = [19];

      const result = applyClearLines(mockContext);

      expect(result.isAllClear).toBe(false);
    });

    it('无消行时不应触发 All Clear', () => {
      mockState.clearLines = [];

      const result = applyClearLines(mockContext);

      expect(result.isAllClear).toBe(false);
    });

    it('All Clear + Combo 加分正确叠加', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board = board;
      mockState.clearLines = [19];
      mockState.combo = 2;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(2200);
    });

    it('All Clear + Back-to-Back 不叠加', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board = board;
      mockState.clearLines = [19];
      mockState.backToBack = true;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(result.isBackToBack).toBe(false);
      expect(newState.score).toBe(2100);
    });

    it('All Clear 后棋盘应为全空', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board = board;
      mockState.clearLines = [19];

      const { stateHandler } = applyClearLines(mockContext);
      const newState = stateHandler(mockState);

      expect(
        newState.board.every((row) => row.every((cell) => cell === 0)),
      ).toBe(true);
    });
  });

  // ==================== 边界 ====================
  describe('边界', () => {
    it('clearLines 不存在时使用空数组', () => {
      delete mockState.clearLines;
      expect(() => applyClearLines(mockContext)).not.toThrow();
    });

    it('消除 5 行计分正确', () => {
      const board = structuredClone(baseBoard);
      for (let x = 0; x < 10; x++) board[14][x] = '#888888';
      mockState.board = board;
      mockState.clearLines = [15, 16, 17, 18, 19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).score).toBe(1200);
    });
  });
});
