import playBGM from '@/lib/services/audio/play-bgm';
import loopPlayBGM from '@/lib/services/audio/loop-play-bgm';

jest.mock('@/lib/services/audio/loop-play-bgm', () => jest.fn());

// Mock Musics — 10首曲目，匹配 MUSIC_LIST
jest.mock('@/lib/services/audio/constants/musics', () => ({
  TetrisTheme:    { melody: 'melody-0',  duration: 110, volume: 0.05, wave: 'square',  gate: 1,   articulation: {} },
  SpringFestival: { melody: 'melody-1',  duration: 120, volume: 0.06, wave: 'sine',    gate: 1,   articulation: {} },
  FirstDivision:  { melody: 'melody-2',  duration: 110, volume: 0.05, wave: 'square',  gate: 1,   articulation: {} },
  GongXiFaCai:    { melody: 'melody-3',  duration: 100, volume: 0.07, wave: 'triangle',gate: 0.9, articulation: { attackTime: 0.005 } },
  Loginska:       { melody: 'melody-4',  duration: 110, volume: 0.05, wave: 'square',  gate: 1,   articulation: {} },
  BeyondTheWall:  { melody: 'melody-5',  duration: 130, volume: 0.04, wave: 'sawtooth',gate: 0.8, articulation: {} },
  Technotris:     { melody: 'melody-6',  duration: 90,  volume: 0.08, wave: 'square',  gate: 0.7, articulation: {} },
  GoldenSnakeDance:{ melody: 'melody-7', duration: 110, volume: 0.05, wave: 'sine',    gate: 1,   articulation: {} },
  Korobeiniki:    { melody: 'melody-8',  duration: 100, volume: 0.07, wave: 'triangle',gate: 0.9, articulation: { attackTime: 0.005 } },
  JourneyToWest:  { melody: 'melody-9',  duration: 110, volume: 0.06, wave: 'square',  gate: 1,   articulation: {} },
}));

describe('playBGM', () => {
  let audio;

  beforeEach(() => {
    jest.clearAllMocks();

    audio = {
      Context: { currentTime: 100 },
      Level: { max: 99 },
    };
  });

  describe('getMusicByLevel — 等级选曲逻辑', () => {
    test('Level.max=99, 10首曲目 → step=9', () => {
      // step = floor(99 / 10) = 9
      // level 1-9   → index 0 (TetrisTheme)
      // level 10-18 → index 1 (SpringFestival)
      // ...
      // level 91-99 → index 9 (JourneyToWest)

      playBGM(audio, 1);
      expect(loopPlayBGM).toHaveBeenLastCalledWith(
        audio,
        'melody-0',
        expect.any(Object),
      );

      playBGM(audio, 9);
      expect(loopPlayBGM).toHaveBeenLastCalledWith(
        audio,
        'melody-0',
        expect.any(Object),
      );

      playBGM(audio, 10);
      expect(loopPlayBGM).toHaveBeenLastCalledWith(
        audio,
        'melody-1',
        expect.any(Object),
      );
    });

    test('level 18 → SpringFestival', () => {
      playBGM(audio, 18);
      expect(loopPlayBGM).toHaveBeenLastCalledWith(
        audio,
        'melody-1',
        expect.any(Object),
      );
    });

    test('level 19 → FirstDivision', () => {
      playBGM(audio, 19);
      expect(loopPlayBGM).toHaveBeenLastCalledWith(
        audio,
        'melody-2',
        expect.any(Object),
      );
    });

    test('level 91 → JourneyToWest', () => {
      playBGM(audio, 91);
      expect(loopPlayBGM).toHaveBeenLastCalledWith(
        audio,
        'melody-9',
        expect.any(Object),
      );
    });

    test('level 99 → JourneyToWest', () => {
      playBGM(audio, 99);
      expect(loopPlayBGM).toHaveBeenLastCalledWith(
        audio,
        'melody-9',
        expect.any(Object),
      );
    });

    test('超出 max 等级时固定选最后一首', () => {
      playBGM(audio, 150);
      expect(loopPlayBGM).toHaveBeenLastCalledWith(
        audio,
        'melody-9',
        expect.any(Object),
      );
    });

    test('默认 level=1', () => {
      playBGM(audio);
      expect(loopPlayBGM).toHaveBeenLastCalledWith(
        audio,
        'melody-0',
        expect.any(Object),
      );
    });
  });

  describe('传递给 loopPlayBGM 的配置', () => {
    test('传递正确的曲目参数', () => {
      playBGM(audio, 28); // GongXiFaCai: index 3

      expect(loopPlayBGM).toHaveBeenCalledWith(
        audio,
        'melody-3',
        {
          duration: 100,
          volume: 0.07,
          wave: 'triangle',
          gate: 0.9,
          articulation: { attackTime: 0.005 },
        },
      );
    });
  });
});
