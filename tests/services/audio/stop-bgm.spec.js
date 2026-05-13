import stopBGM from '@/lib/services/audio/stop-bgm.js';
import AudioState from '@/lib/services/audio/state/audio-state.js';

jest.mock('@/lib/services/audio/state/audio-state.js', () => ({
  __esModule: true,
  default: {
    bgmTimer: null,
  },
}));

describe('stopBGM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    AudioState.bgmTimer = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('存在定时器时应该清除定时器', () => {
      const timerId = setTimeout(() => {}, 1000);
      AudioState.bgmTimer = timerId;

      const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');

      stopBGM();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(timerId);

      clearTimeoutSpy.mockRestore();
    });

    it('应该将 bgmTimer 重置为 null', () => {
      AudioState.bgmTimer = 123;

      stopBGM();

      expect(AudioState.bgmTimer).toBeNull();
    });
  });

  // ==================== 无定时器情况 ====================
  describe('无定时器情况', () => {
    it('bgmTimer 为 null 时不应该报错', () => {
      AudioState.bgmTimer = null;

      expect(() => {
        stopBGM();
      }).not.toThrow();
    });

    it('bgmTimer 为 undefined 时不应该报错', () => {
      AudioState.bgmTimer = undefined;

      expect(() => {
        stopBGM();
      }).not.toThrow();
    });

    it('bgmTimer 为 0 时应该正常处理', () => {
      // setTimeout 返回的正整数，0 是 falsy 但也是有效 ID 的情况很少见
      AudioState.bgmTimer = 0;

      expect(() => {
        stopBGM();
      }).not.toThrow();

      expect(AudioState.bgmTimer).toBeNull();
    });
  });

  // ==================== 连续调用 ====================
  describe('连续调用', () => {
    it('连续调用两次不应该报错', () => {
      AudioState.bgmTimer = setTimeout(() => {}, 1000);

      expect(() => {
        stopBGM();
        stopBGM();
      }).not.toThrow();

      expect(AudioState.bgmTimer).toBeNull();
    });
  });
});
