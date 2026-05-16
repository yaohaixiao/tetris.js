import resume from '@/lib/game/core/resume';

describe('resume', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getMode: jest.fn().mockReturnValue('paused'),
      getLevel: jest.fn().mockReturnValue(5),
      setMode: jest.fn(),
    };

    mockContext = {
      id: 'test-uuid-001',
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('mode 为 paused 时应正常执行', () => {
      resume(mockContext);

      expect(mockStore.setMode).toHaveBeenCalledWith('playing');
    });

    it('应更新 UI mode 为 playing', () => {
      resume(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-uuid-001:update:mode',
        { mode: 'playing' },
      );
    });

    it('应发送 stop:paused 事件', () => {
      resume(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:test-uuid-001:stop:paused',
      );
    });

    it('应播放 RESUME 音效', () => {
      resume(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:resume:sound', {
        sound: 'RESUME',
      });
    });

    it('应恢复背景音乐并传递 level', () => {
      resume(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:resume:bgm', {
        level: 5,
      });
    });
  });

  // ==================== 模式限制 ====================
  describe('模式限制', () => {
    it('mode 不为 paused 时应直接返回', () => {
      mockStore.getMode.mockReturnValue('playing');

      resume(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('mode 为 game-over 时应直接返回', () => {
      mockStore.getMode.mockReturnValue('game-over');

      resume(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });

    it('mode 为 main-menu 时应直接返回', () => {
      mockStore.getMode.mockReturnValue('main-menu');

      resume(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });

    it('mode 为 difficulty 时应直接返回', () => {
      mockStore.getMode.mockReturnValue('difficulty');

      resume(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });
  });

  // ==================== level 传递 ====================
  describe('level 传递', () => {
    it('应获取当前等级并传递给 BGM', () => {
      mockStore.getLevel.mockReturnValue(8);

      resume(mockContext);

      expect(mockStore.getLevel).toHaveBeenCalled();
      expect(mockContext.emit).toHaveBeenCalledWith('audio:resume:bgm', {
        level: 8,
      });
    });

    it('level 为 1 时应正常传递', () => {
      mockStore.getLevel.mockReturnValue(1);

      resume(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:resume:bgm', {
        level: 1,
      });
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    it('应先 emit ui:update:mode 再 setMode', () => {
      resume(mockContext);

      const firstEmitOrder = mockContext.emit.mock.invocationCallOrder[0];
      const setModeOrder = mockStore.setMode.mock.invocationCallOrder[0];

      expect(firstEmitOrder).toBeLessThan(setModeOrder);
    });

    it('emit 顺序应为 ui → stop:paused → sound → bgm', () => {
      resume(mockContext);

      const events = mockContext.emit.mock.calls.map(([event]) => event);

      expect(events).toEqual([
        'ui:test-uuid-001:update:mode',
        'game:test-uuid-001:stop:paused',
        'audio:resume:sound',
        'audio:resume:bgm',
      ]);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('mode 为 null 时应直接返回', () => {
      mockStore.getMode.mockReturnValue(null);

      resume(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });

    it('mode 为 undefined 时应直接返回', () => {
      mockStore.getMode.mockReturnValue(undefined);

      resume(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });
  });
});
