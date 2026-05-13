import toggleBGM from '@/lib/services/audio/toggle-bgm.js';
import AudioState from '@/lib/services/audio/state/audio-state.js';
import playBGM from '@/lib/services/audio/play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';

jest.mock('@/lib/services/audio/state/audio-state.js', () => ({
  __esModule: true,
  default: {
    bgmEnabled: true,
    audioCtx: {
      currentTime: 0,
    },
  },
}));

jest.mock('@/lib/services/audio/play-bgm.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/services/audio/stop-bgm.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('toggleBGM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== 开启 → 关闭 ====================
  describe('开启 → 关闭', () => {
    it('bgmEnabled 为 true 时调用应该变为 false', () => {
      AudioState.bgmEnabled = true;

      toggleBGM(1);

      expect(AudioState.bgmEnabled).toBe(false);
    });

    it('关闭时应该调用 stopBGM', () => {
      AudioState.bgmEnabled = true;

      toggleBGM(1);

      expect(stopBGM).toHaveBeenCalledTimes(1);
      expect(playBGM).not.toHaveBeenCalled();
    });
  });

  // ==================== 关闭 → 开启 ====================
  describe('关闭 → 开启', () => {
    it('bgmEnabled 为 false 时调用应该变为 true', () => {
      AudioState.bgmEnabled = false;

      toggleBGM(5);

      expect(AudioState.bgmEnabled).toBe(true);
    });

    it('开启时应该调用 playBGM 并传入正确参数', () => {
      AudioState.bgmEnabled = false;

      toggleBGM(5);

      expect(playBGM).toHaveBeenCalledTimes(1);
      expect(playBGM).toHaveBeenCalledWith(5, 99);
      expect(stopBGM).not.toHaveBeenCalled();
    });
  });

  // ==================== 参数传递 ====================
  describe('参数传递', () => {
    it('应该将 level 传递给 playBGM', () => {
      AudioState.bgmEnabled = false;

      toggleBGM(10);

      expect(playBGM).toHaveBeenCalledWith(10, expect.any(Number));
    });

    it('应该将 maxLevel 传递给 playBGM', () => {
      AudioState.bgmEnabled = false;

      toggleBGM(1, 50);

      expect(playBGM).toHaveBeenCalledWith(1, 50);
    });

    it('不传 maxLevel 时应该使用默认值 99', () => {
      AudioState.bgmEnabled = false;

      toggleBGM(1);

      expect(playBGM).toHaveBeenCalledWith(1, 99);
    });
  });

  // ==================== 连续切换 ====================
  describe('连续切换', () => {
    it('连续切换两次应该回到初始状态', () => {
      AudioState.bgmEnabled = true;

      toggleBGM(1);
      expect(AudioState.bgmEnabled).toBe(false);

      toggleBGM(1);
      expect(AudioState.bgmEnabled).toBe(true);
    });

    it('连续切换时应该依次调用 stopBGM 和 playBGM', () => {
      AudioState.bgmEnabled = true;

      toggleBGM(1);
      expect(stopBGM).toHaveBeenCalledTimes(1);
      expect(playBGM).not.toHaveBeenCalled();

      jest.clearAllMocks();

      toggleBGM(1);
      expect(playBGM).toHaveBeenCalledTimes(1);
      expect(stopBGM).not.toHaveBeenCalled();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('level 为 0 时应该正常传递', () => {
      AudioState.bgmEnabled = false;

      toggleBGM(0);

      expect(playBGM).toHaveBeenCalledWith(0, 99);
    });

    it('maxLevel 为 0 时应该正常传递', () => {
      AudioState.bgmEnabled = false;

      toggleBGM(1, 0);

      expect(playBGM).toHaveBeenCalledWith(1, 0);
    });
  });
});
