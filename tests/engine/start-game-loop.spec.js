import startGameLoop from '@/lib/engine/start-game-loop.js';

jest.mock('@/lib/engine', () => ({
  __esModule: true,
  default: {
    lastTickTime: null,
    fixedAccumulator: null,
    rafId: null,
    Game: null,
    Scheduler: null,
  },
}));

global.requestAnimationFrame = jest.fn(() => 1);

const Engine = require('@/lib/engine').default;

function resetEngine() {
  Engine.lastTickTime = null;
  Engine.fixedAccumulator = null;
  Engine.rafId = null;
  Engine.Game = null;
  Engine.Scheduler = null;
}

function mockGame(getSpeed = 500) {
  return {
    getSpeed: jest.fn(() => getSpeed),
    tick: jest.fn(),
    UI: { tickHud: jest.fn(), render: jest.fn() },
    Replay: { playing: false, syncPlayElapsed: jest.fn(), update: jest.fn() },
    Gamepad: { update: jest.fn() },
    Animations: {
      hasBlocking: jest.fn(() => false),
      flush: jest.fn(),
      render: jest.fn(),
    },
    CommandQueue: { flush: jest.fn() },
  };
}

function setup(overrides = {}) {
  resetEngine();
  const Game = mockGame(overrides.getSpeed);
  Object.assign(Game.Replay, overrides.Replay);
  Object.assign(Game.Animations, overrides.Animations);

  Engine.Game = Game;
  Engine.Scheduler = {
    tick: jest.fn(),
    delay: jest.fn(),
    interval: jest.fn(),
    sequence: jest.fn(),
    cancel: jest.fn(),
    clear: jest.fn(),
  };

  return { Game, Scheduler: Engine.Scheduler };
}

describe('startGameLoop', () => {
  // 步骤1：死亡螺旋
  it('步骤1：delta > 1000ms 时流程不中断', () => {
    const { Scheduler } = setup();
    Engine.lastTickTime = 1;
    startGameLoop(2000);
    expect(Scheduler.tick).toHaveBeenCalled();
  });

  // 步骤2：Scheduler
  it('步骤2：Scheduler.tick 以 timestamp 调用', () => {
    const { Scheduler } = setup();
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(Scheduler.tick).toHaveBeenCalledWith(100);
  });

  // 步骤3：Replay.syncPlayElapsed
  it('步骤3：调用 Replay.syncPlayElapsed', () => {
    const { Game } = setup();
    Engine.lastTickTime = 50;
    startGameLoop(100);
    expect(Game.Replay.syncPlayElapsed).toHaveBeenCalledWith({
      timestamp: 100,
      isBlocked: false,
    });
  });

  it('步骤3：阻塞时 isBlocked 为 true', () => {
    const { Game } = setup({
      Animations: { hasBlocking: jest.fn(() => true) },
    });
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(Game.Replay.syncPlayElapsed).toHaveBeenCalledWith(
      expect.objectContaining({ isBlocked: true }),
    );
  });

  // 步骤4：Replay.update
  it('步骤4：调用 Replay.update', () => {
    const { Game } = setup();
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(Game.Replay.update).toHaveBeenCalledWith({
      speed: 500,
      timestamp: 100,
    });
  });

  // 步骤5：Gamepad
  it('步骤5：调用 Gamepad.update', () => {
    const { Game } = setup();
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(Game.Gamepad.update).toHaveBeenCalledWith(100);
  });

  // 步骤6：CommandQueue
  it('步骤6：调用 CommandQueue.flush', () => {
    const { Game } = setup();
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(Game.CommandQueue.flush).toHaveBeenCalled();
  });

  // 步骤7：Game.tick
  it('步骤7：首次执行 fixedAccumulator 为 null 时调用 Game.tick', () => {
    const { Game } = setup();
    Engine.lastTickTime = 1;
    Engine.fixedAccumulator = null;
    startGameLoop(100);
    expect(Game.tick).toHaveBeenCalledWith(false);
    expect(Engine.fixedAccumulator).toBe(100);
  });

  it('步骤7：stepDelta > getSpeed 时调用 Game.tick', () => {
    const { Game } = setup({ getSpeed: 500 });
    Engine.lastTickTime = 1;
    Engine.fixedAccumulator = 1;
    startGameLoop(600);
    expect(Game.tick).toHaveBeenCalled();
  });

  it('步骤7：stepDelta <= getSpeed 时不调用 Game.tick', () => {
    const { Game } = setup({ getSpeed: 500 });
    Engine.lastTickTime = 1;
    Engine.fixedAccumulator = 1;
    startGameLoop(100);
    expect(Game.tick).not.toHaveBeenCalled();
  });

  it('步骤7：Replay.playing 时不调用 Game.tick', () => {
    const { Game } = setup({ Replay: { playing: true } });
    Engine.lastTickTime = 1;
    Engine.fixedAccumulator = null;
    startGameLoop(600);
    expect(Game.tick).not.toHaveBeenCalled();
  });

  it('步骤7：阻塞时传递 isBlocked = true', () => {
    const { Game } = setup({
      Animations: { hasBlocking: jest.fn(() => true) },
    });
    Engine.lastTickTime = 1;
    Engine.fixedAccumulator = null;
    startGameLoop(600);
    expect(Game.tick).toHaveBeenCalledWith(true);
  });

  // 步骤8：Animations.flush
  it('步骤8：调用 Animations.flush', () => {
    const { Game } = setup();
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(Game.Animations.flush).toHaveBeenCalled();
  });

  // 步骤9：HUD
  it('步骤9：调用 UI.tickHud', () => {
    const { Game } = setup();
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(Game.UI.tickHud).toHaveBeenCalled();
  });

  // 步骤10：UI.render
  it('步骤10：调用 UI.render', () => {
    const { Game } = setup();
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(Game.UI.render).toHaveBeenCalled();
  });

  // 步骤11：Animations.render
  it('步骤11：调用 Animations.render', () => {
    const { Game } = setup();
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(Game.Animations.render).toHaveBeenCalled();
  });

  // 步骤12：requestAnimationFrame
  it('步骤12：调用 requestAnimationFrame', () => {
    setup();
    Engine.lastTickTime = 1;
    startGameLoop(100);
    expect(requestAnimationFrame).toHaveBeenCalledWith(startGameLoop);
    expect(Engine.rafId).toBe(1);
  });

  // 执行顺序
  it('应该按正确顺序调用各模块', () => {
    const callOrder = [];
    const { Game, Scheduler } = setup();

    Scheduler.tick.mockImplementation(() => callOrder.push('scheduler'));
    Game.Replay.syncPlayElapsed.mockImplementation(() =>
      callOrder.push('syncElapsed'),
    );
    Game.Replay.update.mockImplementation(() => callOrder.push('replay'));
    Game.Gamepad.update.mockImplementation(() => callOrder.push('gamepad'));
    Game.CommandQueue.flush.mockImplementation(() =>
      callOrder.push('commandQueue'),
    );
    Game.tick.mockImplementation(() => callOrder.push('game'));
    Game.Animations.flush.mockImplementation(() => callOrder.push('animFlush'));
    Game.UI.tickHud.mockImplementation(() => callOrder.push('hud'));
    Game.UI.render.mockImplementation(() => callOrder.push('uiRender'));
    Game.Animations.render.mockImplementation(() =>
      callOrder.push('animRender'),
    );

    Engine.lastTickTime = 1;
    Engine.fixedAccumulator = null;
    startGameLoop(600);

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
