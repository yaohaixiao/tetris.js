import setBeginningState from '@/lib/game/actions/set-beginning-state.js';

describe('setBeginningState', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      setState: jest.fn(),
      generateBoard: jest.fn().mockReturnValue([
        ['#FF0000', '', ''],
        ['', '#00FF00', ''],
      ]),
      setBeginningBoard: jest.fn(),
    };

    mockContext = {
      id: 'test-uuid',
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该发送 ui:test-uuid:update:mode 事件', () => {
      setBeginningState(mockContext, 'playing');

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-uuid:update:mode',
        {
          mode: 'playing',
        },
      );
    });

    it('应该更新 Store 状态', () => {
      setBeginningState(mockContext, 'paused');

      expect(mockStore.setState).toHaveBeenCalledWith({
        mode: 'paused',
        score: 0,
        lines: 0,
        level: 1,
        next: null,
      });
    });
  });

  // ==================== 参数传递 ====================
  describe('参数传递', () => {
    it('应该传递 mode 参数', () => {
      setBeginningState(mockContext, 'game-over');

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-uuid:update:mode',
        {
          mode: 'game-over',
        },
      );
      expect(mockStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'game-over' }),
      );
    });

    it('不传 level 时应该使用默认值 1', () => {
      setBeginningState(mockContext, 'playing');

      expect(mockStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({ level: 1 }),
      );
    });

    it('应该支持自定义 level', () => {
      setBeginningState(mockContext, 'playing', 5);

      expect(mockStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({ level: 5 }),
      );
    });
  });

  // ==================== playing 模式特殊处理 ====================
  describe('playing 模式特殊处理', () => {
    it('mode 为 playing 时应该生成棋盘', () => {
      setBeginningState(mockContext, 'playing');

      expect(mockStore.generateBoard).toHaveBeenCalled();
    });

    it('mode 为 playing 时应该设置初始棋盘', () => {
      setBeginningState(mockContext, 'playing');

      expect(mockStore.setBeginningBoard).toHaveBeenCalled();
    });

    it('应该将 generateBoard 的返回值传给 setBeginningBoard', () => {
      const generatedBoard = [['row1'], ['row2']];
      mockStore.generateBoard.mockReturnValue(generatedBoard);

      setBeginningState(mockContext, 'playing');

      expect(mockStore.setBeginningBoard).toHaveBeenCalledWith(generatedBoard);
    });

    it('应该先 setState 再 generateBoard', () => {
      setBeginningState(mockContext, 'playing');

      const setStateCallOrder = mockStore.setState.mock.invocationCallOrder[0];
      const generateBoardCallOrder =
        mockStore.generateBoard.mock.invocationCallOrder[0];

      expect(setStateCallOrder).toBeLessThan(generateBoardCallOrder);
    });
  });

  // ==================== 非 playing 模式 ====================
  describe('非 playing 模式', () => {
    it('mode 为 main-menu 时不应该生成棋盘', () => {
      setBeginningState(mockContext, 'main-menu');

      expect(mockStore.generateBoard).not.toHaveBeenCalled();
      expect(mockStore.setBeginningBoard).not.toHaveBeenCalled();
    });

    it('mode 为 paused 时不应该生成棋盘', () => {
      setBeginningState(mockContext, 'paused');

      expect(mockStore.generateBoard).not.toHaveBeenCalled();
      expect(mockStore.setBeginningBoard).not.toHaveBeenCalled();
    });

    it('mode 为 game-over 时不应该生成棋盘', () => {
      setBeginningState(mockContext, 'game-over');

      expect(mockStore.generateBoard).not.toHaveBeenCalled();
      expect(mockStore.setBeginningBoard).not.toHaveBeenCalled();
    });
  });

  // ==================== 状态重置 ====================
  describe('状态重置', () => {
    it('每次调用都应该重置 score 为 0', () => {
      setBeginningState(mockContext, 'playing');

      expect(mockStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({ score: 0 }),
      );
    });

    it('每次调用都应该重置 lines 为 0', () => {
      setBeginningState(mockContext, 'playing');

      expect(mockStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({ lines: 0 }),
      );
    });

    it('每次调用都应该重置 next 为 null', () => {
      setBeginningState(mockContext, 'playing');

      expect(mockStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({ next: null }),
      );
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('level 为 0 时应该正常传递', () => {
      setBeginningState(mockContext, 'playing', 0);

      expect(mockStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({ level: 0 }),
      );
    });

    it('mode 为 unknown 时不应该生成棋盘', () => {
      setBeginningState(mockContext, 'unknown');

      expect(mockStore.generateBoard).not.toHaveBeenCalled();
    });

    it('应该总是更新 Store，不论 mode 是什么', () => {
      setBeginningState(mockContext, 'any-mode', 3);

      expect(mockStore.setState).toHaveBeenCalledWith({
        mode: 'any-mode',
        score: 0,
        lines: 0,
        level: 3,
        next: null,
      });
    });
  });
});
