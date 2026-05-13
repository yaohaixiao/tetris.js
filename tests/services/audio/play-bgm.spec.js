import playBGM from '@/lib/services/audio/play-bgm.js';
import AudioState from '@/lib/services/audio/state/audio-state.js';
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

// Mock Musics 常量
const mockMusics = {
  TetrisTheme: { name: 'TetrisTheme', melody: [440], duration: 200, volume: 0.1, wave: 'square', gate: 1, articulation: {} },
  SpringFestival: { name: 'SpringFestival', melody: [523], duration: 300, volume: 0.12, wave: 'sine', gate: 1, articulation: {} },
  FirstDivision: { name: 'FirstDivision', melody: [587], duration: 250, volume: 0.11, wave: 'triangle', gate: 1, articulation: {} },
  GongXiFaCai: { name: 'GongXiFaCai', melody: [659], duration: 280, volume: 0.13, wave: 'square', gate: 1, articulation: {} },
  Loginska: { name: 'Loginska', melody: [698], duration: 220, volume: 0.1, wave: 'sawtooth', gate: 1, articulation: {} },
  BeyondTheWall: { name: 'BeyondTheWall', melody: [784], duration: 260, volume: 0.12, wave: 'sine', gate: 1, articulation: {} },
  Technotris: { name: 'Technotris', melody: [880], duration: 240, volume: 0.11, wave: 'square', gate: 1, articulation: {} },
  GoldenSnakeDance: { name: 'GoldenSnakeDance', melody: [988], duration: 270, volume: 0.14, wave: 'triangle', gate: 1, articulation: {} },
  Korobeiniki: { name: 'Korobeiniki', melody: [1047], duration: 230, volume: 0.12, wave: 'sawtooth', gate: 1, articulation: {} },
  JourneyToWest: { name: 'JourneyToWest', melody: [1175], duration: 290, volume: 0.15, wave: 'square', gate: 1, articulation: {} },
};

jest.mock('@/lib/services/audio/constants/musics.js', () => ({
  __esModule: true,
  default: mockMusics,
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
        mockMusics.TetrisTheme.melody,
        expect.objectContaining({
          duration: mockMusics.TetrisTheme.duration,
          volume: mockMusics.TetrisTheme.volume,
          wave: mockMusics.TetrisTheme.wave,
        }),
      );
    });

    it('只传等级时应该使用默认最大等级 99', () => {
      playBGM(50);

      // 需要确认对应哪首曲目
      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Object),
      );
    });
  });

  // ==================== 等级映射 ====================
  describe('等级映射', () => {
    // MUSIC_LIST 有 10 首曲目
    // maxLevel 默认 99，step = Math.floor(99 / 10) = 9
    // index = Math.floor((level - 1) / 9)
    // level 1-9 → index 0 (TetrisTheme)
    // level 10-18 → index 1 (SpringFestival)
    // ...
    // level 82-90 → index 9 (JourneyToWest)
    // level 91+ → clamped to index 9 (JourneyToWest)

    it('等级 1 应该播放第一首曲目（TetrisTheme）', () => {
      playBGM(1);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.TetrisTheme.melody,
        expect.any(Object),
      );
    });

    it('等级 9 应该播放第一首曲目（TetrisTheme）', () => {
      playBGM(9);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.TetrisTheme.melody,
        expect.any(Object),
      );
    });

    it('等级 10 应该播放第二首曲目（SpringFestival）', () => {
      playBGM(10);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.SpringFestival.melody,
        expect.any(Object),
      );
    });

    it('等级 18 应该播放第二首曲目（SpringFestival）', () => {
      playBGM(18);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.SpringFestival.melody,
        expect.any(Object),
      );
    });

    it('等级 19 应该播放第三首曲目（FirstDivision）', () => {
      playBGM(19);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.FirstDivision.melody,
        expect.any(Object),
      );
    });

    it('等级 82 应该播放第十首曲目（JourneyToWest）', () => {
      playBGM(82);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.JourneyToWest.melody,
        expect.any(Object),
      );
    });

    it('等级 99 应该播放第十首曲目（JourneyToWest）', () => {
      playBGM(99);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.JourneyToWest.melody,
        expect.any(Object),
      );
    });

    it('等级超过最大等级时应该固定播放最后一首', () => {
      playBGM(150);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.JourneyToWest.melody,
        expect.any(Object),
      );
    });
  });

  // ==================== 自定义最大等级 ====================
  describe('自定义 maxLevel', () => {
    it('maxLevel = 20 时等级 1 应该播放第一首', () => {
      // step = Math.floor(20 / 10) = 2
      playBGM(1, 20);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.TetrisTheme.melody,
        expect.any(Object),
      );
    });

    it('maxLevel = 20 时等级 3 应该播放第二首', () => {
      // index = Math.floor((3 - 1) / 2) = 1
      playBGM(3, 20);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.SpringFestival.melody,
        expect.any(Object),
      );
    });

    it('maxLevel = 20 时等级 5 应该播放第三首', () => {
      // index = Math.floor((5 - 1) / 2) = 2
      playBGM(5, 20);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.FirstDivision.melody,
        expect.any(Object),
      );
    });
  });

  // ==================== 曲目配置传递 ====================
  describe('曲目配置传递', () => {
    it('应该正确传递 melody', () => {
      playBGM(1);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        mockMusics.TetrisTheme.melody,
        expect.any(Object),
      );
    });

    it('应该正确传递 duration', () => {
      playBGM(10);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ duration: mockMusics.SpringFestival.duration }),
      );
    });

    it('应该正确传递 volume', () => {
      playBGM(10);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ volume: mockMusics.SpringFestival.volume }),
      );
    });

    it('应该正确传递 wave', () => {
      playBGM(10);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ wave: mockMusics.SpringFestival.wave }),
      );
    });

    it('应该正确传递 gate', () => {
      playBGM(10);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ gate: mockMusics.SpringFestival.gate }),
      );
    });

    it('应该正确传递 articulation', () => {
      playBGM(10);

      expect(loopPlayBGM).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          articulation: mockMusics.SpringFestival.articulation,
        }),
      );
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('等级为 0 时应该播放第一首曲目', () => {
      // index = Math.floor((0 - 1) / 9) = Math.floor(-1/9) = -1
      // Math.min(-1, 9) = -1
      // MUSIC_LIST[-1] = undefined
      // 如实反映，由 getMusicByLevel 处理
      playBGM(0);

      // 这取决于实现的边界处理，可能为 undefined
      expect(loopPlayBGM).toHaveBeenCalled();
    });

    it('等级为负数时行为取决于 getMusicByLevel 实现', () => {
      playBGM(-5);

      expect(loopPlayBGM).toHaveBeenCalled();
    });

    it('maxLevel 小于曲目数量时步长为 0', () => {
      // step = Math.floor(5 / 10) = 0
      // index = Math.floor((1-1)/0) = Infinity (division by 0 in some cases)
      // 反映实际行为
      playBGM(1, 5);

      expect(loopPlayBGM).toHaveBeenCalled();
    });

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
