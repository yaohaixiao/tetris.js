import loopPlayBGM from '@/lib/services/audio/loop-play-bgm';
import AudioState from '@/lib/services/audio/state/audio-state';

jest.mock('@/lib/services/audio/state/audio-state', () => ({
  bgmTimer: null,
}));

jest.mock('@/lib/services/audio/play-tone', () => jest.fn());

const playTone = require('@/lib/services/audio/play-tone');

describe('loopPlayBGM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    AudioState.bgmTimer = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const melody = [
    { freq: 440, dur: 1.0 },
    { freq: 523, dur: 0.5 },
    { freq: 0, dur: 0.5 }, // 休止符
    { freq: 659, dur: 2.0 },
  ];

  // ========== 基础播放 ==========
  test('播放第一个音符', () => {
    loopPlayBGM(0, melody, 200, 0.1, 'square');

    // gate for square = 0.96
    // duration = 1.0 * 200 = 200ms
    // playDur = 200 * 0.96 = 192ms
    expect(playTone).toHaveBeenCalledWith(440, 192, 0.1, 'square');
  });

  test('播放第二个音符', () => {
    loopPlayBGM(1, melody, 200, 0.1, 'square');

    // duration = 0.5 * 200 = 100ms
    // playDur = 100 * 0.96 = 96ms
    expect(playTone).toHaveBeenCalledWith(523, 96, 0.1, 'square');
  });

  test('休止符不调用 playTone', () => {
    loopPlayBGM(2, melody, 200, 0.1, 'square');

    expect(playTone).not.toHaveBeenCalled();
  });

  // ========== 波形影响 gate ==========
  test('square 波形 gate = 0.96', () => {
    loopPlayBGM(0, melody, 100, 0.1, 'square');
    // dur = 1.0 * 100 = 100, playDur = 100 * 0.96 = 96
    expect(playTone).toHaveBeenCalledWith(440, 96, 0.1, 'square');
  });

  test('sine 波形 gate = 0.85', () => {
    loopPlayBGM(0, melody, 100, 0.1, 'sine');
    // dur = 1.0 * 100 = 100, playDur = 100 * 0.85 = 85
    expect(playTone).toHaveBeenCalledWith(440, 85, 0.1, 'sine');
  });

  test('triangle 波形 gate = 0.93', () => {
    loopPlayBGM(0, melody, 100, 0.1, 'triangle');
    // dur = 1.0 * 100 = 100, playDur = 100 * 0.93 = 93
    expect(playTone).toHaveBeenCalledWith(440, 93, 0.1, 'triangle');
  });

  // ========== setTimeout 调度下一音符 ==========
  test('调度下一个音符', () => {
    loopPlayBGM(0, melody, 200, 0.1, 'square');

    expect(AudioState.bgmTimer).not.toBeNull();

    // duration = 200ms 后调度下一帧
    jest.advanceTimersByTime(200);

    // i + 1 = 1 被调用
    expect(playTone).toHaveBeenCalledTimes(1 + 1); // 第一个 + 第二个
  });

  test('循环回到开头', () => {
    loopPlayBGM(3, melody, 200, 0.1, 'square');

    // duration = 2.0 * 200 = 400ms
    jest.advanceTimersByTime(400);

    // i = 3 + 1 = 4 >= melody.length → i = 0
    expect(playTone).toHaveBeenCalledTimes(1 + 1);
  });

  test('多次推进循环', () => {
    loopPlayBGM(0, melody, 200, 0.1, 'square');

    // 推进 4 个音符的时间
    // 0: 200ms → 1: 100ms → 2: 100ms → 3: 400ms → 回到 0
    jest.advanceTimersByTime(200 + 100 + 100 + 400);

    // 休止符 i=2 不算，有效音符：0, 1, 3（最后循环回 0）
    expect(playTone).toHaveBeenCalledTimes(4);
  });

  // ========== 默认参数 ==========
  test('默认 baseDur = 110', () => {
    loopPlayBGM(0, melody);

    const call = playTone.mock.calls[0];
    // dur = 1.0 * 110 = 110, gate = 0.96, playDur = 110 * 0.96 = 105.6
    expect(call[1]).toBeCloseTo(105.6, 0);
  });

  test('默认 vol = 0.05', () => {
    loopPlayBGM(0, melody);

    expect(playTone).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      0.05,
      'square',
    );
  });

  test('默认 wave = "square"', () => {
    loopPlayBGM(0, melody, 110, 0.05);

    expect(playTone).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      0.05,
      'square',
    );
  });
});
