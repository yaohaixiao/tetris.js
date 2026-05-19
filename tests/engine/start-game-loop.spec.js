import Engine from '@/lib/engine';
import startGameLoop from '@/lib/engine/start-game-loop';

jest.mock('@/lib/engine', () => ({
  __esModule: true,
  default: {
    lastTickTime: 0,
    fixedAccumulator: 0,
    rafId: null,
    Scheduler: { tick: jest.fn() },
    Game: {
      UI: {
        tickHud: jest.fn(),
        render: jest.fn(),
      },
      Replay: {
        syncPlayElapsed: jest.fn(),
        update: jest.fn(),
        playing: false,
        startTime: 0,
      },
      Gamepad: {
        update: jest.fn(),
      },
      Animations: {
        hasBlocking: jest.fn().mockReturnValue(false),
        update: jest.fn(),
        render: jest.fn(),
      },
      CommandQueue: {
        flush: jest.fn(),
      },
      tick: jest.fn(),
      getSpeed: jest.fn().mockReturnValue(1000),
      Store: {
        getMode: jest.fn().mockReturnValue('playing'),
      },
    },
  },
}));

jest.mock('@/lib/configuration.js', () => ({}));

describe('startGameLoop', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Engine.lastTickTime = 0;
    Engine.fixedAccumulator = 0;
    Engine.rafId = null;
    Engine.Game.Replay.playing = false;
    Engine.Game.Animations.hasBlocking.mockReturnValue(false);
    Engine.Game.getSpeed.mockReturnValue(1000);

    globalThis.requestAnimationFrame = jest.fn(() => 123);
  });

  describe('初始化时间戳', () => {
    it('首次调用应初始化 timestamp 和 accumulator', () => {
      startGameLoop(5000);

      expect(Engine.lastTickTime).toBe(5000);
      expect(Engine.fixedAccumulator).toBe(5000);
    });
  });

  describe('基础调用链', () => {
    it('应调用 Scheduler.tick', () => {
      startGameLoop(10000);

      expect(Engine.Scheduler.tick).toHaveBeenCalledWith(10000);
    });

    it('应调用所有子系统', () => {
      startGameLoop(10000);

      expect(Engine.Scheduler.tick).toHaveBeenCalled();
      expect(Engine.Game.Replay.syncPlayElapsed).toHaveBeenCalled();
      expect(Engine.Game.Replay.update).toHaveBeenCalled();
      expect(Engine.Game.Gamepad.update).toHaveBeenCalled();
      expect(Engine.Game.CommandQueue.flush).toHaveBeenCalled();
      expect(Engine.Game.Animations.update).toHaveBeenCalled();
      expect(Engine.Game.UI.tickHud).toHaveBeenCalled();
      expect(Engine.Game.UI.render).toHaveBeenCalled();
      expect(Engine.Game.Animations.render).toHaveBeenCalled();
      expect(globalThis.requestAnimationFrame).toHaveBeenCalledWith(
        startGameLoop,
      );
    });
  });

  describe('delta 计算', () => {
    it('正常帧 delta 约为 16ms', () => {
      Engine.lastTickTime = 5000;
      startGameLoop(5016);

      expect(Engine.Game.Animations.update).toHaveBeenCalledWith(0.016);
    });

    it('超大时间差应限制 delta 为 1000', () => {
      Engine.lastTickTime = 1000;
      startGameLoop(2002000);

      expect(Engine.Game.Animations.update).toHaveBeenCalledWith(1000);
    });
  });

  describe('Game.tick 条件', () => {
    it('步长足够时应执行 tick', () => {
      Engine.lastTickTime = 5000;
      Engine.fixedAccumulator = 5000;
      Engine.Game.getSpeed.mockReturnValue(200);

      startGameLoop(5500);

      expect(Engine.Game.tick).toHaveBeenCalledWith(false);
    });

    it('步长不够时不执行 tick', () => {
      Engine.lastTickTime = 5000;
      Engine.fixedAccumulator = 5000;
      Engine.Game.getSpeed.mockReturnValue(2000);

      startGameLoop(5500);

      expect(Engine.Game.tick).not.toHaveBeenCalled();
    });

    it('tick 传递 isBlocked', () => {
      Engine.lastTickTime = 5000;
      Engine.fixedAccumulator = 5000;
      Engine.Game.Animations.hasBlocking.mockReturnValue(true);
      Engine.Game.getSpeed.mockReturnValue(200);

      startGameLoop(5500);

      expect(Engine.Game.tick).toHaveBeenCalledWith(true);
    });

    it('Replay.playing=true 时不执行 tick', () => {
      Engine.lastTickTime = 5000;
      Engine.fixedAccumulator = 5000;
      Engine.Game.Replay.playing = true;
      Engine.Game.getSpeed.mockReturnValue(200);

      startGameLoop(5500);

      expect(Engine.Game.tick).not.toHaveBeenCalled();
    });

    it('tick 后更新 accumulator', () => {
      Engine.lastTickTime = 5000;
      Engine.fixedAccumulator = 5000;
      Engine.Game.getSpeed.mockReturnValue(200);

      startGameLoop(5500);

      expect(Engine.fixedAccumulator).toBe(5500);
    });
  });

  describe('调用顺序', () => {
    it('应先 flush 再 tick（步长足够时）', () => {
      Engine.lastTickTime = 5000;
      Engine.fixedAccumulator = 5000;
      Engine.Game.getSpeed.mockReturnValue(200);

      startGameLoop(5500);

      const flushOrder =
        Engine.Game.CommandQueue.flush.mock.invocationCallOrder[0];
      const tickOrder = Engine.Game.tick.mock.invocationCallOrder[0];

      expect(flushOrder).toBeLessThan(tickOrder);
    });

    it('应先 UI.render 再 Animations.render', () => {
      startGameLoop(5000);

      const uiOrder = Engine.Game.UI.render.mock.invocationCallOrder[0];
      const animOrder =
        Engine.Game.Animations.render.mock.invocationCallOrder[0];

      expect(uiOrder).toBeLessThan(animOrder);
    });
  });

  describe('边界情况', () => {
    it('不应崩溃', () => {
      expect(() => startGameLoop(5000)).not.toThrow();
    });
  });
});
