import lock from '@/lib/game/logic/lock.js';
import detectTSpin from '@/lib/game/logic/rotate/t-spin.js';

jest.mock('@/lib/game/logic/rotate/t-spin.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({ isTSpin: false, isTSpinMini: false })),
}));

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
      Elements: {
        Canvas: { rows: 20, cols: 10 },
      },
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

    it('应该调用 detectTSpin 进行 T-Spin 检测', () => {
      lock(mockContext);

      expect(detectTSpin).toHaveBeenCalledWith(mockContext);
    });
  });

  // ==================== 方块写入棋盘 ====================
  describe('方块写入棋盘', () => {
    it('应该将方块颜色写入正确的位置', () => {
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

      expect(board[5][3]).toBe(0);
      expect(board[5][4]).toBe('#FFFF00');
      expect(board[5][5]).toBe(0);
      expect(board[6][3]).toBe('#FFFF00');
      expect(board[6][4]).toBe('#FFFF00');
      expect(board[6][5]).toBe('#FFFF00');
    });

    it('不应该修改原始 state.board', () => {
      const originalBoardSnapshot = JSON.stringify(mockState.board);

      lock(mockContext);

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

      expect(board[19][3]).toBe('#008080');
      expect(board[19][4]).toBe('#008080');
      expect(board[19][5]).toBe('#008080');
      expect(board[19][6]).toBe('#008080');
    });
  });

  // ==================== setState 调用 ====================
  describe('setState 调用', () => {
    it('应该用 board 和 tSpin 字段调用 setState', () => {
      lock(mockContext);

      const setStateArg = mockStore.setState.mock.calls[0][0];

      expect(setStateArg).toHaveProperty('board');
      expect(Array.isArray(setStateArg.board)).toBe(true);
      expect(setStateArg).toHaveProperty('tSpin');
      expect(setStateArg.tSpin).toEqual({ isTSpin: false, isTSpinMini: false });
    });

    it('应该只调用一次 setState', () => {
      lock(mockContext);

      expect(mockStore.setState).toHaveBeenCalledTimes(1);
    });

    it('shape 中值为 0 的格子不应该写入颜色', () => {
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

      // 值为 0 的位置保持原样
      expect(board[5][3]).toBe(0);
      expect(board[5][5]).toBe(0);
      // 值为 1 的位置正确写入
      expect(board[5][4]).toBe('#FFFF00');
      expect(board[6][3]).toBe('#FFFF00');
      expect(board[6][4]).toBe('#FFFF00');
      expect(board[6][5]).toBe('#FFFF00');
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

  // ==================== T-Spin 标记 ====================
  describe('T-Spin 标记', () => {
    it('锁定后应该清空 _lastAction', () => {
      mockState.curr._lastAction = 'rotate';

      lock(mockContext);

      expect(mockState.curr._lastAction).toBeNull();
    });

    it('_lastAction 不存在时清空也不应崩溃', () => {
      // 没有 _lastAction
      expect(() => lock(mockContext)).not.toThrow();
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

    it('空方块时不应写入任何颜色', () => {
      mockState.curr = {
        shape: [
          [0, 0],
          [0, 0],
        ],
        color: '#FFA500',
      };

      lock(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      const board = setStateCall.board;

      // 棋盘应保持原样（全 0）
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          expect(board[y][x]).toBe(0);
        }
      }
    });
  });
});
