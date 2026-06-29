/** @file Engine Core 完整单元测试 */

import Engine from '@/lib/engine';

// 事件名称常量，与 Game 实例的 UUID 绑定
const DISPATCH_COMMAND = 'game:test-game-uuid:dispatch:command';
const DISPATCH_INPUT = 'game:test-game-uuid:dispatch:input';

// ==================== Mock 模块 ====================

/**
 * Mock EngineStore
 *
 * 模拟引擎全局状态管理器。构造函数接收 options 并与默认值合并，
 * 生成包含 Mode、Players、VictoryScore、Elements 等配置的 state 对象。
 * 所有方法均为 jest.fn()，可在测试中追踪调用和修改行为。
 *
 * VictoryScore 按难度分级存储（easy/normal/hard/expert），
 * getVictoryScore 和 setVictoryScore 的签名已更新为 (difficulty, score?)。
 */
jest.mock('@/lib/engine/state/engine-store.js', () => ({
  __esModule: true,
  default: jest.fn(function (options = {}) {
    this.state = {
      Mode: options.Mode || 'single',
      Players: options.Players || ['Player1', 'Player1_extra'],
      VictoryScore: options.VictoryScore || {
        easy: 5,
        normal: 8,
        hard: 12,
        expert: 15,
      },
      Elements: options.Elements || {
        Battle: {
          overlay: 'tetris-battle-overlay',
          over: 'tetris-battle-over',
          winner: 'tetris-battle-winner',
          fly: 'tetris-battle-fly',
        },
        Container: 'tetris-container',
        Canvas: {
          cols: 10,
          rows: 20,
          board: 'board',
          next: 'next',
          hold: 'hold',
        },
        Hud: {
          controller: 'ctrl',
          score: 'score',
          lines: 'lines',
          level: 'level',
          combo: 'combo',
          highScore: 'hi',
        },
        Controls: {
          back: 'back',
          hold: 'hold',
          start: 'start',
          up: 'up',
          down: 'down',
          left: 'left',
          right: 'right',
          a: 'a',
          b: 'b',
          x: 'x',
          y: 'y',
        },
      },
    };
    this.getState = jest.fn(() => this.state);
    this.isVersus = jest.fn(() => this.state.Mode === 'versus');
    this.getMode = jest.fn(() => this.state.Mode);
    this.setMode = jest.fn(function (mode) {
      this.state.Mode = mode;
    });
    this.setPlayers = jest.fn(function (players) {
      this.state.Players = players;
    });
    this.reset = jest.fn(function () {
      this.state.Mode = 'single';
    });
    this.getVictoryScore = jest.fn(function (difficulty = 'easy') {
      return this.state.VictoryScore[difficulty];
    });
    this.setVictoryScore = jest.fn(function (difficulty, score) {
      this.state.VictoryScore[difficulty] = score;
    });
    this.getBlockStyle = jest.fn(() => this.state.Block?.style);
    this.getBlockPattern = jest.fn(() => this.state.Block?.pattern);
  }),
}));

/**
 * Mock EngineRenderer
 *
 * 模拟引擎渲染器，提供 render、destroy 方法和 templates 数组。
 */
jest.mock('@/lib/engine/core/engine-renderer.js', () => ({
  __esModule: true,
  default: jest.fn(function () {
    this.render = jest.fn();
    this.destroy = jest.fn();
    this.templates = [];
  }),
}));

/**
 * Mock Scheduler
 *
 * 模拟游戏调度器，提供 tick 方法用于控制时间流逝。
 */
jest.mock('@/lib/engine/scheduler.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({ tick: jest.fn() })),
}));

/**
 * Mock Audio
 *
 * 模拟音频服务，提供 subscribe 和 unsubscribe 方法。
 */
jest.mock('@/lib/services/audio', () => ({
  __esModule: true,
  default: jest.fn(() => ({ subscribe: jest.fn(), unsubscribe: jest.fn() })),
}));

/**
 * Mock Game
 *
 * 模拟单个游戏实例。包含 Store（状态）、UI（界面）、Replay（回放）、
 * Gamepad（手柄）、Keyboard（键盘）、Animations（动画）、CommandQueue（命令队列）、
 * flush（每帧刷新，由 Engine.tick 调用）等子模块。
 * 所有子模块的方法均为 jest.fn()，可追踪调用。
 *
 * config 参数会存储在 _config 属性中，便于测试断言。
 */
jest.mock('@/lib/game', () => ({
  __esModule: true,
  default: jest.fn((config) => ({
    id: 'test-game-uuid',
    Store: {
      resetBoard: jest.fn(),
      getMode: jest.fn(() => 'game-mode'),
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
    flush: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    _config: config,
  })),
}));

/**
 * Mock BattleController
 *
 * 模拟对战控制器，提供 subscribe 和 unsubscribe 方法。
 */
jest.mock('@/lib/battle/battle-controller.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({ subscribe: jest.fn(), unsubscribe: jest.fn() })),
}));

/**
 * Mock dispatchInput
 *
 * 模拟输入分发函数。Engine._onDispatchInput 收集输入数据后调用此函数。
 */
jest.mock('@/lib/engine/dispatch-input.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

/**
 * Mock dispatchCommand
 *
 * 模拟命令分发函数。Engine._onDispatchCommand 收集命令数据后调用此函数。
 */
jest.mock('@/lib/engine/dispatch-command.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

/**
 * Mock EventBus
 *
 * 模拟事件总线，提供 on、off、emit 方法。Engine 使用它来管理全局事件。
 */
jest.mock('@/lib/core/event-bus', () => ({
  __esModule: true,
  default: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}));

// 全局浏览器 API 的 mock
global.requestAnimationFrame = jest.fn(() => 123);
global.cancelAnimationFrame = jest.fn();
global.structuredClone = jest.fn((obj) => JSON.parse(JSON.stringify(obj)));

/**
 * Engine Core 完整测试套件
 *
 * 覆盖 Engine 对象的以下功能：
 * - 初始状态验证
 * - initialize（初始化各个模块，Game 实例在构造函数中自动 launch）
 * - launch（完整启动流程：initialize + subscribe + start）
 * - tick（游戏主循环，Engine 遍历 Game 调用 Game.flush）
 * - subscribe / unsubscribe（事件订阅管理）
 * - _onDispatchCommand / _onDispatchInput（命令和输入分发）
 * - start / stop / restart（生命周期控制）
 * - destroy（资源清理）
 * - 全局事件处理器（_onUpdateMode、_onUpdatePlayers、_onStart、_onExit）
 * - 集成测试（完整生命周期 + versus 模式）
 * - 边界情况（极短/极长帧间隔）
 */
describe('Engine Core - 完整测试', () => {
  let EngineStoreMock;
  let EngineRendererMock;
  let GameMock;
  let SchedulerMock;
  let AudioMock;
  let BattleMock;
  let dispatchInputMock;
  let dispatchCommandMock;

  /**
   * 每个测试用例前的准备工作：
   * - 清除所有 mock 的调用记录
   * - 重新引用各 mock 模块（确保每个测试拿到干净的 mock 实例）
   * - 重置 Engine 的静态属性，避免测试间状态污染
   */
  beforeEach(() => {
    jest.clearAllMocks();

    EngineStoreMock = require('@/lib/engine/state/engine-store.js').default;
    EngineRendererMock =
      require('@/lib/engine/core/engine-renderer.js').default;
    GameMock = require('@/lib/game').default;
    SchedulerMock = require('@/lib/engine/scheduler.js').default;
    AudioMock = require('@/lib/services/audio').default;
    BattleMock = require('@/lib/battle/battle-controller.js').default;
    dispatchInputMock = require('@/lib/engine/dispatch-input.js').default;
    dispatchCommandMock = require('@/lib/engine/dispatch-command.js').default;

    requestAnimationFrame.mockReturnValue(123);

    Engine.rafId = null;
    Engine.fixedAccumulator = 0;
    Engine.lastTickTime = 0;
    Engine.Games = [];
    Engine.Battle = null;
    Engine.Scheduler = null;
    Engine.Audio = null;
    Engine.Store = null;
    Engine.Renderer = null;
    Engine.gameAccumulators = new Map();
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
      expect(Engine.Battle).toBeNull();
      expect(Engine.Store).toBeNull();
      expect(Engine.Renderer).toBeNull();
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
      ].forEach((m) => {
        expect(typeof Engine[m]).toBe('function');
      });
    });

    test('gameAccumulators 应该是 Map 实例', () => {
      expect(Engine.gameAccumulators).toBeInstanceOf(Map);
    });
  });

  // ==================== initialize ====================
  describe('initialize', () => {
    test('应该创建 EngineStore', () => {
      Engine.initialize({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(EngineStoreMock).toHaveBeenCalledTimes(1);
      expect(Engine.Store).toBeDefined();
    });

    test('应该创建 EngineRenderer 并调用 render', () => {
      Engine.initialize({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(EngineRendererMock).toHaveBeenCalledTimes(1);
      expect(Engine.Renderer.render).toHaveBeenCalled();
    });

    test('应该创建 Scheduler', () => {
      Engine.initialize({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(SchedulerMock).toHaveBeenCalledTimes(1);
      expect(Engine.Scheduler).toBeDefined();
    });

    test('应该创建 Audio', () => {
      Engine.initialize({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(AudioMock).toHaveBeenCalledTimes(1);
      expect(AudioMock.mock.calls[0][0].Scheduler).toBe(Engine.Scheduler);
      expect(AudioMock.mock.calls[0][0].isAIPlayer).toBe(true);
    });

    test('versus 模式应该创建正确数量 Game', () => {
      Engine.initialize({ Mode: 'versus', Players: ['P1', 'P2', 'P3'] });
      expect(GameMock).toHaveBeenCalledTimes(3);
      expect(Engine.Games).toHaveLength(3);
    });

    test('Game 应该接收正确 Player 配置', () => {
      Engine.initialize({ Mode: 'versus', Players: ['Alice', 'Bob'] });
      expect(GameMock.mock.calls[0][0].Player).toEqual({
        index: 0,
        name: 'Alice',
      });
      expect(GameMock.mock.calls[1][0].Player).toEqual({
        index: 1,
        name: 'Bob',
      });
    });

    test('single 模式应该只创建一个 Game', () => {
      Engine.initialize({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(GameMock).toHaveBeenCalledTimes(1);
      expect(Engine.Games).toHaveLength(1);
      expect(GameMock.mock.calls[0][0].Player.name).toBe('P1');
    });

    test('Game 实例应该收到正确的配置参数', () => {
      Engine.initialize({ Mode: 'single', Players: ['P1', 'P2'] });
      const gameConfig = GameMock.mock.calls[0][0];
      expect(gameConfig.Player).toEqual({ index: 0, name: 'P1' });
      expect(gameConfig.Scheduler).toBe(Engine.Scheduler);
      expect(gameConfig.isAIPlayer).toBe(true);
      expect(gameConfig.Mode).toBe('single');
    });

    test('isRelaunch 为 true 时应传入 isRelaunch 标志', () => {
      Engine.initialize({
        Mode: 'single',
        Players: ['P1', 'P2'],
        isRelaunch: true,
      });
      const gameConfig = GameMock.mock.calls[0][0];
      expect(gameConfig.isRelaunch).toBe(true);
    });

    test('versus 模式应该创建 Battle', () => {
      Engine.initialize({
        Mode: 'versus',
        Players: ['P1', 'P2'],
        Elements: {
          Battle: { overlay: 'battle-overlay', winner: 'battle-winner' },
        },
        VictoryScore: {
          easy: 5,
          normal: 8,
          hard: 12,
          expert: 15,
        },
      });
      expect(BattleMock).toHaveBeenCalledWith({
        games: Engine.Games,
        VictoryScore: {
          easy: 5,
          normal: 8,
          hard: 12,
          expert: 15,
        },
        elements: { overlay: 'battle-overlay', winner: 'battle-winner' },
        players: ['P1', 'P2'],
      });
      expect(Engine.Battle).toBeDefined();
    });

    test('非 versus 不应该创建 Battle', () => {
      Engine.initialize({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(BattleMock).not.toHaveBeenCalled();
      expect(Engine.Battle).toBeNull();
    });
  });

  // ==================== launch ====================
  describe('launch', () => {
    test('应该调用 initialize', () => {
      const spy = jest.spyOn(Engine, 'initialize');
      Engine.launch({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    test('应该调用 subscribe 和 start', () => {
      const s = jest.spyOn(Engine, 'subscribe');
      const t = jest.spyOn(Engine, 'start');
      Engine.launch({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(s).toHaveBeenCalled();
      expect(t).toHaveBeenCalled();
      s.mockRestore();
      t.mockRestore();
    });

    test('versus 模式 launch', () => {
      Engine.launch({
        Mode: 'versus',
        Players: ['P1', 'P2'],
        Elements: { Battle: { overlay: 'battle-overlay' } },
      });
      expect(Engine.Games).toHaveLength(2);
      expect(Engine.Battle).toBeDefined();
    });
  });

  // ==================== tick ====================
  describe('tick - 游戏主循环', () => {
    let game;

    beforeEach(() => {
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
      game = Engine.Games[0];
    });

    test('首次调用应该初始化时间基准和累积器', () => {
      Engine.lastTickTime = 0;
      Engine.gameAccumulators.clear();
      Engine.tick(1000);
      expect(Engine.lastTickTime).toBe(1000);
      expect(Engine.fixedAccumulator).toBe(1000);
      expect(Engine.gameAccumulators.get(game)).toBe(1000);
    });

    test('非首次应该更新 lastTickTime', () => {
      Engine.lastTickTime = 1000;
      Engine.fixedAccumulator = 1000;
      Engine.tick(1100);
      expect(Engine.lastTickTime).toBe(1100);
    });

    test('应该调用 Scheduler.tick', () => {
      Engine.tick(1000);
      expect(Engine.Scheduler.tick).toHaveBeenCalledWith(1000);
    });

    test('应该调用每个 Game 的 flush', () => {
      Engine.tick(1000);
      expect(game.flush).toHaveBeenCalledWith(
        1000,
        Engine.lastTickTime,
        Engine.gameAccumulators,
      );
    });

    test('应该请求下一帧', () => {
      Engine.tick(1000);
      expect(requestAnimationFrame).toHaveBeenCalledWith(Engine.tick);
    });

    test('多个 Game 实例应该各自调用 flush', () => {
      Engine.Games = [];
      Engine.initialize({ Mode: 'versus', Players: ['P1', 'P2'] });
      const game0 = Engine.Games[0];
      const game1 = Engine.Games[1];
      Engine.tick(1000);
      expect(game0.flush).toHaveBeenCalled();
      expect(game1.flush).toHaveBeenCalled();
    });

    test('空 Games 不报错', () => {
      Engine.Games = [];
      expect(() => Engine.tick(1000)).not.toThrow();
    });
  });

  // ==================== subscribe / unsubscribe ====================
  describe('subscribe 和 unsubscribe', () => {
    beforeEach(() => {
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
    });

    test('subscribe 应该订阅 Engine 内部 dispatch 事件', () => {
      const game = Engine.Games[0];
      Engine.subscribe();
      expect(game.on).toHaveBeenCalledWith(
        DISPATCH_COMMAND,
        Engine._onDispatchCommand,
      );
      expect(game.on).toHaveBeenCalledWith(
        DISPATCH_INPUT,
        Engine._onDispatchInput,
      );
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
        DISPATCH_COMMAND,
        Engine._onDispatchCommand,
      );
      expect(game.off).toHaveBeenCalledWith(
        DISPATCH_INPUT,
        Engine._onDispatchInput,
      );
      expect(Engine.Audio.unsubscribe).toHaveBeenCalled();
    });

    test('versus 模式应该调用 Battle 订阅', () => {
      Engine.Battle = { subscribe: jest.fn(), unsubscribe: jest.fn() };
      Engine.Store = { isVersus: jest.fn(() => true) };
      Engine.subscribe();
      expect(Engine.Battle.subscribe).toHaveBeenCalled();
      Engine.unsubscribe();
      expect(Engine.Battle.unsubscribe).toHaveBeenCalled();
    });
  });

  // ==================== _onDispatchCommand ====================
  describe('_onDispatchCommand', () => {
    test('应该注入 isBlocked 并调用 dispatchCommand', () => {
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
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
  });

  // ==================== _onDispatchInput ====================
  describe('_onDispatchInput', () => {
    test('应该计算时间差并注入状态', () => {
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
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
  });

  // ==================== start / stop / restart ====================
  describe('start', () => {
    test('应该启动 RAF', () => {
      Engine.start();
      expect(requestAnimationFrame).toHaveBeenCalledWith(Engine.tick);
      expect(Engine.rafId).toBe(123);
    });
  });

  describe('stop', () => {
    test('应该停止并重置', () => {
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
  });

  describe('restart', () => {
    test('应该先 stop 再 start', () => {
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
      Engine.initialize({ Mode: 'single', Players: ['P1', 'P2'] });
      Engine.rafId = 123;
    });

    test('应该完整清理', () => {
      const rendererDestroy = Engine.Renderer.destroy;
      const a = jest.spyOn(Engine, 'stop');
      const b = jest.spyOn(Engine, 'unsubscribe');
      Engine.destroy();
      expect(a).toHaveBeenCalled();
      expect(b).toHaveBeenCalled();
      Engine.Games.forEach((g) => {
        expect(g.destroy).toHaveBeenCalled();
      });
      expect(Engine.Audio).toBeNull();
      expect(Engine.Scheduler).toBeNull();
      expect(Engine.Games).toEqual([]);
      expect(Engine.Store).toBeNull();
      expect(rendererDestroy).toHaveBeenCalled();
      expect(Engine.Renderer).toBeNull();
      a.mockRestore();
      b.mockRestore();
    });
  });

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('完整生命周期', () => {
      Engine.launch({ Mode: 'single', Players: ['Player1', 'Player2'] });
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

    test('versus 模式', () => {
      Engine.launch({
        Mode: 'versus',
        Players: ['P1', 'P2'],
        Elements: { Battle: { overlay: 'battle-overlay' } },
      });
      expect(Engine.Games).toHaveLength(2);
      expect(Engine.Battle).toBeDefined();
      Engine.lastTickTime = 0;
      Engine.tick(1000);
      const game0 = Engine.Games[0];
      const game1 = Engine.Games[1];
      expect(Engine.gameAccumulators.get(game0)).toBe(1000);
      expect(Engine.gameAccumulators.get(game1)).toBe(1000);
      expect(game0.flush).toHaveBeenCalled();
      expect(game1.flush).toHaveBeenCalled();
      Engine.destroy();
    });
  });

  // ==================== 边界测试 ====================
  describe('边界情况', () => {
    test('极短间隔也应正常执行', () => {
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
      const game = Engine.Games[0];
      Engine.lastTickTime = 1000;
      Engine.gameAccumulators.set(game, 1000);
      Engine.tick(1001);
      expect(game.flush).toHaveBeenCalled();
    });

    test('极长间隔也应正常执行', () => {
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
      const game = Engine.Games[0];
      Engine.lastTickTime = 1000;
      Engine.gameAccumulators.set(game, 1000);
      Engine.tick(3601000);
      expect(game.flush).toHaveBeenCalled();
    });
  });

  // ==================== 全局 engine 事件处理器 ====================
  describe('全局 engine 事件处理器', () => {
    beforeEach(() => {
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
    });

    describe('_onUpdateMode', () => {
      test('应该更新 Store 中的 Mode', () => {
        Engine._onUpdateMode({ mode: 'versus' });
        expect(Engine.Store.setMode).toHaveBeenCalledWith('versus');
      });
    });

    describe('_onUpdatePlayers', () => {
      test('应该更新 Store 中的 Players', () => {
        Engine._onUpdatePlayers({ players: ['human', 'ai'] });
        expect(Engine.Store.setPlayers).toHaveBeenCalledWith(['human', 'ai']);
      });
    });

    describe('_onStart', () => {
      test('isRelaunch = true 时应该深拷贝状态并重新 launch', () => {
        const destroySpy = jest.spyOn(Engine, 'destroy');
        const launchSpy = jest.spyOn(Engine, 'launch');
        Engine._onStart({ isRelaunch: true });
        expect(structuredClone).toHaveBeenCalled();
        expect(destroySpy).toHaveBeenCalled();
        expect(launchSpy).toHaveBeenCalled();
        destroySpy.mockRestore();
        launchSpy.mockRestore();
      });

      test('isRelaunch = false 时应该强制 Mode 为 single', () => {
        const launchSpy = jest.spyOn(Engine, 'launch');
        Engine._onStart({ isRelaunch: false });
        const clonedArg = launchSpy.mock.calls[0][0];
        expect(clonedArg.Mode).toBe('single');
        launchSpy.mockRestore();
      });
    });

    describe('_onExit', () => {
      test('应该重置 Store 并以单人模式重新启动', () => {
        const startSpy = jest
          .spyOn(Engine, '_onStart')
          .mockImplementation(() => {});
        Engine._onExit();
        expect(Engine.Store.reset).toHaveBeenCalled();
        expect(startSpy).toHaveBeenCalledWith({
          isRelaunch: false,
          Mode: 'single',
        });
        startSpy.mockRestore();
      });
    });
  });
});
