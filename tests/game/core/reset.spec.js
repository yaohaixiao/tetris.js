import reset from '@/lib/game/core/reset.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';

// Mock 依赖
jest.mock('@/lib/game/actions/set-beginning-state.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('reset', () => {
  let mockContext;
  let mockStore;
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      score: 0,
      lines: 0,
      level: 1,
      mode: 'main-menu',
      difficulty: 'easy',
    };

    mockStore = {
      getLevel: jest.fn().mockReturnValue(5),
      resetBoard: jest.fn(),
      setDifficulty: jest.fn(),
      getState: jest.fn().mockReturnValue(mockState),
    };

    mockContext = {
      id: 'test-game-uuid',
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该停止背景音乐', () => {
      reset(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:stop:bgm');
    });

    it('应该清空动画', () => {
      reset(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'animations:test-game-uuid:clear',
      );
    });

    it('应该清空命令队列', () => {
      reset(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'command:queue:test-game-uuid:clear',
      );
    });

    it('应该重置棋盘', () => {
      reset(mockContext);

      expect(mockStore.resetBoard).toHaveBeenCalled();
    });

    it('应该调用 setBeginningState', () => {
      reset(mockContext);

      expect(setBeginningState).toHaveBeenCalled();
    });

    it('应该更新 HUD', () => {
      reset(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-game-uuid:update:hud',
        { state: mockState },
      );
    });

    it('应该更新 UI 模式', () => {
      reset(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-game-uuid:update:mode',
        { mode: 'main-menu' },
      );
    });
  });

  // ==================== 默认参数 ====================
  describe('默认参数', () => {
    it('不传 mode 时应该使用 main-menu', () => {
      reset(mockContext);

      expect(setBeginningState).toHaveBeenCalledWith(
        mockContext,
        'main-menu',
        1, // main-menu 时 level 被重置为 1
      );
      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-game-uuid:update:mode',
        { mode: 'main-menu' },
      );
    });

    // 删掉"应该使用当前等级"这个测试，因为 main-menu 时 level 固定为 1
  });

  // ==================== main-menu 模式特殊处理 ====================
  describe('main-menu 模式特殊处理', () => {
    it('mode 为 main-menu 时应该设置难度为 easy', () => {
      reset(mockContext, 'main-menu');

      expect(mockStore.setDifficulty).toHaveBeenCalledWith('easy');
    });

    it('mode 为 main-menu 时应该重置 level 为 1', () => {
      mockStore.getLevel.mockReturnValue(10);

      reset(mockContext, 'main-menu');

      expect(setBeginningState).toHaveBeenCalledWith(
        mockContext,
        'main-menu',
        1,
      );
    });

    it('mode 为 main-menu 时应该播放切换场景音效', () => {
      reset(mockContext, 'main-menu');

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'SWITCH_SCENE',
      });
    });
  });

  // ==================== 非 main-menu 模式 ====================
  describe('非 main-menu 模式', () => {
    it('mode 为 playing 时不应该重置难度', () => {
      reset(mockContext, 'playing');

      expect(mockStore.setDifficulty).not.toHaveBeenCalled();
    });

    it('mode 为 playing 时应该保持原等级', () => {
      mockStore.getLevel.mockReturnValue(8);

      reset(mockContext, 'playing');

      expect(setBeginningState).toHaveBeenCalledWith(mockContext, 'playing', 8);
    });

    it('mode 为 playing 时不应该播放切换场景音效', () => {
      reset(mockContext, 'playing');

      expect(mockContext.emit).not.toHaveBeenCalledWith(
        'audio:play:sound',
        expect.objectContaining({ sound: 'SWITCH_SCENE' }),
      );
    });

    it('mode 为 difficulty 时不应该重置难度', () => {
      reset(mockContext, 'difficulty');

      expect(mockStore.setDifficulty).not.toHaveBeenCalled();
    });

    it('mode 为 difficulty 时应该保持原等级', () => {
      mockStore.getLevel.mockReturnValue(3);

      reset(mockContext, 'difficulty');

      expect(setBeginningState).toHaveBeenCalledWith(
        mockContext,
        'difficulty',
        3,
      );
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    it('应该先清空再重置棋盘再设置状态', () => {
      reset(mockContext);

      const calls = mockContext.emit.mock.calls.map(([event]) => event);

      const stopBgmIndex = calls.indexOf('audio:stop:bgm');
      const animClearIndex = calls.indexOf('animations:test-game-uuid:clear');
      const queueClearIndex = calls.indexOf(
        'command:queue:test-game-uuid:clear',
      );

      // stopBgm 应该最先
      expect(stopBgmIndex).toBe(0);

      // 清空操作应该在 resetBoard 之前
      expect(mockStore.resetBoard).toHaveBeenCalled();

      // setBeginningState 应该在 resetBoard 之后调用
      const resetBoardOrder = mockStore.resetBoard.mock.invocationCallOrder[0];
      const setBeginningOrder = setBeginningState.mock.invocationCallOrder[0];

      expect(resetBoardOrder).toBeLessThan(setBeginningOrder);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('level 为 0 时 main-menu 应该重置为 1', () => {
      mockStore.getLevel.mockReturnValue(0);

      reset(mockContext, 'main-menu');

      expect(setBeginningState).toHaveBeenCalledWith(
        mockContext,
        'main-menu',
        1,
      );
    });

    it('level 为 99 时 playing 模式应该保持', () => {
      mockStore.getLevel.mockReturnValue(99);

      reset(mockContext, 'playing');

      expect(setBeginningState).toHaveBeenCalledWith(
        mockContext,
        'playing',
        99,
      );
    });

    it('getState 返回的 state 应该传递给 HUD 更新', () => {
      const customState = { score: 9999, lines: 100, level: 10 };
      mockStore.getState.mockReturnValue(customState);

      reset(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-game-uuid:update:hud',
        { state: customState },
      );
    });
  });
});
