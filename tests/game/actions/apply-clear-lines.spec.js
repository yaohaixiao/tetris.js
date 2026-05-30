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

    baseBoard = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    );

    mockState = {
      board: baseBoard,
      clearLines: [],
      lines: 0,
      level: 1,
      score: 0,
      baseLines: 0,
      levelUpSteps: 10,
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
  });

  // ==================== 计分 ====================
  describe('计分（固定分 × newLevel）', () => {
    it('1 级消 1 行 = 100', () => {
      mockState.clearLines = [19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).score).toBe(100);
    });

    it('1 级消 4 行 = 800', () => {
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
      mockState.lines = 23; // totalLines=24, newLevel=floor(24/12)+1=3 > 2
      mockState.clearLines = [19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).levelUpSteps).toBe(14);
    });

    it('步长封顶 60', () => {
      mockState.level = 26;
      mockState.levelUpSteps = 58;
      mockState.lines = 1507; // totalLines=1508, newLevel=floor(1508/58)+1=27 > 26
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

  // ==================== 边界 ====================
  describe('边界', () => {
    it('clearLines 不存在时使用空数组', () => {
      delete mockState.clearLines;
      expect(() => applyClearLines(mockContext)).not.toThrow();
    });

    it('消除 5 行计分正确', () => {
      mockState.clearLines = [15, 16, 17, 18, 19];
      const { stateHandler } = applyClearLines(mockContext);
      expect(stateHandler(mockState).score).toBe(1200);
    });
  });
});
