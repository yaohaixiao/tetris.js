import playBGM from '@/lib/services/audio/play-bgm.js';
import loopPlayBGM from '@/lib/services/audio/loop-play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';
import AudioState from '@/lib/services/audio/state/audio-state.js';
import Configuration from '@/lib/configuration.js';
import Musics from '@/lib/services/audio/constants/musics.js';

jest.mock('@/lib/services/audio/loop-play-bgm.js');
jest.mock('@/lib/services/audio/stop-bgm.js');
jest.mock('@/lib/configuration.js', () => ({
  Level: { max: 100 },
}));
jest.mock('@/lib/services/audio/constants/musics.js', () => ({
  TetrisTheme: {
    melody: [{ freq: 880, dur: 1 }],
    duration: 220,
    volume: 0.08,
    wave: 'square',
    gate: 0.6,
    articulation: { sustainRatio: 0.05 },
  },
  SpringFestival: {
    melody: [{ freq: 523, dur: 0.6 }],
    duration: 280,
    volume: 0.08,
    wave: 'square',
    gate: 0.7,
    articulation: { sustainRatio: 0.5 },
  },
  FirstDivision: {
    melody: [],
    duration: 200,
    volume: 0.1,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
  GongXiFaCai: {
    melody: [{ freq: 523, dur: 0.5 }],
    duration: 260,
    volume: 0.08,
    wave: 'square',
    gate: 0.8,
    articulation: { sustainRatio: 0.6 },
  },
  Loginska: {
    melody: [],
    duration: 200,
    volume: 0.1,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
  BeyondTheWall: {
    melody: [],
    duration: 200,
    volume: 0.1,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
  Technotris: {
    melody: [],
    duration: 200,
    volume: 0.1,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
  GoldenSnakeDance: {
    melody: [{ freq: 659, dur: 0.3 }],
    duration: 200,
    volume: 0.08,
    wave: 'square',
    gate: 0.6,
    articulation: { sustainRatio: 0.4 },
  },
  Korobeiniki: {
    melody: [],
    duration: 200,
    volume: 0.1,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
  JourneyToWest: {
    melody: [],
    duration: 200,
    volume: 0.1,
    wave: 'square',
    gate: 1,
    articulation: {},
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  AudioState.bgmEnabled = true;
});

describe('playBGM', () => {
  it('bgmEnabled 为 false 时直接返回', () => {
    AudioState.bgmEnabled = false;
    playBGM(1);
    expect(stopBGM).not.toHaveBeenCalled();
    expect(loopPlayBGM).not.toHaveBeenCalled();
  });

  it('播放前先停止当前 BGM', () => {
    playBGM(1);
    expect(stopBGM).toHaveBeenCalledTimes(1);
  });

  it('等级 1 播放 TetrisTheme', () => {
    playBGM(1);
    expect(loopPlayBGM).toHaveBeenCalledWith(
      Musics.TetrisTheme.melody,
      expect.objectContaining({
        duration: 220,
        volume: 0.08,
        wave: 'square',
        gate: 0.6,
      }),
    );
  });

  it('等级 11 播放 SpringFestival', () => {
    playBGM(11);
    expect(loopPlayBGM).toHaveBeenCalledWith(
      Musics.SpringFestival.melody,
      expect.objectContaining({ duration: 280, gate: 0.7 }),
    );
  });

  it('等级 31 播放 GongXiFaCai', () => {
    playBGM(31);
    expect(loopPlayBGM).toHaveBeenCalledWith(
      Musics.GongXiFaCai.melody,
      expect.objectContaining({ duration: 260, gate: 0.8 }),
    );
  });

  it('等级 71 播放 GoldenSnakeDance', () => {
    playBGM(71);
    expect(loopPlayBGM).toHaveBeenCalledWith(
      Musics.GoldenSnakeDance.melody,
      expect.objectContaining({ duration: 200, gate: 0.6 }),
    );
  });

  it('等级超出上限时选取最后一首', () => {
    playBGM(999);
    expect(loopPlayBGM).toHaveBeenCalledWith(
      Musics.JourneyToWest.melody,
      expect.objectContaining({ duration: 200 }),
    );
  });

  it('articulation 参数被正确传递', () => {
    playBGM(1);
    expect(loopPlayBGM).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        articulation: { sustainRatio: 0.05 },
      }),
    );
  });
});
