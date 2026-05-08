import playBGM from '@/lib/services/audio/play-bgm';
import AudioState from '@/lib/services/audio/state/audio-state';
import Musics from '@/lib/services/audio/constants/musics';
import Configuration from '@/lib/configuration';

jest.mock('@/lib/services/audio/state/audio-state', () => ({
  bgmEnabled: true,
  bgmTimer: null,
}));

jest.mock('@/lib/services/audio/constants/musics', () => ({
  TetrisTheme: {
    name: 'TetrisTheme',
    melody: [{ freq: 659, dur: 1.2 }],
    duration: 120,
    volume: 0.08,
  },
  JasmineFlower: {
    name: 'JasmineFlower',
    melody: [{ freq: 659, dur: 0.8 }],
    duration: 180,
    volume: 0.1,
  },
  FirstDivision: {
    name: 'FirstDivision',
    melody: [{ freq: 523, dur: 0.8 }],
    duration: 180,
    volume: 0.08,
  },
  Loginska: {
    name: 'Loginska',
    melody: [{ freq: 659, dur: 1.2 }],
    duration: 160,
    volume: 0.07,
  },
  Technotris: {
    name: 'Technotris',
    melody: [{ freq: 659, dur: 0.6 }],
    duration: 150,
    volume: 0.09,
  },
  Korobeiniki: {
    name: 'Korobeiniki',
    melody: [{ freq: 659, dur: 0.8 }],
    duration: 140,
    volume: 0.08,
  },
  BeyondTheWall: {
    name: 'BeyondTheWall',
    melody: [{ freq: 330, dur: 0.6 }],
    duration: 130,
    volume: 0.09,
  },
  JourneyToWest: {
    name: 'JourneyToWest',
    melody: [{ freq: 880, dur: 1.2 }],
    duration: 110,
    volume: 0.12,
  },
}));

jest.mock('@/lib/configuration', () => ({
  Level: { max: 99 },
}));

jest.mock('@/lib/services/audio/loop-play-bgm', () => jest.fn());
jest.mock('@/lib/services/audio/stop-bgm', () => jest.fn());

const loopPlayBGM = require('@/lib/services/audio/loop-play-bgm');
const stopBGM = require('@/lib/services/audio/stop-bgm');

describe('playBGM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AudioState.bgmEnabled = true;
  });

  // ========== BGM 关闭时不播放 ==========
  test('BGM 未开启时不播放也不停止', () => {
    AudioState.bgmEnabled = false;
    playBGM(1);

    expect(stopBGM).not.toHaveBeenCalled();
    expect(loopPlayBGM).not.toHaveBeenCalled();
  });

  // ========== 等级选歌 ==========
  test('level 1 播放第一首（TetrisTheme）', () => {
    playBGM(1);

    expect(stopBGM).toHaveBeenCalled();
    expect(loopPlayBGM).toHaveBeenCalledWith(
      0,
      [
        { freq: 659, dur: 1.2 },
      ],
      120,
      0.08
    );
  });

  test('level 13 播放第二首（JasmineFlower）', () => {
    playBGM(13);

    expect(loopPlayBGM).toHaveBeenCalledWith(
      0,
      [
        { freq: 659, dur: 0.8 },
      ],
      180,
      0.1
    );
  });

  test('level 25 播放第三首（FirstDivision）', () => {
    playBGM(25);

    expect(loopPlayBGM).toHaveBeenCalledWith(
      0,
      [
        { freq: 523, dur: 0.8 },
      ],
      180,
      0.08
    );
  });

  test('超过最大等级取最后一首（JourneyToWest）', () => {
    playBGM(99);

    expect(loopPlayBGM).toHaveBeenCalledWith(
      0,
      [
        { freq: 880, dur: 1.2 },
      ],
      110,
      0.12
    );
  });

  test('边界：level 12 仍为第一首', () => {
    playBGM(12);

    expect(loopPlayBGM).toHaveBeenCalledWith(
      0,
      expect.any(Array),
      120,
      0.08
    );
  });

  // ========== stopBGM 调用 ==========
  test('每次播放前都先停止', () => {
    playBGM(1);
    expect(stopBGM).toHaveBeenCalledTimes(1);

    playBGM(20);
    expect(stopBGM).toHaveBeenCalledTimes(2);
  });

  // ========== 默认 level ==========
  test('不传 level 默认 1', () => {
    playBGM();

    expect(loopPlayBGM).toHaveBeenCalledWith(
      0,
      expect.any(Array),
      120,
      0.08
    );
  });
});
