/** @jest-environment jsdom */

import playTone from '@/lib/services/audio/play-tone.js';

// Mock AudioState - 直接在 factory 中定义数据
jest.mock('@/lib/services/audio/state/audio-state.js', () => ({
  __esModule: true,
  default: {
    audioCtx: {
      currentTime: 100,
      createOscillator: jest.fn(),
      createGain: jest.fn(),
      destination: Symbol('destination'),
    },
  },
}));

describe('playTone', () => {
  let mockOsc;
  let mockGain;
  let audioCtx;

  beforeEach(() => {
    jest.clearAllMocks();

    // 动态导入 AudioState 获取 mock 的 audioCtx 引用
    const AudioState = require('@/lib/services/audio/state/audio-state.js').default;
    audioCtx = AudioState.audioCtx;

    // 创建 mock 音频节点
    mockGain = {
      gain: {
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
      disconnect: jest.fn(),
    };

    mockOsc = {
      type: '',
      frequency: {
        setValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      addEventListener: jest.fn(),
    };

    audioCtx.createOscillator.mockReturnValue(mockOsc);
    audioCtx.createGain.mockReturnValue(mockGain);
    audioCtx.currentTime = 100;
  });

  // ==================== 参数校验 ====================
  describe('参数校验', () => {
    it('freq 为 0 时应该直接返回不播放', () => {
      playTone(0, 200);

      expect(audioCtx.createOscillator).not.toHaveBeenCalled();
    });

    it('freq 为 null 时应该直接返回不播放', () => {
      playTone(null, 200);

      expect(audioCtx.createOscillator).not.toHaveBeenCalled();
    });

    it('freq 为 undefined 时应该直接返回不播放', () => {
      playTone(undefined, 200);

      expect(audioCtx.createOscillator).not.toHaveBeenCalled();
    });

    it('freq 为 false 时应该直接返回不播放', () => {
      playTone(false, 200);

      expect(audioCtx.createOscillator).not.toHaveBeenCalled();
    });

    it('dur 小于等于 0 时应该直接返回不播放', () => {
      playTone(440, 0);
      expect(audioCtx.createOscillator).not.toHaveBeenCalled();

      playTone(440, -100);
      expect(audioCtx.createOscillator).not.toHaveBeenCalled();
    });

    it('有效的参数应该正常播放', () => {
      playTone(440, 200);

      expect(audioCtx.createOscillator).toHaveBeenCalled();
      expect(audioCtx.createGain).toHaveBeenCalled();
    });
  });

  // ==================== 默认参数 ====================
  describe('默认参数', () => {
    it('不传 options 时应该使用默认值', () => {
      playTone(440, 200);

      expect(mockOsc.type).toBe('square');
      expect(mockOsc.frequency.setValueAtTime).toHaveBeenCalledWith(440, 100);
    });

    it('应该使用默认包络参数', () => {
      playTone(440, 200);

      // t0 = 100
      // t1 = 100 + 0.003 = 100.003
      // noteLen = 0.2 * 1 = 0.2
      // t2 = 100 + max(0.2 - 0.02, 0.003) = 100.18
      // t3 = 100 + 0.2 = 100.2
      expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, 100);
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15,
        100.003,
      );
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15 * 0.9,
        100.18,
      );
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.0001,
        100.2,
      );
    });
  });

  // ==================== 波形类型 ====================
  describe('波形类型', () => {
    it('应该支持 sine 波形', () => {
      playTone(440, 200, { wave: 'sine' });

      expect(mockOsc.type).toBe('sine');
    });

    it('应该支持 square 波形', () => {
      playTone(440, 200, { wave: 'square' });

      expect(mockOsc.type).toBe('square');
    });

    it('应该支持 sawtooth 波形', () => {
      playTone(440, 200, { wave: 'sawtooth' });

      expect(mockOsc.type).toBe('sawtooth');
    });

    it('应该支持 triangle 波形', () => {
      playTone(440, 200, { wave: 'triangle' });

      expect(mockOsc.type).toBe('triangle');
    });
  });

  // ==================== 音量控制 ====================
  describe('音量控制', () => {
    it('应该支持自定义音量', () => {
      playTone(440, 200, { volume: 0.3 });

      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.3,
        100.003,
      );
    });

    it('音量设为 0 时应该可以播放', () => {
      playTone(440, 200, { volume: 0 });

      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0,
        100.003,
      );
    });
  });

  // ==================== gate 参数 ====================
  describe('gate 参数', () => {
    it('gate = 0.5 时音符时值应该减半', () => {
      playTone(440, 200, { gate: 0.5 });

      // noteLen = 0.2 * 0.5 = 0.1
      // t2 = 100 + max(0.1 - 0.02, 0.003) = 100.08
      // t3 = 100 + 0.1 = 100.1
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15 * 0.9,
        100.08,
      );
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.0001,
        100.1,
      );
    });

    it('gate = 1 时应该唱满时值（连奏）', () => {
      playTone(440, 200, { gate: 1 });

      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.0001,
        100.2,
      );
    });
  });

  // ==================== 包络参数 ====================
  describe('包络参数 articulation', () => {
    it('应该支持自定义 attackTime', () => {
      playTone(440, 200, {
        articulation: { attackTime: 0.01 },
      });

      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15,
        100.01,
      );
    });

    it('应该支持自定义 releaseTime', () => {
      playTone(440, 200, {
        articulation: { releaseTime: 0.05 },
      });

      // noteLen = 0.2
      // t2 = 100 + max(0.2 - 0.05, 0.003) = 100.15
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15 * 0.9,
        100.15,
      );
    });

    it('应该支持自定义 sustainRatio', () => {
      playTone(440, 200, {
        articulation: { sustainRatio: 0.5 },
      });

      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15 * 0.5,
        100.18,
      );
    });

    it('releaseTime 大于 noteLen 时 t2 应该等于 t1', () => {
      playTone(440, 100, {
        articulation: { releaseTime: 0.5 },
      });

      // noteLen = 0.1
      // t2 = 100 + max(0.1 - 0.5, 0.003) = 100.003
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15 * 0.9,
        100.003,
      );
    });

    it('attackTime 为 0 时应该可以工作', () => {
      playTone(440, 200, {
        articulation: { attackTime: 0 },
      });

      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15,
        100,
      );
    });
  });

  // ==================== startTime ====================
  describe('startTime 参数', () => {
    it('不传 startTime 时应该使用 audioCtx.currentTime', () => {
      audioCtx.currentTime = 200;

      playTone(440, 200);

      expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, 200);
    });

    it('应该支持自定义 startTime', () => {
      playTone(440, 200, { startTime: 300 });

      expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, 300);
      expect(mockOsc.frequency.setValueAtTime).toHaveBeenCalledWith(440, 300);
    });

    it('自定义 startTime 时包络时间应该基于 startTime 计算', () => {
      playTone(440, 200, { startTime: 500 });

      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.0001,
        500.2,
      );
    });
  });

  // ==================== 节点连接 ====================
  describe('节点连接', () => {
    it('应该正确连接音频链路', () => {
      playTone(440, 200);

      expect(mockOsc.connect).toHaveBeenCalledWith(mockGain);
      expect(mockGain.connect).toHaveBeenCalledWith(audioCtx.destination);
    });
  });

  // ==================== 启动和停止 ====================
  describe('启动和停止', () => {
    it('应该在 startTime 启动振荡器', () => {
      playTone(440, 200, { startTime: 300 });

      expect(mockOsc.start).toHaveBeenCalledWith(300);
    });

    it('应该在 t3 + 0.05 停止振荡器', () => {
      playTone(440, 200);

      // t3 = 100.2, stop = 100.25
      expect(mockOsc.stop).toHaveBeenCalledWith(100.25);
    });

    it('默认 startTime 应该使用 audioCtx.currentTime', () => {
      playTone(440, 200);

      expect(mockOsc.start).toHaveBeenCalledWith(100);
    });
  });

  // ==================== 资源释放 ====================
  describe('资源释放', () => {
    it('应该注册 ended 事件监听', () => {
      playTone(440, 200);

      expect(mockOsc.addEventListener).toHaveBeenCalledWith(
        'ended',
        expect.any(Function),
      );
    });

    it('ended 事件触发时应该断开节点连接', () => {
      playTone(440, 200);

      const endedCallback = mockOsc.addEventListener.mock.calls.find(
        ([event]) => event === 'ended',
      )[1];

      endedCallback();

      expect(mockOsc.disconnect).toHaveBeenCalled();
      expect(mockGain.disconnect).toHaveBeenCalled();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('freq 为负数时应该可以播放', () => {
      playTone(-440, 200);

      expect(mockOsc.frequency.setValueAtTime).toHaveBeenCalledWith(-440, 100);
    });

    it('freq 很大时应该可以播放', () => {
      playTone(20000, 200);

      expect(mockOsc.frequency.setValueAtTime).toHaveBeenCalledWith(20000, 100);
    });

    it('dur 很小时应该可以播放', () => {
      playTone(440, 1);

      expect(mockOsc.start).toHaveBeenCalled();
    });

    it('options 为空对象时应该正常播放', () => {
      playTone(440, 200, {});

      expect(mockOsc.type).toBe('square');
    });

    it('articulation 为空对象时应该使用默认值', () => {
      playTone(440, 200, { articulation: {} });

      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.15,
        100.003,
      );
    });
  });

  // ==================== 完整参数 ====================
  describe('完整参数场景', () => {
    it('应该正确处理所有自定义参数', () => {
      playTone(880, 50, {
        volume: 0.12,
        wave: 'triangle',
        gate: 0.4,
        articulation: {
          attackTime: 0.001,
          releaseTime: 0.01,
          sustainRatio: 0.3,
        },
        startTime: 200,
      });

      expect(mockOsc.type).toBe('triangle');
      expect(mockOsc.frequency.setValueAtTime).toHaveBeenCalledWith(880, 200);
      expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, 200);
      // t1 = 200.001
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.12,
        200.001,
      );
      // noteLen = 0.05 * 0.4 = 0.02
      // t2 = 200 + max(0.02 - 0.01, 0.001) = 200.01
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.12 * 0.3,
        200.01,
      );
      // t3 = 200.02
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.0001,
        200.02,
      );
      expect(mockOsc.start).toHaveBeenCalledWith(200);
      // stop = 200.02 + 0.05 = 200.07（浮点数有精度问题，只用 closeTo）
      expect(mockOsc.stop.mock.calls[0][0]).toBeCloseTo(200.07, 5);
    });
  });
});
