// tests/engine/engine.spec.js

import Engine from '@/lib/engine';
import Scheduler from '@/lib/engine/scheduler';
import dispatchInput from '@/lib/engine/dispatch-input';
import dispatchCommand from '@/lib/engine/dispatch-command';

jest.mock('@/lib/engine/scheduler', () => {
  return jest.fn().mockImplementation(() => ({
    tick: jest.fn(),
    delay: jest.fn(),
    interval: jest.fn(),
    cancel: jest.fn(),
    clear: jest.fn(),
    size: jest.fn(() => 0),
  }));
});

jest.mock('@/lib/engine/dispatch-input', () => jest.fn());
jest.mock('@/lib/engine/dispatch-command', () => jest.fn());

jest.mock('@/lib/services/audio', () => {
  return jest.fn().mockImplementation(() => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  }));
});

jest.mock('@/lib/game', () => {
  return jest.fn().mockImplementation(() => ({
    id: 'test-uuid',
    Store: {
      resetBoard: jest.fn(),
      getMode: jest.fn(() => 'playing'),
      getController: jest.fn(() => 'human'),
    },
    Animations: {
      hasBlocking: jest.fn(() => false),
      flush: jest.fn(),
      render: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    },
    Replay: {
      startTime: 0,
      playing: false,
      syncPlayElapsed: jest.fn(),
      update: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    },
    CommandQueue: {
      flush: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    },
    Gamepad: {
      update: jest.fn(),
      addEventListeners: jest.fn(),
      removeEventListeners: jest.fn(),
    },
    Keyboard: {
      addEventListeners: jest.fn(),
      removeEventListeners: jest.fn(),
    },
    UI: {
      updateMode: jest.fn(),
      updateHud: jest.fn(),
      updateController: jest.fn(),
      resize: jest.fn(),
      lazyRender: jest.fn(),
      tickHud: jest.fn(),
      render: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    },
    addEventListeners: jest.fn(),
    removeEventListeners: jest.fn(),
    loadHighScore: jest.fn(),
    setBeginningState: jest.fn(),
    tick: jest.fn(),
    getSpeed: jest.fn(() => 1000),
    on: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  }));
});

describe('Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.requestAnimationFrame = jest.fn(() => 123);
    globalThis.cancelAnimationFrame = jest.fn();
    Engine.rafId = null;
    Engine.lastTickTime = 0;
    Engine.fixedAccumulator = 0;
    Engine.Scheduler = null;
    Engine.Audio = null;
    Engine.Game = null;
  });

  // ==================== initialize ====================
  describe('initialize', () => {
    it('创建 Scheduler 实例', () => {
      Engine.initialize({ Elements: {}, Level: {} });
      expect(Scheduler).toHaveBeenCalled();
    });

    it('创建 Audio 实例', () => {
      const Audio = require('@/lib/services/audio');
      Engine.initialize({ Elements: {}, Level: {} });
      expect(Audio).toHaveBeenCalled();
    });

    it('创建 Game 实例', () => {
      const Game = require('@/lib/game');
      Engine.initialize({ Elements: {}, Level: {} });
      expect(Game).toHaveBeenCalled();
    });

    it('注入 Scheduler 到 Audio 和 Game', () => {
      Engine.initialize({ Elements: {}, Level: {} });
      expect(Engine.Scheduler).toBeInstanceOf(Object);
      expect(Engine.Audio).toBeInstanceOf(Object);
      expect(Engine.Game).toBeInstanceOf(Object);
    });
  });

  // ==================== launch ====================
  describe('launch', () => {
    it('调用 Store.resetBoard', () => {
      Engine.launch();
      expect(Engine.Game.Store.resetBoard).toHaveBeenCalled();
    });

    it('调用 loadHighScore', () => {
      Engine.launch();
      expect(Engine.Game.loadHighScore).toHaveBeenCalled();
    });

    it('调用 setBeginningState 设置为 main-menu', () => {
      Engine.launch();
      expect(Engine.Game.setBeginningState).toHaveBeenCalledWith('main-menu');
    });

    it('调用 UI.updateMode', () => {
      Engine.launch();
      expect(Engine.Game.UI.updateMode).toHaveBeenCalledWith('main-menu');
    });

    it('调用 UI.resize', () => {
      Engine.launch();
      expect(Engine.Game.UI.resize).toHaveBeenCalled();
    });

    it('调用 UI.updateHud', () => {
      Engine.launch();
      expect(Engine.Game.UI.updateHud).toHaveBeenCalled();
    });

    it('调用 UI.lazyRender', () => {
      Engine.launch();
      expect(Engine.Game.UI.lazyRender).toHaveBeenCalled();
    });

    it('调用 addEventListeners', () => {
      Engine.launch();
      expect(Engine.Game.addEventListeners).toHaveBeenCalled();
    });

    it('启动 game loop', () => {
      Engine.launch();
      expect(globalThis.requestAnimationFrame).toHaveBeenCalledWith(Engine.tick);
    });
  });

  // ==================== tick ====================
  describe('tick', () => {
    beforeEach(() => {
      Engine.Scheduler = new Scheduler();
      Engine.Game = new (require('@/lib/game'))();
      Engine.lastTickTime = 0;
      Engine.fixedAccumulator = 0;
      Engine.rafId = null;
    });

    it('首次 tick 初始化时间基准', () => {
      Engine.tick(5000);
      expect(Engine.lastTickTime).toBe(5000);
      expect(Engine.fixedAccumulator).toBe(5000);
    });

    it('Scheduler.tick 以 timestamp 调用', () => {
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(Engine.Scheduler.tick).toHaveBeenCalledWith(100);
    });

    it('调用 Replay.syncPlayElapsed', () => {
      Engine.lastTickTime = 50;
      Engine.tick(100);
      expect(Engine.Game.Replay.syncPlayElapsed).toHaveBeenCalledWith({
        timestamp: 100,
        isBlocked: false,
      });
    });

    it('阻塞时 isBlocked 为 true', () => {
      Engine.Game.Animations.hasBlocking.mockReturnValue(true);
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(Engine.Game.Replay.syncPlayElapsed).toHaveBeenCalledWith(
        expect.objectContaining({ isBlocked: true }),
      );
    });

    it('调用 Replay.update', () => {
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(Engine.Game.Replay.update).toHaveBeenCalledWith({
        speed: 1000,
        timestamp: 100,
      });
    });

    it('调用 Gamepad.update', () => {
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(Engine.Game.Gamepad.update).toHaveBeenCalledWith(100);
    });

    it('调用 CommandQueue.flush', () => {
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(Engine.Game.CommandQueue.flush).toHaveBeenCalled();
    });

    it('首次执行 fixedAccumulator 为 0 时调用 Game.tick', () => {
      Engine.lastTickTime = 1;
      Engine.fixedAccumulator = 0;
      Engine.tick(100);
      expect(Engine.Game.tick).toHaveBeenCalledWith(false);
      expect(Engine.fixedAccumulator).toBe(100);
    });

    it('stepDelta > getSpeed 时调用 Game.tick', () => {
      Engine.lastTickTime = 1;
      Engine.fixedAccumulator = 1;
      Engine.Game.getSpeed.mockReturnValue(500);
      Engine.tick(600);
      expect(Engine.Game.tick).toHaveBeenCalled();
    });

    it('stepDelta <= getSpeed 时不调用 Game.tick', () => {
      Engine.lastTickTime = 1;
      Engine.fixedAccumulator = 1;
      Engine.Game.getSpeed.mockReturnValue(500);
      Engine.tick(100);
      expect(Engine.Game.tick).not.toHaveBeenCalled();
    });

    it('Replay.playing 时不调用 Game.tick', () => {
      Engine.Game.Replay.playing = true;
      Engine.lastTickTime = 1;
      Engine.fixedAccumulator = 0;
      Engine.tick(600);
      expect(Engine.Game.tick).not.toHaveBeenCalled();
    });

    it('阻塞时传递 isBlocked = true', () => {
      Engine.Game.Animations.hasBlocking.mockReturnValue(true);
      Engine.lastTickTime = 1;
      Engine.fixedAccumulator = 0;
      Engine.tick(600);
      expect(Engine.Game.tick).toHaveBeenCalledWith(true);
    });

    it('调用 Animations.flush', () => {
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(Engine.Game.Animations.flush).toHaveBeenCalled();
    });

    it('调用 UI.tickHud', () => {
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(Engine.Game.UI.tickHud).toHaveBeenCalled();
    });

    it('调用 UI.render', () => {
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(Engine.Game.UI.render).toHaveBeenCalled();
    });

    it('调用 Animations.render', () => {
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(Engine.Game.Animations.render).toHaveBeenCalled();
    });

    it('调用 requestAnimationFrame', () => {
      Engine.lastTickTime = 1;
      Engine.tick(100);
      expect(globalThis.requestAnimationFrame).toHaveBeenCalledWith(Engine.tick);
      expect(Engine.rafId).toBe(123);
    });

    it('应该按正确顺序调用各模块', () => {
      const callOrder = [];

      Engine.Scheduler.tick.mockImplementation(() => callOrder.push('scheduler'));
      Engine.Game.Replay.syncPlayElapsed.mockImplementation(() => callOrder.push('syncElapsed'));
      Engine.Game.Replay.update.mockImplementation(() => callOrder.push('replay'));
      Engine.Game.Gamepad.update.mockImplementation(() => callOrder.push('gamepad'));
      Engine.Game.CommandQueue.flush.mockImplementation(() => callOrder.push('commandQueue'));
      Engine.Game.tick.mockImplementation(() => callOrder.push('game'));
      Engine.Game.Animations.flush.mockImplementation(() => callOrder.push('animFlush'));
      Engine.Game.UI.tickHud.mockImplementation(() => callOrder.push('hud'));
      Engine.Game.UI.render.mockImplementation(() => callOrder.push('uiRender'));
      Engine.Game.Animations.render.mockImplementation(() => callOrder.push('animRender'));

      Engine.lastTickTime = 1;
      Engine.fixedAccumulator = 0;
      Engine.tick(600);

      expect(callOrder).toEqual([
        'scheduler',
        'syncElapsed',
        'replay',
        'gamepad',
        'commandQueue',
        'game',
        'animFlush',
        'hud',
        'uiRender',
        'animRender',
      ]);
    });
  });

  // ==================== start / stop / restart ====================
  describe('start / stop / restart', () => {
    it('start 调用 requestAnimationFrame', () => {
      Engine.start();
      expect(globalThis.requestAnimationFrame).toHaveBeenCalledWith(Engine.tick);
    });

    it('stop 取消 RAF 并重置状态', () => {
      Engine.rafId = 123;
      Engine.stop();
      expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(123);
      expect(Engine.rafId).toBe(0);
      expect(Engine.lastTickTime).toBe(0);
      expect(Engine.fixedAccumulator).toBe(0);
    });

    it('stop 在 rafId 为空时直接返回', () => {
      Engine.rafId = null;
      Engine.stop();
      expect(globalThis.cancelAnimationFrame).not.toHaveBeenCalled();
    });

    it('restart 先 stop 再 start', () => {
      const stopSpy = jest.spyOn(Engine, 'stop');
      const startSpy = jest.spyOn(Engine, 'start');
      Engine.restart();
      expect(stopSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();
    });
  });

  // ==================== _subscribe ====================
  describe('_subscribe', () => {
    it('订阅 dispatch:command 和 dispatch:input', () => {
      Engine.Game = new (require('@/lib/game'))();
      Engine._subscribe();
      expect(Engine.Game.on).toHaveBeenCalledWith('dispatch:command', expect.any(Function));
      expect(Engine.Game.on).toHaveBeenCalledWith('dispatch:input', expect.any(Function));
    });
  });
});
