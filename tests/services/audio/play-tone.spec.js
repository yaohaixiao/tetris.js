import playTone from '@/lib/services/audio/play-tone.js';
import AudioState from '@/lib/services/audio/state/audio-state.js';

const mockSetValueAtTime = jest.fn();
const mockLinearRamp = jest.fn();
const mockExponentialRamp = jest.fn();
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockAddEventListener = jest.fn();
const mockOscDisconnect = jest.fn();
const mockGainDisconnect = jest.fn();

const createOscillator = jest.fn(() => ({
  type: '',
  frequency: { setValueAtTime: mockSetValueAtTime },
  connect: mockConnect,
  start: mockStart,
  stop: mockStop,
  disconnect: mockOscDisconnect,
  addEventListener: mockAddEventListener,
}));

const createGain = jest.fn(() => ({
  gain: {
    setValueAtTime: mockSetValueAtTime,
    linearRampToValueAtTime: mockLinearRamp,
    exponentialRampToValueAtTime: mockExponentialRamp,
  },
  connect: mockConnect,
  disconnect: mockGainDisconnect,
}));

const mockAudioContext = {
  currentTime: 100,
  destination: Symbol('destination'),
  createOscillator,
  createGain,
};

AudioState.audioCtx = mockAudioContext;

beforeEach(() => {
  jest.clearAllMocks();
  mockAudioContext.currentTime = 100;
});

// 辅助函数：获取最近一次创建的 osc 和 gain
const getOsc = () => createOscillator.mock.results.at(-1).value;
const getGain = () => createGain.mock.results.at(-1).value;

describe('playTone', () => {
  it('freq 为 0 时直接返回', () => {
    playTone(0, 200);
    expect(createOscillator).not.toHaveBeenCalled();
  });

  it('dur <= 0 时直接返回', () => {
    playTone(440, 0);
    expect(createOscillator).not.toHaveBeenCalled();
  });

  it('使用默认参数播放', () => {
    playTone(440, 200);

    const osc = getOsc();

    expect(createOscillator).toHaveBeenCalledTimes(1);
    expect(osc.type).toBe('square');
    expect(mockSetValueAtTime).toHaveBeenCalledWith(440, 100);
    expect(mockStart).toHaveBeenCalledWith(100);
    expect(mockStop).toHaveBeenCalledWith(100.25);
  });

  it('startTime 默认为 audioCtx.currentTime', () => {
    mockAudioContext.currentTime = 150;
    playTone(880, 300);
    expect(mockStart).toHaveBeenCalledWith(150);
  });

  it('使用自定义 startTime', () => {
    playTone(880, 300, { startTime: 200 });
    expect(mockStart).toHaveBeenCalledWith(200);
    expect(mockSetValueAtTime).toHaveBeenCalledWith(880, 200);
  });

  it('gate 影响实际发声时长', () => {
    playTone(440, 1000, { gate: 0.5 });

    const t3 = mockStop.mock.calls[0][0];
    expect(t3).toBeCloseTo(100.55, 5);
  });

  it('gate 为 1 时唱满全时值', () => {
    playTone(440, 1000, { gate: 1 });
    const t3 = mockStop.mock.calls[0][0];
    expect(t3).toBeCloseTo(101.05, 5);
  });

  it('articulation 控制包络时间节点', () => {
    playTone(440, 500, {
      articulation: { attackTime: 0.01, releaseTime: 0.05, sustainRatio: 0.8 },
    });

    expect(mockSetValueAtTime).toHaveBeenCalledTimes(3);
    expect(mockLinearRamp).toHaveBeenCalledTimes(1);
    expect(mockExponentialRamp).toHaveBeenCalledTimes(1);
  });

  it('osc 结束后断开所有节点', () => {
    playTone(440, 200);

    const endedCallback = mockAddEventListener.mock.calls[0][1];
    endedCallback();

    expect(mockOscDisconnect).toHaveBeenCalledTimes(1);
    expect(mockGainDisconnect).toHaveBeenCalledTimes(1);
  });

  it('节点连接链路正确', () => {
    playTone(440, 200);

    const osc = getOsc();
    const gain = getGain();

    expect(osc.connect).toHaveBeenCalledWith(gain);
    expect(gain.connect).toHaveBeenCalledWith(mockAudioContext.destination);
  });
});
