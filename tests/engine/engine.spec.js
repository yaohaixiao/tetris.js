/**
 * @file Engine Core 完整单元测试 - 修正版
 */

import Engine from '@/lib/engine';

// ==================== Mock 模块 ====================

jest.mock('@/lib/engine/scheduler.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    tick: jest.fn(),
  })),
}));

jest.mock('@/lib/services/audio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  })),
}));

jest.mock('@/lib/game', () => ({
  __esModule: true,
  default: jest.fn((config) => ({
    Store: {
      resetBoard: jest.fn(),
      getMode: jest.fn(() => 'playing'),
      getController: jest.fn(() => 'human'),
      getState: jest.fn(() => ({ score: 0, level: 1 })),
    },
    UI: {
      updateMode: jest.fn(),
      resize: jest.fn(),
      updateHud: jest.fn(),
      updateController: jest.fn(),
      lazyRender: jest.fn(),
      tickHud: jest.fn(),
      render: jest.fn(),
    },
    Replay: {
      playing: false,
      startTime: 0,
      syncPlayElapsed: jest.fn(),
      update: jest.fn(),
    },
    Gamepad: {
      update: jest.fn(),
    },
    Keyboard: {
      update: jest.fn(),
    },
    Animations: {
      hasBlocking: jest.fn(() => false),
      flush: jest.fn(),
      render: jest.fn(),
    },
    CommandQueue: {
      flush: jest.fn(),
    },
    loadHighScore: jest.fn(),
    setBeginningState: jest.fn(),
    addEventListeners: jest.fn(),
    removeEventListeners: jest.fn(),
    getSpeed: jest.fn(() => 1000),
    tick: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    _config: config,
  })),
}));

jest.mock('@/lib/battle/battle-controller.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  })),
}));

jest.mock('@/lib/engine/dispatch-input.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/engine/dispatch-command.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/configuration.js', () => ({
  Mode: 'single',
  Players: ['Player1'],
  Speed: 1000,
  BoardWidth: 10,
  BoardHeight: 20,
  Elements: {},
  Level: {},
}));

global.requestAnimationFrame = jest.fn(() => 123);
global.cancelAnimationFrame = jest.fn();

describe('Engine Core - 完整测试', () => {
  let Configuration;
  let GameMock;
  let SchedulerMock;
  let AudioMock;
  let BattleMock;
  let dispatchInputMock;
  let dispatchCommandMock;

  beforeEach(() => {
    jest.clearAllMocks();

    Configuration = require('@/lib/configuration.js');
    GameMock = require('@/lib/game').default;
    SchedulerMock = require('@/lib/engine/scheduler.js').default;
    AudioMock = require('@/lib/services/audio').default;
    BattleMock = require('@/lib/battle/battle-controller.js').default;
    dispatchInputMock = require('@/lib/engine/dispatch-input.js').default;
    dispatchCommandMock = require('@/lib/engine/dispatch-command.js').default;

    // 重置全局 mock
    requestAnimationFrame.mockReturnValue(123);

    // 重置 Engine 状态
    Engine.rafId = null;
    Engine.fixedAccumulator = 0;
    Engine.lastTickTime = 0;
    Engine.Games = [];
    Engine.Battle = [];
    Engine.Scheduler = null;
    Engine.Audio = null;
    Engine.Configuration = Configuration;
  });

  // ==================== 初始状态 ====================
  describe('初始状态', () => {
    test('应该具有正确的初始属性值', () => {
      expect(Engine.rafId).toBeNull();
      expect(Engine.fixedAccumulator).toBe(0);
      expect(Engine.lastTickTime).toBe(0);
      expect(Engine.Scheduler).toBeNull();
      expect(Engine.Audio).toBeNull();
      expect(Engine.Games).toEqual([]);
      expect(Engine.Battle).toEqual([]);
      expect(Engine.Configuration).toBe(Configuration);
    });

    test('所有核心方法应该存在', () => {
      const methods = [
        'initialize', 'launch', 'tick', 'start', 'stop', 'restart',
        'destroy', 'subscribe', 'unsubscribe', 'isVersus'
      ];
      methods.forEach(method => {
        expect(typeof Engine[method]).toBe('function');
      });
    });
  });

  // ==================== isVersus ====================
  describe('isVersus', () => {
    test('Mode 为 versus 时返回 true', () => {
      Configuration.Mode = 'versus';
      expect(Engine.isVersus()).toBe(true);
    });

    test('Mode 为 single 时返回 false', () => {
      Configuration.Mode = 'single';
      expect(Engine.isVersus()).toBe(false);
    });

    test('Mode 为其他值返回 false', () => {
      Configuration.Mode = 'multiplayer';
      expect(Engine.isVersus()).toBe(false);

      Configuration.Mode = undefined;
      expect(Engine.isVersus()).toBe(false);
    });
  });

  // ==================== initialize ====================
  describe('initialize', () => {
    test('应该创建 Scheduler 实例', () => {
      Engine.initialize({ Players: ['P1'] });

      expect(SchedulerMock).toHaveBeenCalledTimes(1);
      expect(Engine.Scheduler).toBeDefined();
    });

    test('应该创建 Audio 实例并传入标准化配置', () => {
      const options = {
        Players: ['P1'],
        Elements: { board: 'el' },
      };

      Engine.initialize(options);

      expect(AudioMock).toHaveBeenCalledTimes(1);
      const callArgs = AudioMock.mock.calls[0][0];
      expect(callArgs.Scheduler).toBe(Engine.Scheduler);
      expect(callArgs.isAIPlayer).toBe(true);
    });

    test('应该创建正确数量的 Game 实例', () => {
      Engine.initialize({ Players: ['P1', 'P2', 'P3'] });

      expect(GameMock).toHaveBeenCalledTimes(3);
      expect(Engine.Games).toHaveLength(3);
    });

    test('Game 实例应该接收正确的 Player 配置', () => {
      Engine.initialize({ Players: ['Alice', 'Bob'] });

      expect(GameMock.mock.calls[0][0].Player).toEqual({
        index: 0,
        name: 'Alice',
      });
      expect(GameMock.mock.calls[1][0].Player).toEqual({
        index: 1,
        name: 'Bob',
      });
    });

    test('versus 模式下应该创建 Battle', () => {
      Configuration.Mode = 'versus';

      Engine.initialize({ Players: ['P1', 'P2'] });

      expect(BattleMock).toHaveBeenCalledWith({
        games: Engine.Games,
      });
    });

    test('非 versus 模式不创建 Battle', () => {
      Configuration.Mode = 'single';

      Engine.initialize({ Players: ['P1'] });

      expect(BattleMock).not.toHaveBeenCalled();
      expect(Engine.Battle).toEqual([]);
    });

    test('空 Players 数组不创建 Game', () => {
      Engine.initialize({ Players: [] });

      expect(GameMock).not.toHaveBeenCalled();
      expect(Engine.Games).toEqual([]);
    });

    test('缺少 Players 配置时应该抛出错误', () => {
      expect(() => {
        Engine.initialize({});
      }).toThrow();
    });
  });

  // ==================== launch ====================
  describe('launch', () => {
    beforeEach(() => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);
    });

    test('应该调用 initialize 方法', () => {
      const spy = jest.spyOn(Engine, 'initialize');

      Engine.launch();

      expect(spy).toHaveBeenCalledWith(Configuration);
      spy.mockRestore();
    });

    test('应该初始化棋盘数据', () => {
      const game = Engine.Games[0];

      Engine.launch();

      expect(game.Store.resetBoard).toHaveBeenCalled();
    });

    test('应该加载最高分', () => {
      const game = Engine.Games[0];

      Engine.launch();

      expect(game.loadHighScore).toHaveBeenCalled();
    });

    test('应该设置初始状态为 main-menu', () => {
      const game = Engine.Games[0];

      Engine.launch();

      expect(game.setBeginningState).toHaveBeenCalledWith('main-menu');
    });

    test('应该更新 UI', () => {
      const game = Engine.Games[0];

      Engine.launch();

      expect(game.UI.updateMode).toHaveBeenCalledWith('main-menu');
      expect(game.UI.resize).toHaveBeenCalled();
      expect(game.UI.updateHud).toHaveBeenCalled();
      expect(game.UI.updateController).toHaveBeenCalled();
      expect(game.UI.lazyRender).toHaveBeenCalled();
    });

    test('应该绑定事件和启动循环', () => {
      const game = Engine.Games[0];
      const subscribeSpy = jest.spyOn(Engine, 'subscribe');
      const startSpy = jest.spyOn(Engine, 'start');

      Engine.launch();

      expect(game.addEventListeners).toHaveBeenCalled();
      expect(subscribeSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();

      subscribeSpy.mockRestore();
      startSpy.mockRestore();
    });

    test('应该处理空 Games 数组', () => {
      Engine.Games = [];

      expect(() => {
        Engine.launch();
      }).not.toThrow();
    });
  });

  // ==================== tick ====================
  describe('tick - 游戏主循环', () => {
    let game;

    beforeEach(() => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);
      game = Engine.Games[0];
    });

    test('首次调用应该初始化时间基准', () => {
      Engine.lastTickTime = 0;
      Engine.fixedAccumulator = 0;

      Engine.tick(1000);

      expect(Engine.lastTickTime).toBe(1000);
      expect(Engine.fixedAccumulator).toBe(1000);
    });

    test('非首次调用应该更新 lastTickTime', () => {
      Engine.lastTickTime = 1000;
      Engine.fixedAccumulator = 1000;

      Engine.tick(1100);

      expect(Engine.lastTickTime).toBe(1100);
    });

    test('应该调用 Scheduler.tick', () => {
      Engine.tick(1000);

      const scheduler = Engine.Scheduler;
      expect(scheduler.tick).toHaveBeenCalledWith(1000);
    });

    test('应该检查动画阻塞状态', () => {
      Engine.tick(1000);

      expect(game.Animations.hasBlocking).toHaveBeenCalled();
    });

    test('应该同步回放时钟', () => {
      game.Animations.hasBlocking.mockReturnValue(true);

      Engine.tick(2000);

      expect(game.Replay.syncPlayElapsed).toHaveBeenCalledWith({
        timestamp: 2000,
        isBlocked: true,
      });
    });

    test('应该更新回放系统', () => {
      game.getSpeed.mockReturnValue(500);

      Engine.tick(3000);

      expect(game.Replay.update).toHaveBeenCalledWith({
        speed: 500,
        timestamp: 3000,
      });
    });

    test('应该更新输入设备', () => {
      Engine.tick(1000);

      expect(game.Gamepad.update).toHaveBeenCalledWith(1000);
      expect(game.Keyboard.update).toHaveBeenCalled();
    });

    test('缺少 Gamepad 或 Keyboard 不报错', () => {
      delete game.Gamepad;
      delete game.Keyboard;

      expect(() => {
        Engine.tick(1000);
      }).not.toThrow();
    });

    test('应该执行命令队列', () => {
      Engine.tick(1000);

      expect(game.CommandQueue.flush).toHaveBeenCalled();
    });

    test('应该更新动画和渲染', () => {
      Engine.tick(1000);

      expect(game.Animations.flush).toHaveBeenCalled();
      expect(game.UI.tickHud).toHaveBeenCalled();
      expect(game.UI.render).toHaveBeenCalled();
      expect(game.Animations.render).toHaveBeenCalled();
    });

    test('应该请求下一帧', () => {
      Engine.tick(1000);

      expect(requestAnimationFrame).toHaveBeenCalledWith(Engine.tick);
    });

    describe('游戏逻辑更新条件', () => {
      test('不在回放且超过速度间隔时应该更新', () => {
        // 关键：手动设置 tick 没有被 launch 调用
        game.tick.mockClear();
        game.getSpeed.mockReturnValue(100);
        game.Replay.playing = false;

        // 模拟 launch 后的状态：首次 tick 已经初始化了时间基准
        Engine.lastTickTime = 1000;
        Engine.fixedAccumulator = 1000;

        // 过了 200ms，stepDelta = 200 > speed(100)，应该触发
        Engine.tick(1200);

        expect(game.tick).toHaveBeenCalled();
      });

      test('未超过速度间隔时不更新', () => {
        game.tick.mockClear();
        game.getSpeed.mockReturnValue(1000);
        game.Replay.playing = false;

        Engine.lastTickTime = 1000;
        Engine.fixedAccumulator = 1000;

        // stepDelta = 16 < speed(1000)，不触发
        Engine.tick(1016);

        expect(game.tick).not.toHaveBeenCalled();
      });

      test('回放中不更新游戏逻辑', () => {
        game.tick.mockClear();
        game.getSpeed.mockReturnValue(100);
        game.Replay.playing = true;

        Engine.lastTickTime = 1000;
        Engine.fixedAccumulator = 1000;

        Engine.tick(1200);

        expect(game.tick).not.toHaveBeenCalled();
      });
    });

    test('应该处理多个 Game 实例', () => {
      Configuration.Players = ['P1', 'P2'];
      Engine.initialize(Configuration);

      Engine.tick(1000);

      Engine.Games.forEach(g => {
        expect(g.UI.render).toHaveBeenCalled();
        expect(g.CommandQueue.flush).toHaveBeenCalled();
      });
    });

    test('空 Games 数组不报错', () => {
      Engine.Games = [];

      expect(() => {
        Engine.tick(1000);
      }).not.toThrow();
    });

    test('执行顺序正确', () => {
      const callOrder = [];
      const scheduler = Engine.Scheduler;

      scheduler.tick.mockImplementation(() => callOrder.push('scheduler'));
      game.Replay.syncPlayElapsed.mockImplementation(() => callOrder.push('syncPlayElapsed'));
      game.Replay.update.mockImplementation(() => callOrder.push('replayUpdate'));
      game.CommandQueue.flush.mockImplementation(() => callOrder.push('commandQueue'));
      game.UI.render.mockImplementation(() => callOrder.push('render'));
      game.Animations.render.mockImplementation(() => callOrder.push('animationsRender'));

      Engine.tick(1000);

      expect(callOrder.indexOf('scheduler')).toBeLessThan(callOrder.indexOf('syncPlayElapsed'));
      expect(callOrder.indexOf('commandQueue')).toBeLessThan(callOrder.indexOf('render'));
      expect(callOrder.indexOf('render')).toBeLessThan(callOrder.indexOf('animationsRender'));
    });
  });

  // ==================== subscribe / unsubscribe ====================
  describe('subscribe 和 unsubscribe', () => {
    beforeEach(() => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);
    });

    test('subscribe 应该订阅所有模块', () => {
      const game = Engine.Games[0];
      const audio = Engine.Audio;

      Engine.subscribe();

      expect(game.on).toHaveBeenCalledWith('dispatch:command', Engine._onDispatchCommand);
      expect(game.on).toHaveBeenCalledWith('dispatch:input', Engine._onDispatchInput);
      expect(game.subscribe).toHaveBeenCalled();
      expect(audio.subscribe).toHaveBeenCalled();
    });

    test('没有 Audio 实例不报错', () => {
      Engine.Audio = null;

      expect(() => {
        Engine.subscribe();
      }).not.toThrow();
    });

    test('unsubscribe 应该取消所有订阅', () => {
      const game = Engine.Games[0];
      const audio = Engine.Audio;

      Engine.unsubscribe();

      expect(game.off).toHaveBeenCalledWith('dispatch:command', Engine._onDispatchCommand);
      expect(game.off).toHaveBeenCalledWith('dispatch:input', Engine._onDispatchInput);
      expect(game.unsubscribe).toHaveBeenCalled();
      expect(audio.unsubscribe).toHaveBeenCalled();
    });

    test('versus 模式应该调用 Battle 订阅', () => {
      Configuration.Mode = 'versus';
      Engine.Battle = { subscribe: jest.fn(), unsubscribe: jest.fn() };

      Engine.subscribe();
      expect(Engine.Battle.subscribe).toHaveBeenCalled();

      Engine.unsubscribe();
      expect(Engine.Battle.unsubscribe).toHaveBeenCalled();
    });
  });

  // ==================== _onDispatchCommand ====================
  describe('_onDispatchCommand', () => {
    test('应该注入 isBlocked 并调用 dispatchCommand', () => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);
      const game = Engine.Games[0];

      game.Animations.hasBlocking.mockReturnValue(true);
      game.Store.getMode.mockReturnValue('playing');

      const cmd = {
        payload: {
          Game: game,
          action: 'move-left',
        },
      };

      Engine._onDispatchCommand(cmd);

      expect(cmd.payload.isBlocked).toBe(true);
      expect(dispatchCommandMock).toHaveBeenCalledWith(cmd, {
        mode: 'playing',
      });
    });

    test('应该处理不同模式', () => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);
      const game = Engine.Games[0];

      const modes = ['main-menu', 'playing', 'paused', 'game-over'];

      modes.forEach(mode => {
        game.Store.getMode.mockReturnValue(mode);
        const cmd = { payload: { Game: game } };

        Engine._onDispatchCommand(cmd);

        expect(dispatchCommandMock).toHaveBeenCalledWith(cmd, { mode });
      });
    });
  });

  // ==================== _onDispatchInput ====================
  describe('_onDispatchInput', () => {
    test('应该计算时间差并注入状态', () => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);
      const game = Engine.Games[0];

      Engine.lastTickTime = 5000;
      game.Replay.startTime = 3000;
      game.Animations.hasBlocking.mockReturnValue(true);

      const input = {
        payload: {
          Game: game,
          key: 'ArrowLeft',
        },
      };

      Engine._onDispatchInput(input);

      expect(dispatchInputMock).toHaveBeenCalledWith(input, {
        isBlocked: true,
        ms: 2000, // 5000 - 3000
      });
    });

    test('startTime 为 0 时能正确计算', () => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);
      const game = Engine.Games[0];

      Engine.lastTickTime = 5000;
      game.Replay.startTime = 0;

      const input = { payload: { Game: game } };

      Engine._onDispatchInput(input);

      expect(dispatchInputMock).toHaveBeenCalledWith(input, {
        isBlocked: false,
        ms: 5000,
      });
    });
  });

  // ==================== start / stop / restart ====================
  describe('start', () => {
    test('应该启动 requestAnimationFrame', () => {
      Engine.start();

      expect(requestAnimationFrame).toHaveBeenCalledWith(Engine.tick);
      expect(Engine.rafId).toBe(123);
    });
  });

  describe('stop', () => {
    test('应该停止循环并重置时间', () => {
      Engine.rafId = 456;
      Engine.lastTickTime = 5000;
      Engine.fixedAccumulator = 3000;

      Engine.stop();

      expect(cancelAnimationFrame).toHaveBeenCalledWith(456);
      expect(Engine.rafId).toBe(0);
      expect(Engine.lastTickTime).toBe(0);
      expect(Engine.fixedAccumulator).toBe(0);
    });

    test('rafId 为空时直接返回', () => {
      Engine.rafId = null;

      Engine.stop();

      expect(cancelAnimationFrame).not.toHaveBeenCalled();
    });

    test('rafId 为 0 时也能正常执行', () => {
      Engine.rafId = 0;

      // 0 是 falsy，所以会直接返回
      Engine.stop();

      expect(cancelAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe('restart', () => {
    test('应该先 stop 再 start', () => {
      const stopSpy = jest.spyOn(Engine, 'stop');
      const startSpy = jest.spyOn(Engine, 'start');

      Engine.restart();

      expect(stopSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();
      expect(stopSpy.mock.invocationCallOrder[0])
        .toBeLessThan(startSpy.mock.invocationCallOrder[0]);

      stopSpy.mockRestore();
      startSpy.mockRestore();
    });
  });

  // ==================== destroy ====================
  describe('destroy', () => {
    beforeEach(() => {
      Configuration.Players = ['Player1', 'Player2'];
      Engine.initialize(Configuration);
      Engine.rafId = 123;
    });

    test('应该完整清理所有资源', () => {
      const stopSpy = jest.spyOn(Engine, 'stop');
      const unsubscribeSpy = jest.spyOn(Engine, 'unsubscribe');

      Engine.destroy();

      expect(stopSpy).toHaveBeenCalled();
      expect(unsubscribeSpy).toHaveBeenCalled();

      Engine.Games.forEach(game => {
        expect(game.removeEventListeners).toHaveBeenCalled();
        expect(game.destroy).toHaveBeenCalled();
      });

      expect(Engine.Audio).toBeNull();
      expect(Engine.Scheduler).toBeNull();
      expect(Engine.Games).toEqual([]);

      stopSpy.mockRestore();
      unsubscribeSpy.mockRestore();
    });

    test('空 Games 数组也能正常销毁', () => {
      Engine.Games = [];

      expect(() => {
        Engine.destroy();
      }).not.toThrow();
    });
  });

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('完整生命周期', () => {
      Configuration.Players = ['Player1'];

      // 初始化
      Engine.initialize(Configuration);
      expect(Engine.Games).toHaveLength(1);

      // 启动
      Engine.launch();
      expect(Engine.rafId).toBeDefined();

      // 运行几帧
      Engine.tick(1000);
      Engine.tick(1016);
      Engine.tick(1032);

      // 重启
      Engine.restart();

      // 停止
      Engine.stop();
      expect(Engine.rafId).toBe(0);

      // 销毁
      Engine.destroy();
      expect(Engine.Audio).toBeNull();
      expect(Engine.Games).toEqual([]);
    });

    test('versus 模式完整流程', () => {
      Configuration.Mode = 'versus';
      Configuration.Players = ['P1', 'P2'];

      Engine.initialize(Configuration);
      expect(Engine.Games).toHaveLength(2);
      expect(Engine.Battle).toBeDefined();

      Engine.launch();
      Engine.tick(1000);
      Engine.destroy();
    });
  });

  // ==================== 边界测试 ====================
  describe('边界情况', () => {
    test('极短时间间隔', () => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);
      const game = Engine.Games[0];

      Engine.lastTickTime = 1000;
      Engine.fixedAccumulator = 1000;

      Engine.tick(1001); // 只过了 1ms

      expect(game.tick).not.toHaveBeenCalled();
    });

    test('极长时间间隔', () => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);
      const game = Engine.Games[0];

      Engine.lastTickTime = 1000;
      Engine.fixedAccumulator = 1000;

      Engine.tick(3601000); // 过了 1 小时

      expect(game.tick).toHaveBeenCalled();
    });

    test('60fps 连续调用', () => {
      Configuration.Players = ['Player1'];
      Engine.initialize(Configuration);

      // 模拟 60fps
      for (let i = 0; i < 60; i++) {
        Engine.tick(1000 + i * 16);
      }

      expect(Engine.lastTickTime).toBe(1000 + 59 * 16);
    });

    test('大量 Game 实例', () => {
      Configuration.Players = Array.from({ length: 10 }, (_, i) => `P${i + 1}`);

      expect(() => {
        Engine.initialize(Configuration);
      }).not.toThrow();

      expect(Engine.Games).toHaveLength(10);

      Engine.tick(1000);
    });
  });
});
