import clearLines from '@/lib/game/logic/clear-lines.js';
import findFullLines from '@/lib/game/logic/find-full-lines.js';

// Mock 依赖
jest.mock('@/lib/game/logic/find-full-lines.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('clearLines', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      setClearLines: jest.fn(),
      setState: jest.fn(),
    };

    mockContext = {
      id: 'test-game-uuid',
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 有满行时 ====================
  describe('有满行时', () => {
    it('应该调用 findFullLines 获取满行', () => {
      findFullLines.mockReturnValue([5, 10, 15]);

      clearLines(mockContext);

      expect(findFullLines).toHaveBeenCalledWith(mockContext);
    });

    it('应该将满行设置到 Store', () => {
      const linesToClear = [3, 7, 12];
      findFullLines.mockReturnValue(linesToClear);

      clearLines(mockContext);

      expect(mockStore.setClearLines).toHaveBeenCalledWith(linesToClear);
    });

    it('应该发送清除行动画事件', () => {
      const linesToClear = [5, 10, 15];
      findFullLines.mockReturnValue(linesToClear);

      clearLines(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:test-game-uuid:start:clear:lines',
        { linesToClear },
      );
    });

    it('应该传递正确的 id', () => {
      mockContext.id = 'custom-id';
      findFullLines.mockReturnValue([1]);

      clearLines(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:custom-id:start:clear:lines',
        { linesToClear: [1] },
      );
    });
  });

  // ==================== 无满行时 ====================
  describe('无满行时', () => {
    it('没有满行时不应该设置满行到 Store', () => {
      findFullLines.mockReturnValue([]);

      clearLines(mockContext);

      expect(mockStore.setClearLines).not.toHaveBeenCalled();
    });

    it('没有满行时应该重置 combo 为 0', () => {
      findFullLines.mockReturnValue([]);

      clearLines(mockContext);

      expect(mockStore.setState).toHaveBeenCalledWith({ combo: 0 });
    });

    it('没有满行时应该发送 UPDATE_HUD 事件', () => {
      findFullLines.mockReturnValue([]);

      clearLines(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-game-uuid:update:hud',
        { combo: 0 },
      );
    });

    it('空数组时应该提前返回不报错', () => {
      findFullLines.mockReturnValue([]);

      expect(() => {
        clearLines(mockContext);
      }).not.toThrow();
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    it('应该先 findFullLines 再 setClearLines', () => {
      findFullLines.mockReturnValue([3]);

      clearLines(mockContext);

      const findCallOrder = findFullLines.mock.invocationCallOrder[0];
      const setCallOrder = mockStore.setClearLines.mock.invocationCallOrder[0];

      expect(findCallOrder).toBeLessThan(setCallOrder);
    });

    it('应该先 setClearLines 再 emit', () => {
      findFullLines.mockReturnValue([3]);

      clearLines(mockContext);

      const setCallOrder = mockStore.setClearLines.mock.invocationCallOrder[0];
      const emitCallOrder = mockContext.emit.mock.invocationCallOrder[0];

      expect(setCallOrder).toBeLessThan(emitCallOrder);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('只有 1 行满时应该正常处理', () => {
      findFullLines.mockReturnValue([19]);

      clearLines(mockContext);

      expect(mockStore.setClearLines).toHaveBeenCalledWith([19]);
      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:test-game-uuid:start:clear:lines',
        { linesToClear: [19] },
      );
    });

    it('多行满时应该正常处理', () => {
      findFullLines.mockReturnValue([0, 1, 2, 3]);

      clearLines(mockContext);

      expect(mockStore.setClearLines).toHaveBeenCalledWith([0, 1, 2, 3]);
    });

    it('findFullLines 返回 null 时不应崩溃', () => {
      findFullLines.mockReturnValue(null);

      expect(() => {
        clearLines(mockContext);
      }).toThrow();
    });

    it('findFullLines 返回 undefined 时不应崩溃', () => {
      findFullLines.mockReturnValue(undefined);

      expect(() => {
        clearLines(mockContext);
      }).toThrow();
    });
  });
});
