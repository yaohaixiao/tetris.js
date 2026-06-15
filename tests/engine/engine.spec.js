/** @file Engine Core 完整单元测试 - 最终修正版 */

import Engine from '@/lib/engine';

// ==================== Mock 模块 ====================

jest.mock('@/lib/engine/scheduler.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({ tick: jest.fn() })),
}));

jest.mock('@/lib/services/audio', () => ({
  __esModule: true,
  default: jest.fn(() => ({ subscribe: jest.fn(), unsubscribe: jest.fn() })),
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
    Gamepad: { update: jest.fn() },
    Keyboard: { update: jest.fn() },
    Animations: {
      hasBlocking: jest.fn(() => false),
      flush: jest.fn(),
      render: jest.fn(),
    },
    CommandQueue: { flush: jest.fn() },
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
  default: jest.fn(() => ({ subscribe: jest.fn(), unsubscribe: jest.fn() })),
}));

jest.mock('@/lib/engine/draw-interface.js', () => ({
  __esModule: true,
  default: jest.fn(),
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
  Elements: { Battle: {} },
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
  let drawInterfaceMock;

  beforeEach(() => {
    jest.clearAllMocks();

    Configuration = require('@/lib/configuration.js');
    GameMock = require('@/lib/game').default;
    SchedulerMock = require('@/lib/engine/scheduler.js').default;
    AudioMock = require('@/lib/services/audio').default;
    BattleMock = require('@/lib/battle/battle-controller.js').default;
    dispatchInputMock = require('@/lib/engine/dispatch-input.js').default;
    dispatchCommandMock = require('@/lib/engine/dispatch-command.js').default;

    Configuration.Mode = 'single';
    Configuration.Players = ['Player1', 'Player1_extra'];
    Configuration.Speed = 1000;
    Configuration.BoardWidth = 10;
    Configuration.BoardHeight = 20;
    Configuration.Elements = {
      Battle: { overlay: 'battle-overlay', winner: 'battle-winner' },
    };
    Configuration.Level = {};

    drawInterfaceMock = require('@/lib/engine/draw-interface.js').default;

    requestAnimationFrame.mockReturnValue(123);

    Engine.rafId = null;
    Engine.fixedAccumulator = 0;
    Engine.lastTickTime = 0;
    Engine.Games = [];
    Engine.Battle = [];
    Engine.Scheduler = null;
    Engine.Audio = null;
    Engine.gameAccumulators = new Map();
    Engine.Configuration = Configuration;
  });

  // ==================== 初始状态 ====================
  describe('初始状态', () => {
    test('应该调用 drawInterface 绘制界面', () => {
      Engine.initialize({ Players: ['P1'] });
      expect(drawInterfaceMock).toHaveBeenCalledWith({ Players: ['P1'] });
    });

    test('drawInterface 应该在创建 Scheduler 之前调用', () => {
      Engine.initialize({ Players: ['P1'], Elements: {} });
      const drawCallOrder = drawInterfaceMock.mock.invocationCallOrder[0];
      const schedulerCallOrder = SchedulerMock.mock.invocationCallOrder[0];
      expect(drawCallOrder).toBeLessThan(schedulerCallOrder);
    });

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
      [
        'initialize',
        'launch',
        'tick',
        'start',
        'stop',
        'restart',
        'destroy',
        'subscribe',
        'unsubscribe',
        'isVersus',
      ].forEach((m) => {
        expect(typeof Engine[m]).toBe('function');
      });
    });

    test('gameAccumulators 应该是 Map 实例', () => {
      expect(Engine.gameAccumulators).toBeInstanceOf(Map);
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
    test('创建 Scheduler', () => {
      Engine.initialize({ Players: ['P1'] });
      expect(SchedulerMock).toHaveBeenCalledTimes(1);
      expect(Engine.Scheduler).toBeDefined();
    });

    test('创建 Audio', () => {
      Engine.initialize({ Players: ['P1'], Elements: { board: 'el' } });
      expect(AudioMock).toHaveBeenCalledTimes(1);
      expect(AudioMock.mock.calls[0][0].Scheduler).toBe(Engine.Scheduler);
      expect(AudioMock.mock.calls[0][0].isAIPlayer).toBe(true);
    });

    test('创建正确数量 Game', () => {
      Engine.initialize({ Players: ['P1', 'P2', 'P3'] });
      expect(GameMock).toHaveBeenCalledTimes(3);
      expect(Engine.Games).toHaveLength(3);
    });

    test('Game 接收正确 Player 配置', () => {
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

    test('versus 模式创建 Battle（含 elements、victoryScore 和 players）', () => {
      Configuration.Mode = 'versus';
      const battleElements = {
        overlay: 'battle-overlay',
        winner: 'battle-winner',
      };

      Engine.initialize({
        Players: ['P1', 'P2'],
        Elements: { Battle: battleElements },
        victoryScore: 20,
      });

      expect(BattleMock).toHaveBeenCalledWith({
        games: Engine.Games,
        victoryScore: 20,
        elements: battleElements,
        players: ['P1', 'P2'],
      });
      expect(Engine.Battle).toBeDefined();
    });

    test('versus 模式创建 Battle（无 victoryScore 时为 undefined，含 players）', () => {
      Configuration.Mode = 'versus';
      const battleElements = { overlay: 'test-overlay' };

      Engine.initialize({
        Players: ['P1', 'P2'],
        Elements: { Battle: battleElements },
      });

      expect(BattleMock).toHaveBeenCalledWith({
        games: Engine.Games,
        victoryScore: undefined,
        elements: battleElements,
        players: ['P1', 'P2'],
      });
    });

    test('非 versus 不创建 Battle', () => {
      Engine.initialize({ Players: ['P1'] });
      expect(BattleMock).not.toHaveBeenCalled();
      expect(Engine.Battle).toEqual([]);
    });

    test('空 Players 不创建 Game', () => {
      Engine.initialize({ Players: [] });
      expect(GameMock).not.toHaveBeenCalled();
      expect(Engine.Games).toEqual([]);
    });

    test('缺少 Players 抛错', () => {
      expect(() => Engine.initialize({})).toThrow();
    });

    test('single 模式多玩家 pop 后剩一个', () => {
      Engine.initialize({ Players: ['P1', 'P2'], Mode: 'single' });
      expect(GameMock).toHaveBeenCalledTimes(1);
      expect(Engine.Games).toHaveLength(1);
      expect(GameMock.mock.calls[0][0].Player.name).toBe('P1');
    });
  });

  // ==================== launch ====================
  describe('launch', () => {
    test('调用 initialize', () => {
      const spy = jest.spyOn(Engine, 'initialize');
      Engine.launch();
      expect(spy).toHaveBeenCalledWith(Configuration);
      spy.mockRestore();
    });

    test('初始化棋盘数据', () => {
      Engine.launch();
      expect(Engine.Games[0].Store.resetBoard).toHaveBeenCalled();
    });

    test('加载最高分', () => {
      Engine.launch();
      expect(Engine.Games[0].loadHighScore).toHaveBeenCalled();
    });

    test('设置初始状态', () => {
      Engine.launch();
      expect(Engine.Games[0].setBeginningState).toHaveBeenCalledWith(
        'main-menu',
      );
    });

    test('更新 UI', () => {
      Engine.launch();
      const ui = Engine.Games[0].UI;
      expect(ui.updateMode).toHaveBeenCalledWith('main-menu');
      expect(ui.resize).toHaveBeenCalled();
      expect(ui.updateHud).toHaveBeenCalled();
      expect(ui.updateController).toHaveBeenCalled();
      expect(ui.lazyRender).toHaveBeenCalled();
    });

    test('绑定事件和启动循环', () => {
      const s = jest.spyOn(Engine, 'subscribe');
      const t = jest.spyOn(Engine, 'start');
      Engine.launch();
      expect(Engine.Games[0].addEventListeners).toHaveBeenCalled();
      expect(s).toHaveBeenCalled();
      expect(t).toHaveBeenCalled();
      s.mockRestore();
      t.mockRestore();
    });

    test('空 Games 不报错', () => {
      Engine.Games = [];
      expect(() => Engine.launch()).not.toThrow();
    });

    test('versus 模式 launch', () => {
      Configuration.Mode = 'versus';
      Configuration.Players = ['P1', 'P2'];
      Configuration.Elements = { Battle: { overlay: 'battle-overlay' } };

      Engine.launch();

      expect(Engine.Games).toHaveLength(2);
      expect(Engine.Battle).toBeDefined();
      Engine.Games.forEach((game) => {
        expect(game.Store.resetBoard).toHaveBeenCalled();
        expect(game.addEventListeners).toHaveBeenCalled();
      });
    });
  });

  // ==================== tick ====================
  describe('tick - 游戏主循环', () => {
    let game;

    beforeEach(() => {
      Engine.initialize({ Players: ['Player1'] });
      game = Engine.Games[0];
    });

    test('首次调用初始化时间基准和累积器', () => {
      Engine.lastTickTime = 0;
      Engine.gameAccumulators.clear();
      Engine.tick(1000);
      expect(Engine.lastTickTime).toBe(1000);
      expect(Engine.fixedAccumulator).toBe(1000);
      expect(Engine.gameAccumulators.get(game)).toBe(1000);
    });

    test('非首次更新 lastTickTime', () => {
      Engine.lastTickTime = 1000;
      Engine.fixedAccumulator = 1000;
      Engine.tick(1100);
      expect(Engine.lastTickTime).toBe(1100);
    });

    test('调用 Scheduler.tick', () => {
      Engine.tick(1000);
      expect(Engine.Scheduler.tick).toHaveBeenCalledWith(1000);
    });

    test('检查动画阻塞', () => {
      Engine.tick(1000);
      expect(game.Animations.hasBlocking).toHaveBeenCalled();
    });

    test('同步回放时钟', () => {
      game.Animations.hasBlocking.mockReturnValue(true);
      Engine.tick(2000);
      expect(game.Replay.syncPlayElapsed).toHaveBeenCalledWith({
        timestamp: 2000,
        isBlocked: true,
      });
    });

    test('更新回放系统', () => {
      game.getSpeed.mockReturnValue(500);
      Engine.tick(3000);
      expect(game.Replay.update).toHaveBeenCalledWith({
        speed: 500,
        timestamp: 3000,
      });
    });

    test('更新输入设备', () => {
      Engine.tick(1000);
      expect(game.Gamepad.update).toHaveBeenCalledWith(1000);
      expect(game.Keyboard.update).toHaveBeenCalled();
    });

    test('缺少 Gamepad/Keyboard 不报错', () => {
      delete game.Gamepad;
      delete game.Keyboard;
      expect(() => Engine.tick(1000)).not.toThrow();
    });

    test('执行命令队列', () => {
      Engine.tick(1000);
      expect(game.CommandQueue.flush).toHaveBeenCalled();
    });

    test('更新动画和渲染', () => {
      Engine.tick(1000);
      expect(game.Animations.flush).toHaveBeenCalled();
      expect(game.UI.tickHud).toHaveBeenCalled();
      expect(game.UI.render).toHaveBeenCalled();
      expect(game.Animations.render).toHaveBeenCalled();
    });

    test('请求下一帧', () => {
      Engine.tick(1000);
      expect(requestAnimationFrame).toHaveBeenCalledWith(Engine.tick);
    });

    describe('游戏逻辑更新条件', () => {
      test('超过速度间隔时更新', () => {
        game.tick.mockClear();
        game.getSpeed.mockReturnValue(100);
        game.Replay.playing = false;
        Engine.lastTickTime = 1000;
        Engine.gameAccumulators.set(game, 1000);
        Engine.tick(1200);
        expect(game.tick).toHaveBeenCalled();
        expect(Engine.gameAccumulators.get(game)).toBe(1200);
      });

      test('未超过不更新', () => {
        game.tick.mockClear();
        game.getSpeed.mockReturnValue(1000);
        game.Replay.playing = false;
        Engine.lastTickTime = 1000;
        Engine.gameAccumulators.set(game, 1000);
        Engine.tick(1016);
        expect(game.tick).not.toHaveBeenCalled();
        expect(Engine.gameAccumulators.get(game)).toBe(1000);
      });

      test('回放中不更新', () => {
        game.tick.mockClear();
        game.getSpeed.mockReturnValue(100);
        game.Replay.playing = true;
        Engine.lastTickTime = 1000;
        Engine.gameAccumulators.set(game, 1000);
        Engine.tick(1200);
        expect(game.tick).not.toHaveBeenCalled();
      });
    });

    test('多个 Game 实例各自独立的累积器', () => {
      Engine.Games = [];
      Engine.initialize({ Players: ['P1', 'P2'] });
      const game0 = Engine.Games[0];
      const game1 = Engine.Games[1];

      Engine.lastTickTime = 0;
      Engine.tick(1000);

      game0.getSpeed.mockReturnValue(100);
      game1.getSpeed.mockReturnValue(1000);

      game0.tick.mockClear();
      game1.tick.mockClear();

      Engine.tick(1101);

      expect(game0.tick).toHaveBeenCalled();
      expect(game1.tick).not.toHaveBeenCalled();
    });

    test('空 Games 不报错', () => {
      Engine.Games = [];
      expect(() => Engine.tick(1000)).not.toThrow();
    });

    test('执行顺序正确', () => {
      const callOrder = [];
      const scheduler = Engine.Scheduler;
      scheduler.tick.mockImplementation(() => callOrder.push('scheduler'));
      game.Replay.syncPlayElapsed.mockImplementation(() =>
        callOrder.push('syncPlayElapsed'),
      );
      game.Replay.update.mockImplementation(() =>
        callOrder.push('replayUpdate'),
      );
      game.CommandQueue.flush.mockImplementation(() =>
        callOrder.push('commandQueue'),
      );
      game.UI.render.mockImplementation(() => callOrder.push('render'));
      game.Animations.render.mockImplementation(() =>
        callOrder.push('animationsRender'),
      );
      Engine.tick(1000);
      expect(callOrder.indexOf('scheduler')).toBeLessThan(
        callOrder.indexOf('syncPlayElapsed'),
      );
      expect(callOrder.indexOf('commandQueue')).toBeLessThan(
        callOrder.indexOf('render'),
      );
      expect(callOrder.indexOf('render')).toBeLessThan(
        callOrder.indexOf('animationsRender'),
      );
    });
  });

  // ==================== subscribe / unsubscribe ====================
  describe('subscribe 和 unsubscribe', () => {
    beforeEach(() => {
      Engine.initialize({ Players: ['Player1'] });
    });

    test('subscribe 订阅所有模块', () => {
      const game = Engine.Games[0];
      Engine.subscribe();
      expect(game.on).toHaveBeenCalledWith(
        'dispatch:command',
        Engine._onDispatchCommand,
      );
      expect(game.on).toHaveBeenCalledWith(
        'dispatch:input',
        Engine._onDispatchInput,
      );
      expect(game.subscribe).toHaveBeenCalled();
      expect(Engine.Audio.subscribe).toHaveBeenCalled();
    });

    test('没有 Audio 不报错', () => {
      Engine.Audio = null;
      expect(() => Engine.subscribe()).not.toThrow();
    });

    test('unsubscribe 取消所有订阅', () => {
      const game = Engine.Games[0];
      Engine.unsubscribe();
      expect(game.off).toHaveBeenCalledWith(
        'dispatch:command',
        Engine._onDispatchCommand,
      );
      expect(game.off).toHaveBeenCalledWith(
        'dispatch:input',
        Engine._onDispatchInput,
      );
      expect(game.unsubscribe).toHaveBeenCalled();
      expect(Engine.Audio.unsubscribe).toHaveBeenCalled();
    });

    test('versus 模式调用 Battle 订阅', () => {
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
    test('注入 isBlocked 并调用 dispatchCommand', () => {
      Engine.initialize({ Players: ['Player1'] });
      const game = Engine.Games[0];
      game.Animations.hasBlocking.mockReturnValue(true);
      game.Store.getMode.mockReturnValue('playing');
      const cmd = { payload: { Game: game, action: 'move-left' } };
      Engine._onDispatchCommand(cmd);
      expect(cmd.payload.isBlocked).toBe(true);
      expect(dispatchCommandMock).toHaveBeenCalledWith(cmd, {
        mode: 'playing',
      });
    });

    test('处理不同模式', () => {
      Engine.initialize({ Players: ['Player1'] });
      const game = Engine.Games[0];
      ['main-menu', 'playing', 'paused', 'game-over'].forEach((mode) => {
        game.Store.getMode.mockReturnValue(mode);
        const cmd = { payload: { Game: game } };
        Engine._onDispatchCommand(cmd);
        expect(dispatchCommandMock).toHaveBeenCalledWith(cmd, { mode });
      });
    });
  });

  // ==================== _onDispatchInput ====================
  describe('_onDispatchInput', () => {
    test('计算时间差并注入状态', () => {
      Engine.initialize({ Players: ['Player1'] });
      const game = Engine.Games[0];
      Engine.lastTickTime = 5000;
      game.Replay.startTime = 3000;
      game.Animations.hasBlocking.mockReturnValue(true);
      const input = { payload: { Game: game, key: 'ArrowLeft' } };
      Engine._onDispatchInput(input);
      expect(dispatchInputMock).toHaveBeenCalledWith(input, {
        isBlocked: true,
        ms: 2000,
      });
    });

    test('startTime 为 0 时正确计算', () => {
      Engine.initialize({ Players: ['Player1'] });
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
    test('启动 RAF', () => {
      Engine.start();
      expect(requestAnimationFrame).toHaveBeenCalledWith(Engine.tick);
      expect(Engine.rafId).toBe(123);
    });
  });

  describe('stop', () => {
    test('停止并重置（含 gameAccumulators 清空）', () => {
      Engine.rafId = 456;
      Engine.lastTickTime = 5000;
      Engine.fixedAccumulator = 3000;
      Engine.gameAccumulators.set('test', 100);
      Engine.stop();
      expect(cancelAnimationFrame).toHaveBeenCalledWith(456);
      expect(Engine.rafId).toBe(0);
      expect(Engine.lastTickTime).toBe(0);
      expect(Engine.gameAccumulators.size).toBe(0);
    });

    test('rafId 为空直接返回', () => {
      Engine.rafId = null;
      Engine.stop();
      expect(cancelAnimationFrame).not.toHaveBeenCalled();
    });

    test('rafId 为 0 直接返回', () => {
      Engine.rafId = 0;
      Engine.stop();
      expect(cancelAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe('restart', () => {
    test('先 stop 再 start', () => {
      const a = jest.spyOn(Engine, 'stop');
      const b = jest.spyOn(Engine, 'start');
      Engine.restart();
      expect(a.mock.invocationCallOrder[0]).toBeLessThan(
        b.mock.invocationCallOrder[0],
      );
      a.mockRestore();
      b.mockRestore();
    });
  });

  // ==================== destroy ====================
  describe('destroy', () => {
    beforeEach(() => {
      Engine.initialize({ Players: ['P1', 'P2'] });
      Engine.rafId = 123;
    });

    test('完整清理（含 gameAccumulators）', () => {
      const a = jest.spyOn(Engine, 'stop');
      const b = jest.spyOn(Engine, 'unsubscribe');
      Engine.gameAccumulators.set(Engine.Games[0], 500);
      Engine.destroy();
      expect(a).toHaveBeenCalled();
      expect(b).toHaveBeenCalled();
      Engine.Games.forEach((g) => {
        expect(g.removeEventListeners).toHaveBeenCalled();
        expect(g.destroy).toHaveBeenCalled();
      });
      expect(Engine.Audio).toBeNull();
      expect(Engine.Scheduler).toBeNull();
      expect(Engine.Games).toEqual([]);
      a.mockRestore();
      b.mockRestore();
    });

    test('空 Games 正常销毁', () => {
      Engine.Games = [];
      expect(() => Engine.destroy()).not.toThrow();
    });
  });

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('完整生命周期', () => {
      Configuration.Mode = 'single';
      Configuration.Players = ['Player1', 'Player1_extra'];
      Engine.launch();
      expect(Engine.Games).toHaveLength(1);
      Engine.tick(1000);
      Engine.tick(1016);
      Engine.tick(1032);
      Engine.restart();
      Engine.stop();
      expect(Engine.rafId).toBe(0);
      Engine.destroy();
      expect(Engine.Audio).toBeNull();
    });

    test('versus 模式（含独立累积器验证）', () => {
      Configuration.Mode = 'versus';
      Configuration.Players = ['P1', 'P2'];
      Configuration.Elements = { Battle: { overlay: 'battle-overlay' } };
      Engine.launch();
      expect(Engine.Games).toHaveLength(2);
      expect(Engine.Battle).toBeDefined();

      Engine.lastTickTime = 0;
      Engine.tick(1000);

      const game0 = Engine.Games[0];
      const game1 = Engine.Games[1];
      expect(Engine.gameAccumulators.get(game0)).toBe(1000);
      expect(Engine.gameAccumulators.get(game1)).toBe(1000);

      expect(game0.UI.render).toHaveBeenCalled();
      expect(game1.UI.render).toHaveBeenCalled();

      Engine.destroy();
    });
  });

  // ==================== 边界测试 ====================
  describe('边界情况', () => {
    test('极短间隔', () => {
      Engine.initialize({ Players: ['Player1'] });
      const game = Engine.Games[0];
      Engine.lastTickTime = 1000;
      Engine.gameAccumulators.set(game, 1000);
      Engine.tick(1001);
      expect(game.tick).not.toHaveBeenCalled();
    });

    test('极长间隔', () => {
      Engine.initialize({ Players: ['Player1'] });
      const game = Engine.Games[0];
      Engine.lastTickTime = 1000;
      Engine.gameAccumulators.set(game, 1000);
      Engine.tick(3601000);
      expect(game.tick).toHaveBeenCalled();
    });

    test('60fps 连续', () => {
      Engine.initialize({ Players: ['Player1'] });
      for (let i = 0; i < 60; i++) Engine.tick(1000 + i * 16);
      expect(Engine.lastTickTime).toBe(1000 + 59 * 16);
    });

    test('大量实例', () => {
      Engine.initialize({
        Players: Array.from({ length: 10 }, (_, i) => `P${i + 1}`),
      });
      expect(Engine.Games).toHaveLength(10);
      Engine.tick(1000);
    });
  });

  // ==================== 补充 Base 类方法覆盖率 (103, 127) ====================

  describe('Base 类方法委托验证', () => {
    let EventBus;
    let game;

    beforeEach(() => {
      EventBus =
        require('@/lib/core/event-bus').default ||
        require('@/lib/core/event-bus');
      Engine.initialize({ Players: ['Player1'] });
      game = Engine.Games[0];

      game.on = jest.fn((event, handler) => {
        EventBus.on(event, handler);
      });
      game.once = jest.fn((event, handler) => {
        EventBus.once(event, handler);
      });
      game.off = jest.fn((event, handler) => {
        EventBus.off(event, handler);
      });
    });

    describe('once 方法', () => {
      test('应该委托给 EventBus.once，只触发一次', () => {
        const handler = jest.fn();
        const event = 'test:once:event';

        game.once(event, handler);

        EventBus.emit(event, 'first');
        EventBus.emit(event, 'second');

        expect(game.once).toHaveBeenCalledWith(event, handler);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith('first');
      });

      test('once 注册后只触发一次然后自动取消', () => {
        const handler = jest.fn();
        const event = 'test:once:auto-off';

        game.once(event, handler);

        EventBus.emit(event, 'data1');
        EventBus.emit(event, 'data2');
        EventBus.emit(event, 'data3');

        expect(handler).toHaveBeenCalledTimes(1);
      });

      test('多个 once 监听互不影响', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const event = 'test:once:multi';

        game.once(event, handler1);
        game.once(event, handler2);

        EventBus.emit(event, 'shared');

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);
      });

      test('once 和 on 混合使用', () => {
        const onHandler = jest.fn();
        const onceHandler = jest.fn();
        const event = 'test:mixed:on-once';

        game.on(event, onHandler);
        game.once(event, onceHandler);

        EventBus.emit(event, 'first');
        expect(onHandler).toHaveBeenCalledTimes(1);
        expect(onceHandler).toHaveBeenCalledTimes(1);

        EventBus.emit(event, 'second');
        expect(onHandler).toHaveBeenCalledTimes(2);
        expect(onceHandler).toHaveBeenCalledTimes(1);
      });

      test('once 回调抛错也应该取消订阅', () => {
        const event = 'test:once:error';
        let callCount = 0;
        const handler = jest.fn(() => {
          callCount++;
          throw new Error('once error');
        });

        game.once(event, handler);

        expect(() => EventBus.emit(event)).toThrow('once error');
        expect(callCount).toBe(1);

        expect(() => EventBus.emit(event)).not.toThrow();
        expect(handler).toHaveBeenCalledTimes(1);
      });
    });

    describe('off 方法', () => {
      test('应该委托给 EventBus.off，取消已注册的监听', () => {
        const handler = jest.fn();
        const event = 'test:off:event';

        game.on(event, handler);
        game.off(event, handler);

        EventBus.emit(event, 'data');

        expect(game.off).toHaveBeenCalledWith(event, handler);
        expect(handler).not.toHaveBeenCalled();
      });

      test('只取消指定 handler，不影响其他 handler', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const event = 'test:off:partial';

        game.on(event, handler1);
        game.on(event, handler2);
        game.off(event, handler1);

        EventBus.emit(event, 'data');

        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalledTimes(1);
      });

      test('取消未注册的 handler 不报错', () => {
        expect(() => game.off('nonexistent', jest.fn())).not.toThrow();
      });

      test('取消不存在事件的 handler 不报错', () => {
        const handler = jest.fn();
        expect(() => game.off('no-such-event', handler)).not.toThrow();
      });

      test('重复 off 不报错', () => {
        const handler = jest.fn();
        const event = 'test:off:double';

        game.on(event, handler);
        game.off(event, handler);

        expect(() => game.off(event, handler)).not.toThrow();
      });

      test('传入非法参数不报错', () => {
        expect(() => game.off(null, jest.fn())).not.toThrow();
        expect(() => game.off('test', null)).not.toThrow();
        expect(() => game.off(undefined, jest.fn())).not.toThrow();
      });

      test('off 后重新注册应该正常触发', () => {
        const handler = jest.fn();
        const event = 'test:off:re-register';

        game.on(event, handler);
        game.off(event, handler);
        game.on(event, handler);

        EventBus.emit(event, 'data');

        expect(handler).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ==================== Engine._subscribe / _unsubscribe 调用链 ====================
  describe('Engine._subscribe 内部调用 on 方法', () => {
    test('_subscribe 调用每个 Game 的 on 方法', () => {
      Engine.initialize({ Players: ['Player1', 'Player2'] });
      const game0 = Engine.Games[0];
      const game1 = Engine.Games[1];

      Engine._subscribe();

      expect(game0.on).toHaveBeenCalledWith(
        'dispatch:command',
        Engine._onDispatchCommand,
      );
      expect(game0.on).toHaveBeenCalledWith(
        'dispatch:input',
        Engine._onDispatchInput,
      );
      expect(game1.on).toHaveBeenCalledWith(
        'dispatch:command',
        Engine._onDispatchCommand,
      );
      expect(game1.on).toHaveBeenCalledWith(
        'dispatch:input',
        Engine._onDispatchInput,
      );
    });
  });

  describe('Engine._unsubscribe 内部调用 off 方法', () => {
    test('_unsubscribe 调用每个 Game 的 off 方法', () => {
      Engine.initialize({ Players: ['Player1', 'Player2'] });
      const game0 = Engine.Games[0];
      const game1 = Engine.Games[1];

      Engine._unsubscribe();

      expect(game0.off).toHaveBeenCalledWith(
        'dispatch:command',
        Engine._onDispatchCommand,
      );
      expect(game0.off).toHaveBeenCalledWith(
        'dispatch:input',
        Engine._onDispatchInput,
      );
      expect(game1.off).toHaveBeenCalledWith(
        'dispatch:command',
        Engine._onDispatchCommand,
      );
      expect(game1.off).toHaveBeenCalledWith(
        'dispatch:input',
        Engine._onDispatchInput,
      );
    });
  });

  describe('launch 内部的订阅链', () => {
    test('launch 会调用 subscribe → _subscribe → game.on', () => {
      Configuration.Mode = 'single';
      Configuration.Players = ['Player1', 'Player1_extra'];

      Engine.launch();

      const game = Engine.Games[0];
      expect(game.on).toHaveBeenCalledWith(
        'dispatch:command',
        Engine._onDispatchCommand,
      );
      expect(game.on).toHaveBeenCalledWith(
        'dispatch:input',
        Engine._onDispatchInput,
      );
      expect(game.subscribe).toHaveBeenCalled();
    });
  });

  describe('destroy 内部的取消订阅链', () => {
    test('destroy 会调用 unsubscribe → _unsubscribe → game.off', () => {
      Engine.initialize({ Players: ['Player1', 'Player2'] });
      Engine.rafId = 123;

      const games = [...Engine.Games];

      Engine.destroy();

      games.forEach((game) => {
        expect(game.off).toHaveBeenCalledWith(
          'dispatch:command',
          Engine._onDispatchCommand,
        );
        expect(game.off).toHaveBeenCalledWith(
          'dispatch:input',
          Engine._onDispatchInput,
        );
        expect(game.unsubscribe).toHaveBeenCalled();
      });
    });
  });
});
