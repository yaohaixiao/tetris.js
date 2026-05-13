import AudioState from '@/lib/services/audio/state/audio-state.js';
import playBGM from '@/lib/services/audio/play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';
import loopPlayBGM from '@/lib/services/audio/loop-play-bgm.js';

// Mock 依赖模块
jest.mock('@/lib/services/audio/state/audio-state.js', () => ({
  __esModule: true,
  default: {
    bgmEnabled: true,
    audioCtx: {
      currentTime: 0,
      resume: jest.fn(),
      state: 'running',
    },
  },
}));

jest.mock('@/lib/services/audio/stop-bgm.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/services/audio/loop-play-bgm.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock Musics - 直接在 factory 中定义数据，避免变量提升问题
jest.mock('@/lib/services/audio/constants/musics.js', () => ({
  __esModule: true,
  default: {
    TetrisTheme: {
      name: 'TetrisTheme',
      melody: [{ freq: 659, dur: 1.2 }],
      duration: 220,
      volume: 0.08,
      wave: 'square',
      gate: 0.6,
      articulation: {},
    },
    SpringFestival: {
      name: 'SpringFestival',
      melody: [{ freq: 523, dur: 1.0 }],
      duration: 300,
      volume: 0.12,
      wave: 'sine',
      gate: 1,
      articulation: {},
    },
    FirstDivision: {
      name: 'FirstDivision',
      melody: [{ freq: 587, dur: 0.8 }],
      duration: 250,
      volume: 0.11,
      wave: 'triangle',
      gate: 1,
      articulation: {},
    },
    GongXiFaCai: {
      name: 'GongXiFaCai',
      melody: [{ freq: 659, dur: 0.9 }],
      duration: 280,
      volume: 0.13,
      wave: 'square',
      gate: 1,
      articulation: {},
    },
    Loginska: {
      name: 'Loginska',
      melody: [{ freq: 698, dur: 0.7 }],
      duration: 220,
      volume: 0.1,
      wave: 'sawtooth',
      gate: 1,
      articulation: {},
    },
    BeyondTheWall: {
      name: 'BeyondTheWall',
      melody: [{ freq: 784, dur: 0.8 }],
      duration: 260,
      volume: 0.12,
      wave: 'sine',
      gate: 1,
      articulation: {},
    },
    Technotris: {
      name: 'Technotris',
      melody: [{ freq: 880, dur: 0.7 }],
      duration: 240,
      volume: 0.11,
      wave: 'square',
      gate: 1,
      articulation: {},
    },
    GoldenSnakeDance: {
      name: 'GoldenSnakeDance',
      melody: [{ freq: 988, dur: 0.8 }],
      duration: 270,
      volume: 0.14,
      wave: 'triangle',
      gate: 1,
      articulation: {},
    },
    Korobeiniki: {
      name: 'Korobeiniki',
      melody: [{ freq: 1047, dur: 0.7 }],
      duration: 230,
      volume: 0.12,
      wave: 'sawtooth',
      gate: 1,
      articulation: {},
    },
    JourneyToWest: {
      name: 'JourneyToWest',
      melody: [{ freq: 1175, dur: 0.9 }],
      duration: 290,
      volume: 0.15,
      wave: 'square',
      gate: 1,
      articulation: {},
    },
  },
}));

describe('playBGM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AudioState.bgmEnabled = true;
  });

  // ==================== BGM 开关 ====================
  describe('BGM 开关检查', () => {
    it('bgmEnabled 为 false 时应该直接返回', () => {
      AudioState.bgmEnabled = false;

      playBGM(1);

      expect(stopBGM).not.toHaveBeenCalled();
      expect(loopPlayBGM).not.toHaveBeenCalled();
    });

    it('bgmEnabled 为 true 时应该正常播放', () => {
      playBGM(1);

      expect(stopBGM).toHaveBeenCalled();
      expect(loopPlayBGM).toHaveBeenCalled();
    });
  });

  // ==================== 停止旧 BGM ====================
  describe('停止旧 BGM', () => {
    it('应该在播放新 BGM 前停止当前 BGM', () => {
      playBGM(5);

      expect(stopBGM).toHaveBeenCalledTimes(1);
    });

    it('stopBGM 应该在 loopPlayBGM 之前调用', () => {
      playBGM(5);

      const stopCallOrder = stopBGM.mock.invocationCallOrder[0];
      const loopCallOrder = loopPlayBGM.mock.invocationCallOrder[0];

      expect(stopCallOrder).toBeLessThan(loopCallOrder);
    });
  });

  // ==================== 默认参数 ====================
  describe('默认参数', () => {
    it('不传参数时应该使用默认等级 1 和最大等级 99', () => {
      playBGM();

      // 等级 1 对应第一首曲目（TetrisTheme）
      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          duration: 220,
          volume: 0.08,
          wave: 'square',
        }),
      );
    });
  });

  // ==================== 等级映射 ====================
  describe('等级映射', () => {
    // MUSIC_LIST 有 10 首曲目
    // maxLevel 默认 99，step = Math.floor(99 / 10) = 9
    // level 1-9 → index 0 (TetrisTheme)
    // level 10-18 → index 1 (SpringFestival)
    // level 19-27 → index 2 (FirstDivision)
    // ...
    // level 82-90 → index 9 (JourneyToWest)
    // level 91+ → clamped to index 9

    it('等级 1 应该播放第一首曲目（TetrisTheme）', () => {
      playBGM(1);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          duration: 220,
          volume: 0.08,
          wave: 'square',
        }),
      );
    });

    it('等级 9 应该播放第一首曲目（TetrisTheme）', () => {
      playBGM(9);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ wave: 'square' }),
      );
    });

    it('等级 10 应该播放第二首曲目（SpringFestival）', () => {
      playBGM(10);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          duration: 300,
          volume: 0.12,
          wave: 'sine',
        }),
      );
    });

    it('等级 19 应该播放第三首曲目（FirstDivision）', () => {
      playBGM(19);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          duration: 250,
          volume: 0.11,
          wave: 'triangle',
        }),
      );
    });

    it('等级 82 应该播放第十首曲目（JourneyToWest）', () => {
      playBGM(82);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          duration: 290,
          volume: 0.15,
          wave: 'square',
        }),
      );
    });

    it('等级超过最大等级时应该固定播放最后一首', () => {
      playBGM(150);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ wave: 'square' }),
      );
    });
  });

  // ==================== 自定义最大等级 ====================
  describe('自定义 maxLevel', () => {
    it('maxLevel = 20 时等级 3 应该播放第二首', () => {
      // step = Math.floor(20 / 10) = 2
      // index = Math.floor((3 - 1) / 2) = 1
      playBGM(3, 20);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ wave: 'sine' }),
      );
    });

    it('maxLevel = 20 时等级 5 应该播放第三首', () => {
      // index = Math.floor((5 - 1) / 2) = 2
      playBGM(5, 20);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ wave: 'triangle' }),
      );
    });
  });

  // ==================== 曲目配置传递 ====================
  describe('曲目配置传递', () => {
    it('应该正确传递 melody', () => {
      playBGM(1);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        [{ freq: 659, dur: 1.2 }],
        expect.any(Object),
      );
    });

    it('应该正确传递 gate', () => {
      playBGM(1);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ gate: 0.6 }),
      );
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('bgmEnabled 切换后应该立即生效', () => {
      AudioState.bgmEnabled = false;
      playBGM(1);
      expect(loopPlayBGM).not.toHaveBeenCalled();

      AudioState.bgmEnabled = true;
      playBGM(1);
      expect(loopPlayBGM).toHaveBeenCalledTimes(1);
    });
  });
});
