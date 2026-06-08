import togglePause from '@/lib/game/core/toggle-pause.js';
import resume from '@/lib/game/core/resume.js';
import pause from '@/lib/game/core/pause.js';

jest.mock('@/lib/game/core/resume.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/game/core/pause.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('togglePause', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getMode: jest.fn(),
    };

    mockContext = {
      Store: mockStore,
      emit: jest.fn(),
      isVersus: jest.fn(() => false),
    };
  });

  // ==================== 禁止的模式 ====================
  describe('禁止的模式', () => {
    it('mode 为 main-menu 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('main-menu');

      togglePause(mockContext);

      expect(pause).not.toHaveBeenCalled();
      expect(resume).not.toHaveBeenCalled();
    });

    it('mode 为 replay 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('replay');

      togglePause(mockContext);

      expect(pause).not.toHaveBeenCalled();
      expect(resume).not.toHaveBeenCalled();
    });

    it('mode 为 game-over 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('game-over');

      togglePause(mockContext);

      expect(pause).not.toHaveBeenCalled();
      expect(resume).not.toHaveBeenCalled();
    });
  });

  // ==================== 暂停逻辑 ====================
  describe('暂停逻辑', () => {
    it('mode 为 playing 时应该调用 pause', () => {
      mockStore.getMode.mockReturnValue('playing');

      togglePause(mockContext);

      expect(pause).toHaveBeenCalledWith(mockContext);
      expect(resume).not.toHaveBeenCalled();
    });

    it('单人模式 playing 时不应该发送对战同步事件', () => {
      mockContext.isVersus.mockReturnValue(false);
      mockStore.getMode.mockReturnValue('playing');

      togglePause(mockContext);

      expect(mockContext.emit).not.toHaveBeenCalledWith('battle:sync:pause', expect.any(Object));
    });

    it('对战模式 playing 时应该发送暂停同步事件', () => {
      mockContext.isVersus.mockReturnValue(true);
      mockStore.getMode.mockReturnValue('playing');

      togglePause(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('battle:sync:pause', {
        from: mockContext,
      });
    });
  });

  // ==================== 继续逻辑 ====================
  describe('继续逻辑', () => {
    it('mode 为 paused 时应该调用 resume', () => {
      mockStore.getMode.mockReturnValue('paused');

      togglePause(mockContext);

      expect(resume).toHaveBeenCalledWith(mockContext);
      expect(pause).not.toHaveBeenCalled();
    });

    it('mode 为 difficulty 时应该调用 resume', () => {
      mockStore.getMode.mockReturnValue('difficulty');

      togglePause(mockContext);

      expect(resume).toHaveBeenCalledWith(mockContext);
      expect(pause).not.toHaveBeenCalled();
    });

    it('单人模式 paused 时不应该发送对战同步事件', () => {
      mockContext.isVersus.mockReturnValue(false);
      mockStore.getMode.mockReturnValue('paused');

      togglePause(mockContext);

      expect(mockContext.emit).not.toHaveBeenCalledWith('battle:sync:resume', expect.any(Object));
    });

    it('对战模式 paused 时应该发送恢复同步事件', () => {
      mockContext.isVersus.mockReturnValue(true);
      mockStore.getMode.mockReturnValue('paused');

      togglePause(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('battle:sync:resume', {
        from: mockContext,
      });
    });
  });

  // ==================== 互斥性 ====================
  describe('互斥性', () => {
    it('pause 和 resume 不应该同时被调用', () => {
      mockStore.getMode.mockReturnValue('playing');
      togglePause(mockContext);
      expect(pause).toHaveBeenCalledTimes(1);
      expect(resume).not.toHaveBeenCalled();

      jest.clearAllMocks();

      mockStore.getMode.mockReturnValue('paused');
      togglePause(mockContext);
      expect(resume).toHaveBeenCalledTimes(1);
      expect(pause).not.toHaveBeenCalled();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('mode 为 null 时应该调用 resume（else 分支）', () => {
      mockStore.getMode.mockReturnValue(null);

      togglePause(mockContext);

      expect(resume).toHaveBeenCalled();
    });

    it('mode 为 undefined 时应该调用 resume（else 分支）', () => {
      mockStore.getMode.mockReturnValue(undefined);

      togglePause(mockContext);

      expect(resume).toHaveBeenCalled();
    });

    it('mode 为未知值时应该调用 resume（else 分支）', () => {
      mockStore.getMode.mockReturnValue('unknown-mode');

      togglePause(mockContext);

      expect(resume).toHaveBeenCalled();
    });
  });
});
