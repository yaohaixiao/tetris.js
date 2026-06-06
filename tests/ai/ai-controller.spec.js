import AIController from '@/lib/ai/ai-controller.js';
import EventBus from '@/lib/core/event-bus/index.js';

// Mock 依赖
jest.mock('@/lib/ai/planner/self-play.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import selfPlay from '@/lib/ai/planner/self-play.js';

describe('AIController', () => {
  let ai;
  let mockGame;
  let mockStore;
  let mockScheduler;
  let mockAnimations;
  let emitSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    emitSpy = jest.spyOn(EventBus, 'emit');

    mockStore = {
      getState: jest.fn().mockReturnValue({
        mode: 'playing',
        board: Array.from({ length: 20 }, () =>
          Array.from({ length: 10 }, () => 0),
        ),
        curr: {
          shape: [
            [0, 1, 0],
            [1, 1, 1],
          ],
          color: '#00c8ff',
        },
        cx: 3,
        cy: 0,
      }),
      getDifficulty: jest.fn().mockReturnValue('easy'),
    };

    mockScheduler = {
      delay: jest.fn().mockReturnValue(1),
      cancel: jest.fn(),
      sequence: jest.fn(),
    };

    mockAnimations = {
      hasBlocking: jest.fn().mockReturnValue(false),
    };

    mockGame = {
      id: 'test-ai-uuid',
      Store: mockStore,
      Scheduler: mockScheduler,
      Animations: mockAnimations,
      getSpeed: jest.fn().mockReturnValue(200),
      emit: jest.fn(),
    };

    const mockOn = jest.fn();
    const mockOff = jest.fn();

    selfPlay.mockReturnValue(null);

    ai = new AIController({
      Game: mockGame,
      Store: mockStore,
      Scheduler: mockScheduler,
    });

    ai.Animations = mockAnimations;
    ai.on = mockOn;
    ai.off = mockOff;
  });

  afterEach(() => {
    jest.useRealTimers();
    emitSpy.mockRestore();
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 AIController 实例', () => {
      expect(ai).toBeDefined();
      expect(ai).toBeInstanceOf(AIController);
    });

    it('应该正确初始化默认值', () => {
      expect(ai.enabled).toBe(false);
      expect(ai.actions).toEqual([]);
      expect(ai.aiSchedulerId).toBe(0);
    });

    it('应该正确注入依赖', () => {
      expect(ai.Game).toBe(mockGame);
      expect(ai.Store).toBe(mockStore);
      expect(ai.Scheduler).toBe(mockScheduler);
    });
  });

  // ==================== start / stop ====================
  describe('start / stop', () => {
    it('start 应该设置 enabled 为 true', () => {
      ai.start();
      expect(ai.enabled).toBe(true);
    });

    it('start 应该调用 loop', () => {
      const loopSpy = jest.spyOn(ai, 'loop');
      ai.start();
      expect(loopSpy).toHaveBeenCalled();
      loopSpy.mockRestore();
    });

    it('stop 应该设置 enabled 为 false', () => {
      ai.enabled = true;
      ai.aiSchedulerId = 1;
      ai.stop();
      expect(ai.enabled).toBe(false);
    });

    it('stop 应该清空 actions', () => {
      ai.actions = ['MOVE_LEFT', 'DROP'];
      ai.stop();
      expect(ai.actions).toEqual([]);
    });

    it('stop 应该取消调度任务', () => {
      ai.aiSchedulerId = 42;
      ai.stop();
      expect(mockScheduler.cancel).toHaveBeenCalledWith(42);
    });

    it('stop 应该重置 aiSchedulerId 为 0', () => {
      ai.aiSchedulerId = 42;
      ai.stop();
      expect(ai.aiSchedulerId).toBe(0);
    });
  });

  // ==================== loop ====================
  describe('loop 方法', () => {
    it('enabled 为 false 时应该直接返回', () => {
      ai.enabled = false;
      ai.loop();
      expect(mockStore.getState).not.toHaveBeenCalled();
      expect(mockScheduler.delay).not.toHaveBeenCalled();
    });

    it('mode 不是 playing 时应该延迟重试', () => {
      mockStore.getState.mockReturnValue({
        mode: 'paused',
        board: [],
        curr: null,
        cx: 0,
        cy: 0,
      });
      ai.enabled = true;
      ai.loop();
      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 100);
    });

    it('动画阻塞时应该延迟重试', () => {
      mockAnimations.hasBlocking.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        mode: 'playing',
        board: [],
        curr: null,
        cx: 0,
        cy: 0,
      });
      ai.enabled = true;
      ai.loop();
      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 100);
    });

    it('正常模式且无 actions 时应该调用 think', () => {
      const thinkSpy = jest.spyOn(ai, 'think').mockReturnValue(null);
      ai.enabled = true;
      ai.loop();
      expect(thinkSpy).toHaveBeenCalled();
      thinkSpy.mockRestore();
    });

    it('think 返回最佳移动时应该设置 actions', () => {
      const bestMove = { board: [], actions: ['MOVE_LEFT', 'DROP'] };
      jest.spyOn(ai, 'think').mockReturnValue(bestMove);
      ai.enabled = true;
      ai.loop();
      // 第一个 action 已被 shift 执行
      expect(emitSpy).toHaveBeenCalledWith('dispatch:input', {
        device: 'ai',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
      expect(ai.actions).toEqual(['DROP']);
    });

    it('think 返回 null 时不应该修改 actions', () => {
      ai.actions = [];
      jest.spyOn(ai, 'think').mockReturnValue(null);
      ai.enabled = true;
      ai.loop();
      expect(ai.actions).toEqual([]);
    });

    it('应该逐个发送 action 事件', () => {
      ai.actions = ['MOVE_LEFT', 'ROTATE', 'DROP'];
      ai.enabled = true;

      ai.loop();
      expect(emitSpy).toHaveBeenCalledWith('dispatch:input', {
        device: 'ai',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
      expect(ai.actions).toEqual(['ROTATE', 'DROP']);

      ai.loop();
      expect(emitSpy).toHaveBeenCalledWith('dispatch:input', {
        device: 'ai',
        action: 'ROTATE',
        payload: { Game: mockGame },
      });
      expect(ai.actions).toEqual(['DROP']);
    });

    it('应该在每次 loop 后调度下一次执行', () => {
      ai.actions = ['DROP'];
      ai.enabled = true;
      ai.loop();
      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 580);
    });

    it('调度延迟应该使用 Game.getSpeed()', () => {
      mockGame.getSpeed.mockReturnValue(350);
      ai.actions = ['DROP'];
      ai.enabled = true;
      ai.loop();
      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 580);
    });

    it('已存在的 actions 不会再次调用 think', () => {
      const thinkSpy = jest.spyOn(ai, 'think');
      ai.actions = ['MOVE_LEFT', 'DROP'];
      ai.enabled = true;
      ai.loop();
      expect(thinkSpy).not.toHaveBeenCalled();
      thinkSpy.mockRestore();
    });
  });

  // ==================== think ====================
  describe('think 方法', () => {
    const difficulty = {
      lookahead: 1,
      weights: { holes: -5, height: -0.3, bumpiness: -0.2, completeLines: 20 },
      beam: 5,
    };

    it('应该调用 selfPlay 并传入快照', () => {
      selfPlay.mockReturnValue(null);
      const state = mockStore.getState();

      ai.think(state, difficulty);

      expect(selfPlay).toHaveBeenCalledTimes(1);
      const snapshot = selfPlay.mock.calls[0][0];
      expect(snapshot).toHaveProperty('board');
      expect(snapshot).toHaveProperty('piece');
      expect(snapshot).toHaveProperty('mode');
    });

    it('应该返回 selfPlay 的结果', () => {
      const bestMove = { board: [[1]], actions: ['MOVE_LEFT', 'DROP'] };
      selfPlay.mockReturnValue(bestMove);

      const result = ai.think(mockStore.getState(), difficulty);

      expect(result).toBe(bestMove);
    });

    it('selfPlay 返回 null 时应该返回 null', () => {
      selfPlay.mockReturnValue(null);

      const result = ai.think(mockStore.getState(), difficulty);

      expect(result).toBeNull();
    });

    it('应该处理空棋盘', () => {
      mockStore.getState.mockReturnValue({
        mode: 'playing',
        board: Array.from({ length: 20 }, () =>
          Array.from({ length: 10 }, () => 0),
        ),
        curr: {
          shape: [
            [0, 1, 0],
            [1, 1, 1],
          ],
          color: '#00c8ff',
        },
        cx: 3,
        cy: 0,
      });
      selfPlay.mockReturnValue(null);

      const result = ai.think(mockStore.getState(), difficulty);

      expect(result).toBeNull();
    });
  });

  // ==================== subscribe / unsubscribe ====================
  describe('subscribe / unsubscribe', () => {
    it('subscribe 应该注册 start 和 stop 事件', () => {
      ai.subscribe();
      expect(ai.on).toHaveBeenCalledWith('ai:test-ai-uuid:start', ai._onStart);
      expect(ai.on).toHaveBeenCalledWith('ai:test-ai-uuid:stop', ai._onStop);
    });

    it('unsubscribe 应该注销 start 和 stop 事件', () => {
      ai.unsubscribe();
      expect(ai.off).toHaveBeenCalledWith('ai:test-ai-uuid:start', ai._onStart);
      expect(ai.off).toHaveBeenCalledWith('ai:test-ai-uuid:stop', ai._onStop);
    });
  });

  // ==================== 事件回调 ====================
  describe('事件回调', () => {
    it('_onStart 应该调用 start()', () => {
      const startSpy = jest.spyOn(ai, 'start');
      ai._onStart();
      expect(startSpy).toHaveBeenCalled();
      startSpy.mockRestore();
    });

    it('_onStop 应该调用 stop()', () => {
      const stopSpy = jest.spyOn(ai, 'stop');
      ai._onStop();
      expect(stopSpy).toHaveBeenCalled();
      stopSpy.mockRestore();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('loop 在 think 返回空数组 actions 时不应该发送事件', () => {
      jest.spyOn(ai, 'think').mockReturnValue({ board: [], actions: [] });
      ai.enabled = true;
      ai.loop();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('多次 stop 调用不应该报错', () => {
      expect(() => {
        ai.stop();
        ai.stop();
        ai.stop();
      }).not.toThrow();
    });

    it('多次 start 调用不应该报错', () => {
      expect(() => {
        ai.start();
        ai.start();
      }).not.toThrow();
    });
  });

  // ==================== Worker 模式 ====================
  describe('Worker 模式', () => {
    it('_initialize 应该在 Worker 不可用时设为 null', () => {
      const originalWorker = globalThis.Worker;
      globalThis.Worker = undefined;
      const ai2 = new AIController({
        Game: mockGame,
        Store: mockStore,
        Scheduler: mockScheduler,
      });
      expect(ai2.worker).toBeNull();
      globalThis.Worker = originalWorker;
    });

    it('addEventListeners 在 worker 为 null 时应该安全返回', () => {
      expect(() => ai.addEventListeners()).not.toThrow();
    });

    it('removeEventListeners 在 worker 为 null 时应该安全返回', () => {
      expect(() => ai.removeEventListeners()).not.toThrow();
    });

    it('_onWorkerError 应该设置 worker 为 null 并解锁', () => {
      ai.workerBusy = true;
      ai.worker = {};
      ai._onWorkerError(new ErrorEvent('error', { message: 'test' }));
      expect(ai.workerBusy).toBe(false);
      expect(ai.worker).toBeNull();
    });

    it('_onWorkerMessage 处理 error 类型应该解锁', () => {
      ai.workerBusy = true;
      ai._onWorkerMessage({ data: { type: 'error', error: 'test error' } });
      expect(ai.workerBusy).toBe(false);
    });

    it('_onWorkerMessage 处理 result 类型应该写入 actions', () => {
      ai.workerBusy = true;
      ai._onWorkerMessage({
        data: { type: 'result', best: { actions: ['DROP'] } },
      });
      expect(ai.workerBusy).toBe(false);
      expect(ai.actions).toEqual(['DROP']);
    });

    it('loop 在 Worker 忙碌且无 action 时应该继续调度', () => {
      ai.enabled = true;
      ai.workerBusy = true;
      ai.actions = [];
      ai.loop();
      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 580);
    });
  });
});
