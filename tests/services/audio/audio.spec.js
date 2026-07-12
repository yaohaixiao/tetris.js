/** @jest-environment jsdom */

import Audio from '@/lib/services/audio';
import playBGM from '@/lib/services/audio/play-bgm';
import stopBGM from '@/lib/services/audio/stop-bgm';
import toggleBGM from '@/lib/services/audio/toggle-bgm';

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

// Mock AudioRouter
jest.mock('@/lib/events/router/audio-router.js', () => {
  return jest.fn().mockImplementation(function (options) {
    Object.assign(this, options);
    this.subscribe = jest.fn();
    this.unsubscribe = jest.fn();
    this._onPlayBGM = jest.fn();
    this._onStopBGM = jest.fn();
    this._onToggleBGM = jest.fn();
    this._onPlaySound = jest.fn();
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

describe('Audio', () => {
  let audio;

  beforeEach(() => {
    jest.clearAllMocks();

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

    test('创建 AudioRouter 实例并传入依赖', () => {
      const AudioRouter = require('@/lib/events/router/audio-router.js');
      expect(AudioRouter).toHaveBeenCalledWith({
        Audio: audio,
        Sounds: audio.Sounds,
      });
      expect(audio.Router).toBeDefined();
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
    test('委托给 AudioRouter.subscribe', () => {
      audio.subscribe();

      expect(audio.Router.subscribe).toHaveBeenCalled();
    });
  });

  // ==================== unsubscribe ====================

  describe('unsubscribe', () => {
    test('委托给 AudioRouter.unsubscribe', () => {
      audio.unsubscribe();

      expect(audio.Router.unsubscribe).toHaveBeenCalled();
    });
  });

  // ==================== 事件回调委托给 AudioRouter ====================

  describe('事件回调（委托给 AudioRouter）', () => {
    test('_onPlayBGM 委托给 Router', () => {
      audio.Router._onPlayBGM({ level: 7 });

      expect(audio.Router._onPlayBGM).toHaveBeenCalledWith({ level: 7 });
    });

    test('_onStopBGM 委托给 Router', () => {
      audio.Router._onStopBGM();

      expect(audio.Router._onStopBGM).toHaveBeenCalled();
    });

    test('_onToggleBGM 委托给 Router', () => {
      audio.Router._onToggleBGM({ level: 4 });

      expect(audio.Router._onToggleBGM).toHaveBeenCalledWith({ level: 4 });
    });

    test('_onPlaySound 委托给 Router', () => {
      audio.Router._onPlaySound({ sound: 'CLEAR', lines: 4, level: 1 });

      expect(audio.Router._onPlaySound).toHaveBeenCalledWith({
        sound: 'CLEAR',
        lines: 4,
        level: 1,
      });
    });
  });
});
