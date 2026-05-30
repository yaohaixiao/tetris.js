import findFullLines from '@/lib/game/logic/find-full-lines';

describe('findFullLines', () => {
  let mockContext;
  let mockStore;
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();

    // 创建 20行 × 10列 的空棋盘（全为 0）
    const emptyBoard = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    );

    mockState = {
      board: emptyBoard,
    };

    mockStore = {
      getState: jest.fn().mockReturnValue(mockState),
    };

    mockContext = {
      Store: mockStore,
      Elements: {
        Canvas: {
          rows: 20,
        },
      },
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该调用 Store.getState 获取状态', () => {
      findFullLines(mockContext);

      expect(mockStore.getState).toHaveBeenCalled();
    });

    it('应该返回数组', () => {
      const result = findFullLines(mockContext);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ==================== 满行检测 ====================
  describe('满行检测', () => {
    it('有满行时应该返回对应行号', () => {
      mockState.board[19] = Array.from({ length: 10 }, () => '#FF0000');

      const result = findFullLines(mockContext);

      expect(result).toEqual([19]);
    });

    it('应该返回所有满行号', () => {
      mockState.board[17] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board[18] = Array.from({ length: 10 }, () => '#00FF00');
      mockState.board[19] = Array.from({ length: 10 }, () => '#0000FF');

      const result = findFullLines(mockContext);

      expect(result).toEqual([19, 18, 17]);
    });

    it('没有满行时应该返回空数组', () => {
      const result = findFullLines(mockContext);

      expect(result).toEqual([]);
    });

    it('部分填充的行不应该被识别为满行', () => {
      const row = Array.from({ length: 10 }, () => '#FF0000');
      row[5] = 0;
      mockState.board[19] = row;

      const result = findFullLines(mockContext);

      expect(result).toEqual([]);
    });
  });

  // ==================== 从底部向上遍历 ====================
  describe('从底部向上遍历', () => {
    it('应该按从底部到顶部的顺序返回行号', () => {
      mockState.board[0] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board[10] = Array.from({ length: 10 }, () => '#00FF00');
      mockState.board[19] = Array.from({ length: 10 }, () => '#0000FF');

      const result = findFullLines(mockContext);

      expect(result).toEqual([19, 10, 0]);
    });

    it('满行不连续时应该正确收集', () => {
      mockState.board[5] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board[15] = Array.from({ length: 10 }, () => '#00FF00');

      const result = findFullLines(mockContext);

      expect(result).toEqual([15, 5]);
    });
  });

  // ==================== every 判满逻辑 ====================
  describe('every 判满逻辑', () => {
    it('所有格子都有真值应该判定为满行', () => {
      mockState.board[19] = Array.from({ length: 10 }, () => 'non-empty');

      const result = findFullLines(mockContext);

      expect(result).toEqual([19]);
    });

    it('有一个格子为 0 就不判定为满行', () => {
      mockState.board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board[19][0] = 0;

      const result = findFullLines(mockContext);

      expect(result).toEqual([]);
    });

    it('有一个格子为空字符串就不判定为满行', () => {
      mockState.board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board[19][3] = '';

      const result = findFullLines(mockContext);

      expect(result).toEqual([]);
    });

    it('有一个格子为 null 就不判定为满行', () => {
      mockState.board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board[19][7] = null;

      const result = findFullLines(mockContext);

      expect(result).toEqual([]);
    });

    it('有一个格子为 undefined 就不判定为满行', () => {
      mockState.board[19] = Array.from({ length: 10 }, () => '#FF0000');
      mockState.board[19][2] = undefined;

      const result = findFullLines(mockContext);

      expect(result).toEqual([]);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('空棋盘时应该返回空数组', () => {
      const result = findFullLines(mockContext);

      expect(result).toEqual([]);
    });

    it('棋盘只有 1 行时应该正常检测', () => {
      mockContext.Elements.Canvas.rows = 1;
      mockState.board = [Array.from({ length: 10 }, () => '#FF0000')];

      const result = findFullLines(mockContext);

      expect(result).toEqual([0]);
    });

    it('棋盘所有行都是满行时应该返回所有行号', () => {
      mockState.board = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => '#FF0000'),
      );

      const result = findFullLines(mockContext);

      expect(result).toHaveLength(20);
      expect(result[0]).toBe(19);
      expect(result[19]).toBe(0);
    });

    it('board 行宽度为 0 时 every 返回 true', () => {
      mockContext.Elements.Canvas.rows = 1;
      mockState.board = [[]];

      const result = findFullLines(mockContext);

      expect(result).toEqual([0]);
    });
  });
});
