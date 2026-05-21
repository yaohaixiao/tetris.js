import start from '@/lib/game/core/start.js';

describe('start', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getLevel: jest.fn().mockReturnValue(5),
      setBaseLines: jest.fn(),
    };

    mockContext = {
      id: 'test-game-uuid',
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该获取当前等级', () => {
      start(mockContext);

      expect(mockStore.getLevel).toHaveBeenCalled();
    });

    it('应该正确计算并设置基准行数', () => {
      mockStore.getLevel.mockReturnValue(5);

      start(mockContext);

      expect(mockStore.setBaseLines).toHaveBeenCalledWith(40);
    });

    it('应该发送倒计时事件，传递 { game }', () => {
      start(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:test-game-uuid:start:countdown',
      );
    });
  });

  // ==================== 基准行数计算 ====================
  describe('基准行数计算', () => {
    it('等级 1 基准行数应该为 0', () => {
      mockStore.getLevel.mockReturnValue(1);

      start(mockContext);

      expect(mockStore.setBaseLines).toHaveBeenCalledWith(0);
    });

    it('等级 3 基准行数应该为 20', () => {
      mockStore.getLevel.mockReturnValue(3);

      start(mockContext);

      expect(mockStore.setBaseLines).toHaveBeenCalledWith(20);
    });

    it('等级 10 基准行数应该为 90', () => {
      mockStore.getLevel.mockReturnValue(10);

      start(mockContext);

      expect(mockStore.setBaseLines).toHaveBeenCalledWith(90);
    });

    it('等级 99 基准行数应该为 980', () => {
      mockStore.getLevel.mockReturnValue(99);

      start(mockContext);

      expect(mockStore.setBaseLines).toHaveBeenCalledWith(980);
    });
  });

  // ==================== 倒计时事件 ====================
  describe('倒计时事件', () => {
    it('应该传递正确的 id', () => {
      mockContext.id = 'custom-game-id';

      start(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:custom-game-id:start:countdown',
      );
    });

    it('应该不传递额外的 payload', () => {
      start(mockContext);
      expect(mockContext.emit.mock.calls[0].length).toBe(1);
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    it('应该不传递额外的 payload', () => {
      start(mockContext);
      expect(mockContext.emit.mock.calls[0].length).toBe(1);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('level 为 0 时基准行数应该为 -10', () => {
      mockStore.getLevel.mockReturnValue(0);

      start(mockContext);

      expect(mockStore.setBaseLines).toHaveBeenCalledWith(-10);
    });

    it('level 为负数时基准行数为负数', () => {
      mockStore.getLevel.mockReturnValue(-2);

      start(mockContext);

      expect(mockStore.setBaseLines).toHaveBeenCalledWith(-30);
    });
  });
});
