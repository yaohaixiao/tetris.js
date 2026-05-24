// tests/services/audio/play-bgm.spec.js

import playBGM from '@/lib/services/audio/play-bgm';
import loopPlayBGM from '@/lib/services/audio/loop-play-bgm';

/**
 * Mock loopPlayBGM
 *
 * 不实际执行音频播放，只记录调用参数
 */
jest.mock('@/lib/services/audio/loop-play-bgm', () => jest.fn());

/**
 * Mock GAME 常量
 *
 * MAX_LEVEL = 256，与 16 首曲目配合，每 16 关换一首
 */
jest.mock('@/lib/game/constants/game.js', () => ({
  __esModule: true,
  default: { MAX_LEVEL: 256 },
}));

/**
 * Mock Musics 曲库
 *
 * 16 首曲目，每首提供独立的 melody 标识和播放参数
 */
jest.mock('@/lib/services/audio/constants/musics', () => ({
  TetrisTheme: {
    melody: 'melody-0',
    duration: 110,
    volume: 0.05,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
  SpringFestival: {
    melody: 'melody-1',
    duration: 120,
    volume: 0.06,
    wave: 'sine',
    gate: 1,
    articulation: {},
  },
  FirstDivision: {
    melody: 'melody-2',
    duration: 110,
    volume: 0.05,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
  GongXiFaCai: {
    melody: 'melody-3',
    duration: 100,
    volume: 0.07,
    wave: 'triangle',
    gate: 0.9,
    articulation: { attackTime: 0.005 },
  },
  Loginska: {
    melody: 'melody-4',
    duration: 110,
    volume: 0.05,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
  BeyondTheWall: {
    melody: 'melody-5',
    duration: 130,
    volume: 0.04,
    wave: 'sawtooth',
    gate: 0.8,
    articulation: {},
  },
  Technotris: {
    melody: 'melody-6',
    duration: 90,
    volume: 0.08,
    wave: 'square',
    gate: 0.7,
    articulation: {},
  },
  GoldenSnakeDance: {
    melody: 'melody-7',
    duration: 110,
    volume: 0.05,
    wave: 'sine',
    gate: 1,
    articulation: {},
  },
  Korobeiniki: {
    melody: 'melody-8',
    duration: 100,
    volume: 0.07,
    wave: 'triangle',
    gate: 0.9,
    articulation: { attackTime: 0.005 },
  },
  Ascension: {
    melody: 'melody-9',
    duration: 200,
    volume: 0.08,
    wave: 'triangle',
    gate: 1,
    articulation: {},
  },
  NeonNights: {
    melody: 'melody-10',
    duration: 160,
    volume: 0.08,
    wave: 'triangle',
    gate: 0.85,
    articulation: {},
  },
  FrozenPeaks: {
    melody: 'melody-11',
    duration: 200,
    volume: 0.07,
    wave: 'sine',
    gate: 1,
    articulation: {},
  },
  CyberRush: {
    melody: 'melody-12',
    duration: 120,
    volume: 0.09,
    wave: 'sawtooth',
    gate: 0.6,
    articulation: {},
  },
  Starlight: {
    melody: 'melody-13',
    duration: 180,
    volume: 0.06,
    wave: 'sine',
    gate: 1,
    articulation: {},
  },
  FinalPush: {
    melody: 'melody-14',
    duration: 140,
    volume: 0.1,
    wave: 'square',
    gate: 0.8,
    articulation: {},
  },
  JourneyToWest: {
    melody: 'melody-15',
    duration: 110,
    volume: 0.06,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
}));

describe('playBGM', () => {
  /**
   * 最小化 audio mock
   *
   * PlayBGM 只需要 audio 作为 loopPlayBGM 的第一个参数传入
   */
  let audio;

  beforeEach(() => {
    jest.clearAllMocks();
    audio = {};
  });

  // ==================== getMusicByLevel — 等级选曲 ====================
  describe('getMusicByLevel', () => {
    /**
     * MAX_LEVEL = 256，MUSIC_LIST.length = 16
     *
     * Step = floor(256 / 16) = 16
     *
     * 等级区间： 1-16 → index 0 (TetrisTheme) 17-32 → index 1 (SpringFestival) 33-48
     * → index 2 (FirstDivision) ... 241-256 → index 15 (JourneyToWest)
     */

    it('level 1 → TetrisTheme (index 0)', () => {
      playBGM(audio, 1);
      expect(loopPlayBGM).toHaveBeenCalledWith(
        audio,
        'melody-0',
        expect.any(Object),
      );
    });

    it('level 16 → TetrisTheme (边界：区间末尾)', () => {
      playBGM(audio, 16);
      expect(loopPlayBGM).toHaveBeenCalledWith(
        audio,
        'melody-0',
        expect.any(Object),
      );
    });

    it('level 17 → SpringFestival (跨入下一区间)', () => {
      playBGM(audio, 17);
      expect(loopPlayBGM).toHaveBeenCalledWith(
        audio,
        'melody-1',
        expect.any(Object),
      );
    });

    it('level 33 → FirstDivision', () => {
      playBGM(audio, 33);
      expect(loopPlayBGM).toHaveBeenCalledWith(
        audio,
        'melody-2',
        expect.any(Object),
      );
    });

    it('level 241 → JourneyToWest (最后一首区间)', () => {
      playBGM(audio, 241);
      expect(loopPlayBGM).toHaveBeenCalledWith(
        audio,
        'melody-15',
        expect.any(Object),
      );
    });

    it('level 256 → JourneyToWest (max 边界)', () => {
      playBGM(audio, 256);
      expect(loopPlayBGM).toHaveBeenCalledWith(
        audio,
        'melody-15',
        expect.any(Object),
      );
    });

    it('level 257 → index 15 (min 保护，不越界)', () => {
      playBGM(audio, 257);
      // floor(256/16) = 16 → min(16, 15) = 15
      expect(loopPlayBGM).toHaveBeenCalledWith(
        audio,
        'melody-15',
        expect.any(Object),
      );
    });

    it('默认 level=1 → TetrisTheme', () => {
      playBGM(audio);
      expect(loopPlayBGM).toHaveBeenCalledWith(
        audio,
        'melody-0',
        expect.any(Object),
      );
    });
  });

  // ==================== 参数传递 ====================
  describe('参数传递', () => {
    it('传递完整播放参数：duration, volume, wave, gate, articulation', () => {
      playBGM(audio, 1);

      expect(loopPlayBGM).toHaveBeenCalledWith(audio, 'melody-0', {
        duration: 110,
        volume: 0.05,
        wave: 'square',
        gate: 1,
        articulation: {},
      });
    });

    it('不同等级传递不同曲目配置', () => {
      playBGM(audio, 49); // GongXiFaCai (index 3)

      expect(loopPlayBGM).toHaveBeenCalledWith(audio, 'melody-3', {
        duration: 100,
        volume: 0.07,
        wave: 'triangle',
        gate: 0.9,
        articulation: { attackTime: 0.005 },
      });
    });
  });
});
