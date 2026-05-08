/** @jest-environment jsdom */

import playTone from '@/lib/services/audio/play-tone';

describe('playTone', () => {
  let createOscSpy;
  let createGainSpy;

  beforeEach(() => {
    createOscSpy = jest.spyOn(AudioContext.prototype, 'createOscillator');
    createGainSpy = jest.spyOn(AudioContext.prototype, 'createGain');
  });

  afterEach(() => {
    createOscSpy.mockRestore();
    createGainSpy.mockRestore();
  });

  test('频率为 0 时不创建 oscillator', () => {
    playTone(0, 100);

    expect(createOscSpy).not.toHaveBeenCalled();
    expect(createGainSpy).not.toHaveBeenCalled();
  });

  test('正常播放：设置频率和波形', () => {
    // 准备 spy 返回值
    const mockOsc = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      addEventListener: jest.fn(),
      disconnect: jest.fn(),
      type: '',
      frequency: { value: 0 },
    };

    const mockGain = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: {
        value: 0,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
    };

    createOscSpy.mockReturnValue(mockOsc);
    createGainSpy.mockReturnValue(mockGain);

    playTone(880, 200, 0.5, 'sine');

    expect(mockOsc.frequency.value).toBe(880);
    expect(mockOsc.type).toBe('sine');
    expect(mockOsc.start).toHaveBeenCalled();
    expect(mockOsc.stop).toHaveBeenCalled();
  });

  test('默认参数：音量和波形', () => {
    const mockOsc = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      addEventListener: jest.fn(),
      disconnect: jest.fn(),
      type: '',
      frequency: { value: 0 },
    };

    const mockGain = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: {
        value: 0,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
    };

    createOscSpy.mockReturnValue(mockOsc);
    createGainSpy.mockReturnValue(mockGain);

    playTone(440, 100);

    expect(mockOsc.type).toBe('square');
    expect(mockGain.gain.value).toBe(0.1);
  });

  test('ended 事件清理', () => {
    const mockOsc = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      addEventListener: jest.fn(),
      disconnect: jest.fn(),
      type: '',
      frequency: { value: 0 },
    };

    const mockGain = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: {
        value: 0,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
    };

    createOscSpy.mockReturnValue(mockOsc);
    createGainSpy.mockReturnValue(mockGain);

    playTone(440, 100);

    const endedCall = mockOsc.addEventListener.mock.calls.find(
      (call) => call[0] === 'ended',
    );
    expect(endedCall).toBeDefined();

    const endedCallback = endedCall[1];
    endedCallback();

    expect(mockOsc.disconnect).toHaveBeenCalled();
    expect(mockGain.disconnect).toHaveBeenCalled();
  });
});
