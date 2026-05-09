import loopPlayBGM from '@/lib/services/audio/loop-play-bgm.js';
import * as playToneModule from '@/lib/services/audio/play-tone.js';
import AudioState from '@/lib/services/audio/state/audio-state.js';

jest.mock('@/lib/services/audio/play-tone.js');

const mockPlayTone = playToneModule.default;

const mockAudioContext = {
  currentTime: 100,
  destination: Symbol('destination'),
  createOscillator: jest.fn(() => ({
    type: '',
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn(),
    addEventListener: jest.fn(),
  })),
  createGain: jest.fn(() => ({
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
};

AudioState.audioCtx = mockAudioContext;

const melody = [
  { freq: 440, dur: 1.0 },
  { freq: 880, dur: 2.0 },
  { freq: 0, dur: 1.5 },
];

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockAudioContext.currentTime = 100;
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('loopPlayBGM', () => {
  it('启动后立即调度第一个音符', () => {
    loopPlayBGM(melody, { duration: 200 });
    expect(mockPlayTone).toHaveBeenCalledTimes(1);
    expect(mockPlayTone).toHaveBeenCalledWith(
      440,
      200,
      expect.objectContaining({ startTime: 100 }),
    );
  });

  it('将 options 透传给 playTone', () => {
    const articulation = { attackTime: 0.02 };
    loopPlayBGM(melody, {
      duration: 250,
      volume: 0.2,
      wave: 'triangle',
      gate: 0.5,
      articulation,
    });
    expect(mockPlayTone).toHaveBeenCalledWith(
      440,
      250,
      expect.objectContaining({
        volume: 0.2,
        wave: 'triangle',
        gate: 0.5,
        articulation,
      }),
    );
  });

  it('未传 options 时使用默认值', () => {
    loopPlayBGM(melody);
    expect(mockPlayTone).toHaveBeenCalledWith(
      440,
      110,
      expect.objectContaining({
        volume: 0.05,
        wave: 'square',
        gate: 1,
      }),
    );
  });

  it('休止符不调用 playTone', () => {
    loopPlayBGM(
      [
        { freq: 0, dur: 1.0 },
        { freq: 440, dur: 1.0 },
      ],
      { duration: 200 },
    );

    // 第一个音符是休止符，不应调用 playTone
    expect(mockPlayTone).toHaveBeenCalledTimes(0);

    // 推进 currentTime 和 fake timers，让第二个音符落入调度窗口
    mockAudioContext.currentTime = 100.2; // 第一个音符时长 = 200ms = 0.2s
    jest.advanceTimersByTime(30);
    jest.runOnlyPendingTimers();

    expect(mockPlayTone).toHaveBeenCalledTimes(1);
    expect(mockPlayTone).toHaveBeenCalledWith(440, 200, expect.any(Object));
  });

  it('nextNoteTime 随音符时长递增', () => {
    loopPlayBGM(melody, { duration: 200 });

    const firstStartTime = mockPlayTone.mock.calls[0][2].startTime;
    expect(firstStartTime).toBe(100);

    jest.advanceTimersByTime(30);
    mockAudioContext.currentTime = 100.2;
    jest.runOnlyPendingTimers();

    const secondStartTime = mockPlayTone.mock.calls[1][2].startTime;
    expect(secondStartTime).toBeCloseTo(100.2, 5);
  });

  it('到达旋律末尾后循环回到开头', () => {
    loopPlayBGM(melody, { duration: 500 });

    for (let i = 0; i < melody.length; i++) {
      mockAudioContext.currentTime += 0.5;
      jest.advanceTimersByTime(30);
      jest.runOnlyPendingTimers();
    }

    const lastCallIndex = mockPlayTone.mock.calls.length - 1;
    const lastStartTime = mockPlayTone.mock.calls[lastCallIndex][2].startTime;
    expect(lastStartTime).toBeGreaterThan(100);
  });
});
