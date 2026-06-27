/** @file Engine Core 完整单元测试 */

import Engine from '@/lib/engine';

const DISPATCH_COMMAND = 'game:test-game-uuid:dispatch:command';
const DISPATCH_INPUT = 'game:test-game-uuid:dispatch:input';

// ==================== Mock 模块 ====================

jest.mock('@/lib/engine/state/engine-store.js', () => ({
  __esModule: true,
  default: jest.fn(function (options = {}) {
    this.state = {
      Mode: options.Mode || 'single',
      Players: options.Players || ['Player1', 'Player1_extra'],
      victoryScore: options.victoryScore || 20,
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
    this.getVictoryScore = jest.fn(() => this.state.victoryScore);
    this.setVictoryScore = jest.fn(function (score) {
      this.state.victoryScore = score;
    });
    this.getBlockStyle = jest.fn(() => this.state.Block?.style);
    this.getBlockPattern = jest.fn(() => this.state.Block?.pattern);
  }),
}));

jest.mock('@/lib/engine/core/engine-renderer.js', () => ({
  __esModule: true,
  default: jest.fn(function () {
    this.render = jest.fn();
    this.destroy = jest.fn();
    this.templates = [];
  }),
}));

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

jest.mock('@/lib/engine/dispatch-input.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/engine/dispatch-command.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/core/event-bus', () => ({
  __esModule: true,
  default: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}));

global.requestAnimationFrame = jest.fn(() => 123);
global.cancelAnimationFrame = jest.fn();
global.structuredClone = jest.fn((obj) => JSON.parse(JSON.stringify(obj)));

describe('Engine Core - 完整测试', () => {
  let EngineStoreMock;
  let EngineRendererMock;
  let GameMock;
  let SchedulerMock;
  let AudioMock;
  let BattleMock;
  let dispatchInputMock;
  let dispatchCommandMock;

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

    test('versus 模式应该创建 Battle', () => {
      Engine.initialize({
        Mode: 'versus',
        Players: ['P1', 'P2'],
        Elements: {
          Battle: { overlay: 'battle-overlay', winner: 'battle-winner' },
        },
        victoryScore: 20,
      });
      expect(BattleMock).toHaveBeenCalledWith({
        games: Engine.Games,
        victoryScore: 20,
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

    test('应该初始化棋盘数据', () => {
      Engine.launch({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(Engine.Games[0].Store.resetBoard).toHaveBeenCalled();
    });

    test('应该加载最高分', () => {
      Engine.launch({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(Engine.Games[0].loadHighScore).toHaveBeenCalled();
    });

    test('isRelaunch 为 false 时应该使用 Store.getMode() 作为初始模式', () => {
      Engine.launch({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(Engine.Games[0].setBeginningState).toHaveBeenCalledWith(
        'game-mode',
      );
      expect(Engine.Games[0].UI.updateMode).toHaveBeenCalledWith('game-mode');
    });

    test('isRelaunch 为 true 时应该使用 main-menu 作为初始模式', () => {
      Engine.launch({
        Mode: 'single',
        Players: ['P1', 'P2'],
        isRelaunch: true,
      });
      expect(Engine.Games[0].setBeginningState).toHaveBeenCalledWith(
        'main-menu',
      );
      expect(Engine.Games[0].UI.updateMode).toHaveBeenCalledWith('main-menu');
    });

    test('应该更新 UI', () => {
      Engine.launch({ Mode: 'single', Players: ['P1', 'P2'] });
      const ui = Engine.Games[0].UI;
      expect(ui.resize).toHaveBeenCalled();
      expect(ui.updateHud).toHaveBeenCalled();
      expect(ui.updateController).toHaveBeenCalled();
      expect(ui.lazyRender).toHaveBeenCalled();
    });

    test('应该绑定事件和启动循环', () => {
      const s = jest.spyOn(Engine, 'subscribe');
      const t = jest.spyOn(Engine, 'start');
      Engine.launch({ Mode: 'single', Players: ['P1', 'P2'] });
      expect(Engine.Games[0].addEventListeners).toHaveBeenCalled();
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

    test('应该检查动画阻塞', () => {
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

    test('缺少 Gamepad/Keyboard 不报错', () => {
      delete game.Gamepad;
      delete game.Keyboard;
      expect(() => Engine.tick(1000)).not.toThrow();
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
      test('超过速度间隔时应该更新', () => {
        game.tick.mockClear();
        game.getSpeed.mockReturnValue(100);
        game.Replay.playing = false;
        Engine.lastTickTime = 1000;
        Engine.gameAccumulators.set(game, 1000);
        Engine.tick(1200);
        expect(game.tick).toHaveBeenCalled();
        expect(Engine.gameAccumulators.get(game)).toBe(1200);
      });

      test('未超过不应该更新', () => {
        game.tick.mockClear();
        game.getSpeed.mockReturnValue(1000);
        game.Replay.playing = false;
        Engine.lastTickTime = 1000;
        Engine.gameAccumulators.set(game, 1000);
        Engine.tick(1016);
        expect(game.tick).not.toHaveBeenCalled();
        expect(Engine.gameAccumulators.get(game)).toBe(1000);
      });

      test('回放中不应该更新', () => {
        game.tick.mockClear();
        game.getSpeed.mockReturnValue(100);
        game.Replay.playing = true;
        Engine.lastTickTime = 1000;
        Engine.gameAccumulators.set(game, 1000);
        Engine.tick(1200);
        expect(game.tick).not.toHaveBeenCalled();
      });
    });

    test('多个 Game 实例应该有各自独立的累积器', () => {
      Engine.Games = [];
      Engine.initialize({ Mode: 'versus', Players: ['P1', 'P2'] });
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

    test('执行顺序应该正确', () => {
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
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
    });

    test('subscribe 应该订阅所有模块', () => {
      const game = Engine.Games[0];
      Engine.subscribe();
      expect(game.on).toHaveBeenCalledWith(
        'game:test-game-uuid:dispatch:command',
        Engine._onDispatchCommand,
      );
      expect(game.on).toHaveBeenCalledWith(
        'game:test-game-uuid:dispatch:input',
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
        'game:test-game-uuid:dispatch:command',
        Engine._onDispatchCommand,
      );
      expect(game.off).toHaveBeenCalledWith(
        'game:test-game-uuid:dispatch:input',
        Engine._onDispatchInput,
      );
      expect(game.unsubscribe).toHaveBeenCalled();
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
        expect(g.removeEventListeners).toHaveBeenCalled();
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
      expect(game0.UI.render).toHaveBeenCalled();
      expect(game1.UI.render).toHaveBeenCalled();
      Engine.destroy();
    });
  });

  // ==================== 边界测试 ====================
  describe('边界情况', () => {
    test('极短间隔', () => {
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
      const game = Engine.Games[0];
      Engine.lastTickTime = 1000;
      Engine.gameAccumulators.set(game, 1000);
      Engine.tick(1001);
      expect(game.tick).not.toHaveBeenCalled();
    });

    test('极长间隔', () => {
      Engine.initialize({ Mode: 'single', Players: ['Player1', 'Player2'] });
      const game = Engine.Games[0];
      Engine.lastTickTime = 1000;
      Engine.gameAccumulators.set(game, 1000);
      Engine.tick(3601000);
      expect(game.tick).toHaveBeenCalled();
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
        // 用 mockImplementation 阻止 _onStart 真正执行，避免 destroy 干扰
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
