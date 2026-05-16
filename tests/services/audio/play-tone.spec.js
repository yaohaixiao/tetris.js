import playTone from '@/lib/services/audio/play-tone';

const mockOscillator = {
  type: '',
  frequency: { setValueAtTime: jest.fn() },
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  disconnect: jest.fn(),
};

const mockGainNode = {
  gain: {
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
  connect: jest.fn(),
  disconnect: jest.fn(),
};

const mockAudioContext = {
  currentTime: 100,
  createOscillator: jest.fn(() => mockOscillator),
  createGain: jest.fn(() => mockGainNode),
  destination: {},
};

const createAudio = () => ({ Context: mockAudioContext });

describe('playTone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('参数校验', () => {
    test('freq 为 0 时应提前返回，不创建音频节点', () => {
      playTone(createAudio(), 0, 200);

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
      expect(mockAudioContext.createGain).not.toHaveBeenCalled();
    });

    test('freq 为 null 时应提前返回', () => {
      playTone(createAudio(), null, 200);

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    test('freq 为 undefined 时应提前返回', () => {
      playTone(createAudio(), undefined, 200);

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    test('dur 为 0 时应提前返回', () => {
      playTone(createAudio(), 440, 0);

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    test('dur 为负数时应提前返回', () => {
      playTone(createAudio(), 440, -100);

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe('振荡器配置', () => {
    test('默认使用 square 波形', () => {
      playTone(createAudio(), 440, 200);

      expect(mockOscillator.type).toBe('square');
    });

    test('支持 sine 波形', () => {
      playTone(createAudio(), 440, 200, { wave: 'sine' });

      expect(mockOscillator.type).toBe('sine');
    });

    test('支持 triangle 波形', () => {
      playTone(createAudio(), 440, 200, { wave: 'triangle' });

      expect(mockOscillator.type).toBe('triangle');
    });

    test('支持 sawtooth 波形', () => {
      playTone(createAudio(), 440, 200, { wave: 'sawtooth' });

      expect(mockOscillator.type).toBe('sawtooth');
    });

    test('在指定时间设置频率值', () => {
      playTone(createAudio(), 880, 200);

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 100);
    });
  });

  describe('音频节点连接', () => {
    test('振荡器 → 增益节点 → 音频输出', () => {
      playTone(createAudio(), 440, 200);

      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });
  });

  describe('startTime', () => {
    test('默认使用 AudioContext.currentTime', () => {
      playTone(createAudio(), 440, 200);

      expect(mockOscillator.start).toHaveBeenCalledWith(100);
    });

    test('支持自定义 startTime', () => {
      playTone(createAudio(), 440, 200, { startTime: 105.5 });

      expect(mockOscillator.start).toHaveBeenCalledWith(105.5);
    });
  });

  describe('gate 参数 — 发音占比', () => {
    test('gate=1 连奏：实际发声时长为完整时长', () => {
      playTone(createAudio(), 440, 200, { gate: 1 });

      // noteLen = 0.2 * 1 = 0.2
      // t3 = 100 + 0.2 = 100.2
      // stop = 100.2 + 0.05 = 100.25
      expect(mockOscillator.stop).toHaveBeenCalledWith(100.25);
    });

    test('gate=0.5 断奏：实际发声时长减半', () => {
      playTone(createAudio(), 440, 200, { gate: 0.5 });

      // noteLen = 0.2 * 0.5 = 0.1
      // t3 = 100.1
      // stop = 100.15 → 浮点数为 100.14999999999999
      expect(mockOscillator.stop).toHaveBeenCalledWith(100.14999999999999);
    });

    test('gate=0.2 极短断奏', () => {
      playTone(createAudio(), 440, 500, { gate: 0.2 });

      // noteLen = 0.5 * 0.2 = 0.1
      // stop = 100.15 → 浮点数为 100.14999999999999
      expect(mockOscillator.stop).toHaveBeenCalledWith(100.14999999999999);
    });
  });

  describe('AD 包络 — 默认参数', () => {
    test('attackTime 默认 0.003s', () => {
      playTone(createAudio(), 440, 300, { volume: 0.15 });

      const t0 = 100;
      const t1 = t0 + 0.003;

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, t0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.15, t1);
    });

    test('sustainRatio 默认 0.9', () => {
      playTone(createAudio(), 440, 300, { volume: 0.15 });

      // noteLen = 0.3
      // t2 = 100 + max(0.3 - 0.02, 0.003) = 100.28
      const t2 = 100.28;

      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15 * 0.9,
        t2,
      );
    });

    test('releaseTime 默认 0.02s', () => {
      playTone(createAudio(), 440, 300, { volume: 0.15 });

      const t3 = 100.3;

      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.0001, t3);
    });
  });

  describe('AD 包络 — 自定义参数', () => {
    test('自定义 attackTime', () => {
      playTone(createAudio(), 440, 300, {
        volume: 0.2,
        articulation: { attackTime: 0.01 },
      });

      const t1 = 100.01;

      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.2, t1);
    });

    test('自定义 sustainRatio', () => {
      playTone(createAudio(), 440, 300, {
        volume: 0.2,
        articulation: { sustainRatio: 0.5 },
      });

      // t2 = 100 + max(0.3 - 0.02, 0.003) = 100.28
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.2 * 0.5,
        100.28,
      );
    });

    test('自定义 releaseTime', () => {
      playTone(createAudio(), 440, 300, {
        volume: 0.2,
        articulation: { releaseTime: 0.05 },
      });

      // t3 = 100.3
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.0001, 100.3);
    });

    test('完整自定义 articulation', () => {
      playTone(createAudio(), 440, 300, {
        volume: 0.25,
        articulation: { attackTime: 0.005, releaseTime: 0.04, sustainRatio: 0.6 },
      });

      const t0 = 100;
      const t1 = 100.005;
      const t2 = 100 + Math.max(0.3 - 0.04, 0.005); // 100.26
      const t3 = 100.3;

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, t0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.25, t1);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.25 * 0.6, t2);
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.0001, t3);
    });
  });

  describe('边界情况：releaseTime 长于 noteLen', () => {
    test('t2 不小于 attackTime', () => {
      playTone(createAudio(), 440, 20, {
        articulation: { attackTime: 0.005, releaseTime: 0.1 },
      });

      // t1 = 100.005, t2 也应为 100.005
      const calls = mockGainNode.gain.linearRampToValueAtTime.mock.calls;
      const t2Call = calls.find((call) => call[1] === 100.005);

      expect(t2Call).toBeTruthy();
    });
  });

  describe('stop 缓冲', () => {
    test('stop 始终比包络结束晚 50ms', () => {
      playTone(createAudio(), 440, 200);

      // dur=200ms, gate=1, noteLen=0.2, t3=100.2, stop=100.25
      expect(mockOscillator.stop).toHaveBeenCalledWith(100.25);
    });
  });

  describe('资源释放', () => {
    test('ended 事件触发后断开所有连接', () => {
      let endedCallback;
      mockOscillator.addEventListener.mockImplementation((event, cb) => {
        if (event === 'ended') {
          endedCallback = cb;
        }
      });

      playTone(createAudio(), 440, 200);

      endedCallback();

      expect(mockOscillator.disconnect).toHaveBeenCalled();
      expect(mockGainNode.disconnect).toHaveBeenCalled();
    });
  });

  describe('默认音量', () => {
    test('不传 volume 时使用 0.15', () => {
      playTone(createAudio(), 440, 200);

      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15,
        expect.any(Number),
      );
    });
  });
});
