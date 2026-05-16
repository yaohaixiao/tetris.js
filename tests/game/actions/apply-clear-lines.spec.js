import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';

jest.mock('@/lib/game/constants/game.js', () => ({
  __esModule: true,
  default: {
    CLEAR_LINE_SCORES: [0, 100, 300, 500, 800, 1200],
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
      lines: 10,
      level: 5,
      score: 1000,
      baseLines: 40,
    };

    mockStore = {
      getState: jest.fn().mockReturnValue(mockState),
    };

    mockContext = {
      Store: mockStore,
      Elements: {
        Main: {
          rows: 20,
          cols: 10,
        },
      },
      Level: {
        max: 15,
      },
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该调用 Store.getState 获取状态', () => {
      applyClearLines(mockContext);

      expect(mockStore.getState).toHaveBeenCalled();
    });

    it('应该返回包含 stateHandler、levelUp、level、isMaxOut 的对象', () => {
      const result = applyClearLines(mockContext);

      expect(result).toHaveProperty('stateHandler');
      expect(result).toHaveProperty('levelUp');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('isMaxOut');
    });

    it('stateHandler 应该是函数', () => {
      const result = applyClearLines(mockContext);

      expect(typeof result.stateHandler).toBe('function');
    });
  });

  // ==================== 消行逻辑 ====================
  describe('消行逻辑', () => {
    it('应该消除满行并在顶部补齐空行', () => {
      const board = structuredClone(baseBoard);
      board[19] = Array.from({ length: 10 }, () => '#FF0000');

      mockState.board = board;
      mockState.clearLines = [19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
    });

    it('应该消除多行满行', () => {
      const board = structuredClone(baseBoard);
      board[18] = Array.from({ length: 10 }, () => '#FF0000');
      board[19] = Array.from({ length: 10 }, () => '#00FF00');

      mockState.board = board;
      mockState.clearLines = [18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      expect(newState.board[1].every((cell) => cell === 0)).toBe(true);
    });

    it('只消除 board[y].every(Boolean) 为 true 的行', () => {
      const board = structuredClone(baseBoard);
      board[19] = Array.from({ length: 10 }, () => '#FF0000');
      board[18][5] = 0;

      mockState.board = board;
      mockState.clearLines = [18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      // 只消除第 19 行（真正满的）
      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      // 第 18 行（不满）保留，下移到了 19
      expect(newState.board[19][5]).toBe(0);
    });

    it('不应该修改原始 state.board（structuredClone）', () => {
      const board = structuredClone(baseBoard);
      board[19] = Array.from({ length: 10 }, () => '#FF0000');

      mockState.board = board;
      mockState.clearLines = [19];

      const originalBoardSnapshot = JSON.stringify(mockState.board);

      applyClearLines(mockContext);

      expect(JSON.stringify(mockState.board)).toBe(originalBoardSnapshot);
    });
  });

  // ==================== 状态更新 ====================
  describe('状态更新', () => {
    it('应该更新 lines 为累加消除行数', () => {
      mockState.lines = 10;
      mockState.clearLines = [19, 18, 17];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.lines).toBe(13);
    });

    it('应该更新 score 根据消除行数加分', () => {
      mockState.clearLines = [19, 18];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(1300);
    });

    it('消除 1 行应该加 100 分', () => {
      mockState.clearLines = [19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(1100);
    });

    it('消除 3 行应该加 500 分', () => {
      mockState.clearLines = [17, 18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(1500);
    });

    it('消除 4 行应该加 800 分', () => {
      mockState.clearLines = [16, 17, 18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(1800);
    });

    it('消除 0 行应该加 0 分', () => {
      mockState.clearLines = [];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(1000);
    });

    it('应该清空 clearLines', () => {
      mockState.clearLines = [19, 18];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.clearLines).toEqual([]);
    });
  });

  // ==================== 等级计算 ====================
  describe('等级计算', () => {
    it('应该根据总行数计算等级', () => {
      mockState.clearLines = [];

      const result = applyClearLines(mockContext);

      // totalLines = 40 + 10 = 50, newLevel = floor(50/10) + 1 = 6
      expect(result.level).toBe(6);
    });

    it('levelUp 在等级上升时为 true', () => {
      mockState.clearLines = [];

      const result = applyClearLines(mockContext);

      // newLevel=6 > state.level=5, isMaxOut=false → levelUp=true
      expect(result.levelUp).toBe(true);
    });

    it('levelUp 在等级不变时为 false', () => {
      mockState.clearLines = [];
      mockState.baseLines = 0;
      mockState.lines = 10;

      const result = applyClearLines(mockContext);

      // totalLines=10, newLevel=2, state.level=5 → newLevel 不大于 level
      expect(result.levelUp).toBe(false);
    });

    it('达到最大等级时 isMaxOut 为 true', () => {
      mockState.clearLines = [19];
      mockState.lines = 150;
      mockState.baseLines = 0;
      mockState.level = 15;

      const result = applyClearLines(mockContext);

      // totalLines = 151, newLevel = 16 > max=15
      expect(result.isMaxOut).toBe(true);
      expect(result.level).toBe(15);
    });

    it('达到最大等级时 levelUp 为 false', () => {
      mockState.lines = 200;
      mockState.baseLines = 0;
      mockState.level = 15;

      const result = applyClearLines(mockContext);

      expect(result.levelUp).toBe(false);
      expect(result.isMaxOut).toBe(true);
    });

    it('stateHandler 中 level 应该不超过 max', () => {
      mockState.lines = 200;
      mockState.baseLines = 0;
      mockState.level = 15;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.level).toBe(15);
    });

    it('stateHandler 中 level 不应该低于原级别', () => {
      mockState.clearLines = [];
      mockState.baseLines = 0;
      mockState.lines = 0;
      mockState.level = 5;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      // Math.max(5, 1) = 5
      expect(newState.level).toBe(5);
    });
  });

  // ==================== board 消行算法验证 ====================
  describe('board 消行算法验证', () => {
    it('满行被移除后上面所有行应下移', () => {
      const board = structuredClone(baseBoard);
      // 第 10 行：满行
      board[10] = Array.from({ length: 10 }, () => '#FF0000');
      // 第 5 行：标记行，留一个空位防止被判定为满行
      board[5] = Array.from({ length: 10 }, () => 'above');
      board[5][9] = 0;
      // 第 15 行：标记行
      board[15] = Array.from({ length: 10 }, () => 'below');
      board[15][9] = 0;

      mockState.board = board;
      mockState.clearLines = [10];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      // 顶部新增一行 0
      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);

      // 验证 'above' 行还在
      const aboveRow = newState.board.findIndex((row) => row[0] === 'above');
      expect(aboveRow).not.toBe(-1);
      expect(aboveRow).toBeGreaterThan(5);

      // 验证 'below' 行也在
      const belowRow = newState.board.findIndex((row) => row[0] === 'below');
      expect(belowRow).not.toBe(-1);
    });

    it('多个满行不连续时应该分别消除', () => {
      const board = structuredClone(baseBoard);
      board[5] = Array.from({ length: 10 }, () => '#FF0000');
      board[15] = Array.from({ length: 10 }, () => '#00FF00');

      mockState.board = board;
      mockState.clearLines = [5, 15];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      expect(newState.board[1].every((cell) => cell === 0)).toBe(true);
    });

    it('连续满行时从底部遍历正确消除', () => {
      const board = structuredClone(baseBoard);
      board[18] = Array.from({ length: 10 }, () => '#FF0000');
      board[19] = Array.from({ length: 10 }, () => '#00FF00');

      mockState.board = board;
      mockState.clearLines = [18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      expect(newState.board[1].every((cell) => cell === 0)).toBe(true);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('clearLines 为空时正常工作', () => {
      mockState.clearLines = [];

      const result = applyClearLines(mockContext);

      // totalLines = 40 + 10 = 50, newLevel = 6 > 5 → levelUp
      expect(result.levelUp).toBe(true);
      expect(result.stateHandler(mockState).score).toBe(1000);
    });

    it('clearLines 不存在时使用空数组', () => {
      delete mockState.clearLines;

      const result = applyClearLines(mockContext);

      expect(result.levelUp).toBe(true);
    });

    it('消除 5 行应该加 1200 分', () => {
      mockState.clearLines = [15, 16, 17, 18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(2200);
    });
  });
});
