/** @jest-environment jsdom */

import Audio from '@/lib/services/audio';
import playBGM from '@/lib/services/audio/play-bgm';
import stopBGM from '@/lib/services/audio/stop-bgm';
import toggleBGM from '@/lib/services/audio/toggle-bgm';
import isFunction from '@/lib/utils/is-function';

// Mock AudioContext
const mockAudioContext = {
  close: jest.fn(),
};
global.AudioContext = jest.fn(() => mockAudioContext);

// Mock Base
jest.mock('@/lib/core', () => {
  return jest.fn().mockImplementation(function (options) {
    Object.assign(this, options);
    this.on = jest.fn();
    this.off = jest.fn();
    this.emit = jest.fn();
  });
});

// Mock Sounds
const mockSounds = {
  CLEAR: jest.fn(),
  LEVEL_UP: jest.fn(),
  GAME_OVER: jest.fn(),
};
jest.mock('@/lib/services/audio/sounds', () => {
  return jest.fn().mockImplementation(function (options) {
    Object.assign(this, options);
    return mockSounds;
  });
});

// Mock playBGM / stopBGM / toggleBGM
jest.mock('@/lib/services/audio/play-bgm', () => jest.fn());
jest.mock('@/lib/services/audio/stop-bgm', () => jest.fn());
jest.mock('@/lib/services/audio/toggle-bgm', () => jest.fn());

// Mock isFunction
jest.mock('@/lib/utils/is-function', () => jest.fn());

describe('Audio', () => {
  let audio;

  beforeEach(() => {
    jest.clearAllMocks();
    isFunction.mockReturnValue(true);

    audio = new Audio({
      Scheduler: {},
      Level: { max: 15 },
    });
  });

  // ==================== 初始化 ====================

  describe('初始化', () => {
    test('创建 AudioContext 实例', () => {
      expect(global.AudioContext).toHaveBeenCalled();
    });

    test('Context 挂载到实例', () => {
      expect(audio.Context).toBe(mockAudioContext);
    });

    test('创建 Sounds 实例并传入 Context', () => {
      const Sounds = require('@/lib/services/audio/sounds');
      expect(Sounds).toHaveBeenCalledWith(
        expect.objectContaining({ Context: mockAudioContext }),
      );
    });

    test('bgmSchedulerId 初始为 0', () => {
      expect(audio.bgmSchedulerId).toBe(0);
    });
  });

  // ==================== playBGM ====================

  describe('playBGM', () => {
    test('调用 playBGM 函数传入自身和 level', () => {
      audio.playBGM(5);

      expect(playBGM).toHaveBeenCalledWith(audio, 5);
    });

    test('默认 level 为 undefined', () => {
      audio.playBGM();

      expect(playBGM).toHaveBeenCalledWith(audio, undefined);
    });
  });

  // ==================== stopBGM ====================

  describe('stopBGM', () => {
    test('调用 stopBGM 函数传入自身', () => {
      audio.stopBGM();

      expect(stopBGM).toHaveBeenCalledWith(audio);
    });
  });

  // ==================== toggleBGM ====================

  describe('toggleBGM', () => {
    test('调用 toggleBGM 函数传入自身和 level', () => {
      audio.toggleBGM(3);

      expect(toggleBGM).toHaveBeenCalledWith(audio, 3);
    });
  });

  // ==================== subscribe ====================

  describe('subscribe', () => {
    test('注册 bgm 事件监听', () => {
      audio.subscribe();

      expect(audio.on).toHaveBeenCalledWith(
        'audio:resume:bgm',
        audio._onPlayBGM,
      );
      expect(audio.on).toHaveBeenCalledWith('audio:stop:bgm', audio._onStopBGM);
      expect(audio.on).toHaveBeenCalledWith(
        'audio:toggle:bgm',
        audio._onToggleBGM,
      );
    });

    test('注册 sound 事件监听', () => {
      audio.subscribe();

      expect(audio.on).toHaveBeenCalledWith(
        'audio:play:sound',
        audio._onPlaySound,
      );
    });

    test('总共注册 4 个事件', () => {
      audio.subscribe();

      expect(audio.on).toHaveBeenCalledTimes(4);
    });
  });

  // ==================== unsubscribe ====================

  describe('unsubscribe', () => {
    test('解绑 bgm 事件', () => {
      audio.unsubscribe();

      expect(audio.off).toHaveBeenCalledWith(
        'audio:resume:bgm',
        audio._onPlayBGM,
      );
      expect(audio.off).toHaveBeenCalledWith(
        'audio:stop:bgm',
        audio._onStopBGM,
      );
      expect(audio.off).toHaveBeenCalledWith(
        'audio:toggle:bgm',
        audio._onToggleBGM,
      );
    });

    test('解绑 sound 事件', () => {
      audio.unsubscribe();

      expect(audio.off).toHaveBeenCalledWith(
        'audio:play:sound',
        audio._onPlaySound,
      );
    });

    test('总共解绑 4 个事件', () => {
      audio.unsubscribe();

      expect(audio.off).toHaveBeenCalledTimes(4);
    });
  });

  // ==================== _onPlayBGM ====================

  describe('_onPlayBGM', () => {
    test('调用 playBGM 并传递 level', () => {
      jest.spyOn(audio, 'playBGM');

      audio._onPlayBGM({ level: 7 });

      expect(audio.playBGM).toHaveBeenCalledWith(7);
    });
  });

  // ==================== _onStopBGM ====================

  describe('_onStopBGM', () => {
    test('调用 stopBGM', () => {
      jest.spyOn(audio, 'stopBGM');

      audio._onStopBGM();

      expect(audio.stopBGM).toHaveBeenCalled();
    });
  });

  // ==================== _onToggleBGM ====================

  describe('_onToggleBGM', () => {
    test('发射 BGM_TOGGLED 音效并调用 toggleBGM', () => {
      jest.spyOn(audio, 'toggleBGM');

      audio._onToggleBGM({ level: 4 });

      expect(audio.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'BGM_TOGGLED',
      });
      expect(audio.toggleBGM).toHaveBeenCalledWith(4);
    });
  });

  // ==================== _onPlaySound ====================

  describe('_onPlaySound', () => {
    test('从 Sounds 中查找对应 handler 并调用', () => {
      audio._onPlaySound({ sound: 'CLEAR', lines: 4, level: 1 });

      expect(mockSounds.CLEAR).toHaveBeenCalledWith(4, 1);
    });

    test('handler 不是函数时忽略', () => {
      isFunction.mockReturnValue(false);

      audio._onPlaySound({ sound: 'CLEAR', lines: 4, level: 1 });

      expect(mockSounds.CLEAR).not.toHaveBeenCalled();
    });

    test('lines 和 level 参数传递给 handler', () => {
      audio._onPlaySound({ sound: 'CLEAR', lines: 2, level: 50 });

      expect(mockSounds.CLEAR).toHaveBeenCalledWith(2, 50);
    });

    test('不同 sound 路由到不同 handler', () => {
      audio._onPlaySound({ sound: 'LEVEL_UP', level: 5 });
      audio._onPlaySound({ sound: 'GAME_OVER', level: 1 });

      expect(mockSounds.LEVEL_UP).toHaveBeenCalledWith(undefined, 5);
      expect(mockSounds.GAME_OVER).toHaveBeenCalledWith(undefined, 1);
    });
  });
});
