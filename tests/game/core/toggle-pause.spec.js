import togglePause from '@/lib/game/core/toggle-pause.js';
import play from '@/lib/game/core/play.js';
import pause from '@/lib/game/core/pause.js';

// Mock 依赖
jest.mock('@/lib/game/core/play.js', () => ({
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
    };
  });

  // ==================== 禁止的模式 ====================
  describe('禁止的模式', () => {
    it('mode 为 main-menu 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('main-menu');

      togglePause(mockContext);

      expect(pause).not.toHaveBeenCalled();
      expect(play).not.toHaveBeenCalled();
    });

    it('mode 为 replay 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('replay');

      togglePause(mockContext);

      expect(pause).not.toHaveBeenCalled();
      expect(play).not.toHaveBeenCalled();
    });

    it('mode 为 game-over 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('game-over');

      togglePause(mockContext);

      expect(pause).not.toHaveBeenCalled();
      expect(play).not.toHaveBeenCalled();
    });
  });

  // ==================== 暂停逻辑 ====================
  describe('暂停逻辑', () => {
    it('mode 为 playing 时应该调用 pause', () => {
      mockStore.getMode.mockReturnValue('playing');

      togglePause(mockContext);

      expect(pause).toHaveBeenCalledWith(mockContext);
      expect(play).not.toHaveBeenCalled();
    });
  });

  // ==================== 继续逻辑 ====================
  describe('继续逻辑', () => {
    it('mode 为 paused 时应该调用 play', () => {
      mockStore.getMode.mockReturnValue('paused');

      togglePause(mockContext);

      expect(play).toHaveBeenCalledWith(mockContext);
      expect(pause).not.toHaveBeenCalled();
    });

    it('mode 为 difficulty 时应该调用 play', () => {
      mockStore.getMode.mockReturnValue('difficulty');

      togglePause(mockContext);

      expect(play).toHaveBeenCalledWith(mockContext);
      expect(pause).not.toHaveBeenCalled();
    });
  });

  // ==================== 互斥性 ====================
  describe('互斥性', () => {
    it('pause 和 play 不应该同时被调用', () => {
      mockStore.getMode.mockReturnValue('playing');
      togglePause(mockContext);
      expect(pause).toHaveBeenCalledTimes(1);
      expect(play).not.toHaveBeenCalled();

      jest.clearAllMocks();

      mockStore.getMode.mockReturnValue('paused');
      togglePause(mockContext);
      expect(play).toHaveBeenCalledTimes(1);
      expect(pause).not.toHaveBeenCalled();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('mode 为 null 时应该调用 play（else 分支）', () => {
      mockStore.getMode.mockReturnValue(null);

      togglePause(mockContext);

      // null !== 'playing'，走 else 分支
      expect(play).toHaveBeenCalled();
    });

    it('mode 为 undefined 时应该调用 play（else 分支）', () => {
      mockStore.getMode.mockReturnValue(undefined);

      togglePause(mockContext);

      expect(play).toHaveBeenCalled();
    });

    it('mode 为未知值时应该调用 play（else 分支）', () => {
      mockStore.getMode.mockReturnValue('unknown-mode');

      togglePause(mockContext);

      expect(play).toHaveBeenCalled();
    });
  });
});
