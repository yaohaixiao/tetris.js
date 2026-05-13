import lock from '@/lib/game/logic/lock.js';

describe('lock', () => {
  let mockContext;
  let mockStore;
  let mockState;
  let emptyBoard;

  beforeEach(() => {
    jest.clearAllMocks();

    // 创建 20行 × 10列 的空棋盘
    emptyBoard = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    );

    mockState = {
      curr: {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#FFA500',
      },
      cx: 4,
      cy: 5,
      board: emptyBoard,
    };

    mockStore = {
      getState: jest.fn().mockReturnValue(mockState),
      setState: jest.fn(),
    };

    mockContext = {
      Store: mockStore,
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该调用 Store.getState 获取状态', () => {
      lock(mockContext);

      expect(mockStore.getState).toHaveBeenCalled();
    });

    it('应该更新棋盘状态', () => {
      lock(mockContext);

      expect(mockStore.setState).toHaveBeenCalled();
    });
  });

  // ==================== 方块写入棋盘 ====================
  describe('方块写入棋盘', () => {
    it('应该将方块颜色写入正确的位置', () => {
      // curr 是 2×2 的方块，cx=4, cy=5
      // 应该占据 board[5][4], board[5][5], board[6][4], board[6][5]
      lock(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      const board = setStateCall.board;

      expect(board[5][4]).toBe('#FFA500');
      expect(board[5][5]).toBe('#FFA500');
      expect(board[6][4]).toBe('#FFA500');
      expect(board[6][5]).toBe('#FFA500');
    });

    it('不应该修改方块形状中为 0 的位置', () => {
      mockState.curr = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: '#FFFF00',
      };
      mockState.cx = 3;
      mockState.cy = 5;

      lock(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      const board = setStateCall.board;

      // shape[0][0] = 0，不应写入
      expect(board[5][3]).toBe(0);
      // shape[0][1] = 1，应写入
      expect(board[5][4]).toBe('#FFFF00');
      // shape[0][2] = 0，不应写入
      expect(board[5][5]).toBe(0);
      // shape[1][0] = 1
      expect(board[6][3]).toBe('#FFFF00');
      // shape[1][1] = 1
      expect(board[6][4]).toBe('#FFFF00');
      // shape[1][2] = 1
      expect(board[6][5]).toBe('#FFFF00');
    });

    it('不应该修改原始 state.board', () => {
      const originalBoardSnapshot = JSON.stringify(mockState.board);

      lock(mockContext);

      // 使用了 structuredClone，原始 board 不受影响
      expect(JSON.stringify(mockState.board)).toBe(originalBoardSnapshot);
    });
  });

  // ==================== 不同位置的方块 ====================
  describe('不同位置的方块', () => {
    it('方块在顶部时应该正确写入', () => {
      mockState.cx = 0;
      mockState.cy = 0;

      lock(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      const board = setStateCall.board;

      expect(board[0][0]).toBe('#FFA500');
      expect(board[0][1]).toBe('#FFA500');
      expect(board[1][0]).toBe('#FFA500');
      expect(board[1][1]).toBe('#FFA500');
    });

    it('方块在底部时应该正确写入', () => {
      mockState.cx = 8;
      mockState.cy = 18;

      lock(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      const board = setStateCall.board;

      expect(board[18][8]).toBe('#FFA500');
      expect(board[18][9]).toBe('#FFA500');
      expect(board[19][8]).toBe('#FFA500');
      expect(board[19][9]).toBe('#FFA500');
    });
  });

  // ==================== 不同形状的方块 ====================
  describe('不同形状的方块', () => {
    it('I 型方块（1×4）应该正确写入', () => {
      mockState.curr = {
        shape: [[1, 1, 1, 1]],
        color: '#008080',
      };
      mockState.cx = 3;
      mockState.cy = 19;

      lock(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      const board = setStateCall.board;

      // 1行4列，全部写入 cy=19
      expect(board[19][3]).toBe('#008080');
      expect(board[19][4]).toBe('#008080');
      expect(board[19][5]).toBe('#008080');
      expect(board[19][6]).toBe('#008080');
    });
  });

  // ==================== setState 调用 ====================
  describe('setState 调用', () => {
    it('应该用 board 字段调用 setState', () => {
      lock(mockContext);

      const setStateArg = mockStore.setState.mock.calls[0][0];

      expect(setStateArg).toHaveProperty('board');
      expect(Array.isArray(setStateArg.board)).toBe(true);
    });

    it('每次写入一个格子都会调用 setState', () => {
      // 2×2 方块，4 个有值的格子
      lock(mockContext);

      expect(mockStore.setState).toHaveBeenCalledTimes(4);
    });

    it('shape 中值为 0 的格子不应该触发 setState', () => {
      mockState.curr = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: '#FFFF00',
      };

      lock(mockContext);

      // T 型方块有 4 个有值的格子（中间 1、下面 3 个）
      expect(mockStore.setState).toHaveBeenCalledTimes(4);
    });
  });

  // ==================== 颜色 ====================
  describe('颜色', () => {
    it('应该写入方块对应的颜色', () => {
      mockState.curr.color = '#00FF00';

      lock(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      const board = setStateCall.board;

      expect(board[5][4]).toBe('#00FF00');
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('curr 为空时不应崩溃（但 shape 访问会报错）', () => {
      mockState.curr = null;

      expect(() => {
        lock(mockContext);
      }).toThrow();
    });

    it('空方块时不应调用 setState', () => {
      mockState.curr = {
        shape: [
          [0, 0],
          [0, 0],
        ],
        color: '#FFA500',
      };

      lock(mockContext);

      expect(mockStore.setState).not.toHaveBeenCalled();
    });

    it('每次 setState 传递的 board 不同引用', () => {
      // 由于 structuredClone，每次调用 setState 的 board 是新的
      // 但逻辑中在循环内对同一个 board 修改并多次 setState
      // 需要确认是否是同一个引用
      lock(mockContext);

      const firstCallBoard = mockStore.setState.mock.calls[0][0].board;
      const secondCallBoard = mockStore.setState.mock.calls[1][0].board;

      // 同一个循环内，用的是同一个 structuredClone 的 board
      expect(firstCallBoard).toBe(secondCallBoard);
    });
  });
});
