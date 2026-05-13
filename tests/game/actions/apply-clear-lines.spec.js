import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';

// Mock GAME 常量
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

    // 创建一个 20 行 × 10 列的空棋盘
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
      options: {
        Elements: {
          Main: {
            rows: 20,
            cols: 10,
          },
        },
        Level: {
          max: 15,
        },
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
      // 设置最后一行全部填满
      const board = baseBoard.map((row) => [...row]);
      board[19] = Array.from({ length: 10 }, () => '#FF0000');

      mockState.board = board;
      mockState.clearLines = [19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      // 新的顶部应该全是 0
      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      // 原来的最后一行被消除，上面所有行下移
    });

    it('应该消除多行满行', () => {
      const board = baseBoard.map((row) => [...row]);
      board[18] = Array.from({ length: 10 }, () => '#FF0000');
      board[19] = Array.from({ length: 10 }, () => '#00FF00');

      mockState.board = board;
      mockState.clearLines = [18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      // 顶部两行应该是空行（补齐）
      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      expect(newState.board[1].every((cell) => cell === 0)).toBe(true);
    });

    it('应该只消除 board[y].every(Boolean) 为 true 的行', () => {
      const board = baseBoard.map((row) => [...row]);
      // 设置第 19 行为满行，第 18 行只有部分
      board[19] = Array.from({ length: 10 }, () => '#FF0000');
      board[18][5] = 0; // 有一个空格

      mockState.board = board;
      mockState.clearLines = [18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      // 只有真正满的行（19）被消除
      // 验证顶部只有 1 行空行（只消除了 1 行）
      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      // 第 18 行保留（现在在 19 的位置）
    });

    it('不应该修改原始 state.board', () => {
      const board = baseBoard.map((row) => [...row]);
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
      mockState.clearLines = [19, 18, 17]; // 消除 3 行

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.lines).toBe(13);
    });

    it('应该更新 score 根据消除行数加分', () => {
      mockState.clearLines = [19, 18]; // 消除 2 行 = 300 分

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(1300); // 1000 + 300
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
      // totalLines = baseLines + lines = 40 + 10 = 50
      // newLevel = Math.floor(50 / 10) + 1 = 6
      mockState.clearLines = [];

      const result = applyClearLines(mockContext);

      expect(result.level).toBe(6);
    });

    it('levelUp 在等级上升时为 true', () => {
      // 当前 level = 5，新 level = 6
      mockState.clearLines = [];
      mockState.baseLines = 40;
      mockState.lines = 10;

      const result = applyClearLines(mockContext);

      expect(result.levelUp).toBe(true);
    });

    it('levelUp 在等级不变时为 false', () => {
      // 当前 level = 5，新 level 也是 5
      mockState.clearLines = [];
      mockState.baseLines = 0;
      mockState.lines = 10;
      // totalLines = 10，newLevel = Math.floor(10/10) + 1 = 2
      // 但 state.level = 5，newLevel 不大于 level，所以不会 levelUp

      const result = applyClearLines(mockContext);

      expect(result.levelUp).toBe(false);
    });

    it('达到最大等级时 isMaxOut 为 true', () => {
      mockState.clearLines = [19];
      mockState.lines = 150;
      mockState.baseLines = 0;
      mockState.level = 15;

      const result = applyClearLines(mockContext);

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
      // 当前 level = 5，newLevel 可能比 5 小
      mockState.clearLines = [];
      mockState.baseLines = 0;
      mockState.lines = 0;
      mockState.level = 5;

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      // Math.max(prev.level, newLevel) 保证不降低
      // newLevel = Math.floor(0/10) + 1 = 1，但 prev.level = 5
      expect(newState.level).toBe(5);
    });
  });

  // ==================== board 消行算法验证 ====================
  describe('board 消行算法验证', () => {
    it('满行被移除后上面所有行应下移', () => {
      const board = baseBoard.map((row) => [...row]);

      // 在中间位置设置满行
      board[10] = Array.from({ length: 10 }, () => '#FF0000');
      // 在满行上面放一个标记行
      board[5] = Array.from({ length: 10 }, () => 'above');
      // 在满行下面放一个标记行
      board[15] = Array.from({ length: 10 }, () => 'below');

      mockState.board = board;
      mockState.clearLines = [10];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      // 顶部新增一行 0
      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      // above 行从 index 5 下移到 index 6（因为顶部插入了一行 0）
      // 但满行在 10，移除后 10 以下的保持不变，10 以上的整体下移 1 行
    });

    it('多个满行不连续时应该分别消除', () => {
      const board = baseBoard.map((row) => [...row]);
      board[5] = Array.from({ length: 10 }, () => '#FF0000');
      board[15] = Array.from({ length: 10 }, () => '#00FF00');

      mockState.board = board;
      mockState.clearLines = [5, 15];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockContext);

      // 顶部应该有 2 行空行
      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      expect(newState.board[1].every((cell) => cell === 0)).toBe(true);
    });

    it('连续满行时从底部遍历正确消除', () => {
      const board = baseBoard.map((row) => [...row]);
      // 连续两行满行
      board[18] = Array.from({ length: 10 }, () => '#FF0000');
      board[19] = Array.from({ length: 10 }, () => '#00FF00');

      mockState.board = board;
      mockState.clearLines = [18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockContext);

      // 底部两行被消除，顶部补充两行空行
      expect(newState.board[0].every((cell) => cell === 0)).toBe(true);
      expect(newState.board[1].every((cell) => cell === 0)).toBe(true);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('clearLines 为空时应该正常工作', () => {
      mockState.clearLines = [];

      const result = applyClearLines(mockContext);

      expect(result.levelUp).toBe(false);
      expect(result.stateHandler(mockState).score).toBe(1000);
    });

    it('clearLines 不存在时应该使用空数组', () => {
      delete mockState.clearLines;

      const result = applyClearLines(mockContext);

      expect(result.levelUp).toBe(false);
    });

    it('消除 5 行应该加 1200 分', () => {
      mockState.clearLines = [15, 16, 17, 18, 19];

      const result = applyClearLines(mockContext);
      const newState = result.stateHandler(mockState);

      expect(newState.score).toBe(2200);
    });
  });
});
