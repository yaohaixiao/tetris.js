import AIController from '@/lib/ai/ai-controller.js';
import EventBus from '@/lib/core/event-bus/index.js';

// Mock 依赖
jest.mock('@/lib/ai/planner/self-play.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import selfPlay from '@/lib/ai/planner/self-play.js';

// 事件名常量：与 GameEvents('test-ai-uuid').DISPATCH_INPUT 保持一致
const DISPATCH_INPUT = 'game:test-ai-uuid:dispatch:input';

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
      isVersus: jest.fn().mockReturnValue(false),
      getBagSnapshot: jest.fn().mockReturnValue([]),
    };

    selfPlay.mockReturnValue(null);

    ai = new AIController({
      Game: mockGame,
      Store: mockStore,
      Scheduler: mockScheduler,
    });

    ai.Animations = mockAnimations;
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
      expect(emitSpy).toHaveBeenCalledWith(DISPATCH_INPUT, {
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
      expect(emitSpy).toHaveBeenCalledWith(DISPATCH_INPUT, {
        device: 'ai',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
      expect(ai.actions).toEqual(['ROTATE', 'DROP']);

      ai.loop();
      expect(emitSpy).toHaveBeenCalledWith(DISPATCH_INPUT, {
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
      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 480);
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
    it('subscribe 应该通过 Router 订阅事件', () => {
      ai.Router = { subscribe: jest.fn() };
      ai.subscribe();
      expect(ai.Router.subscribe).toHaveBeenCalled();
    });

    it('unsubscribe 应该通过 Router 取消订阅事件', () => {
      ai.Router = { unsubscribe: jest.fn() };
      ai.unsubscribe();
      expect(ai.Router.unsubscribe).toHaveBeenCalled();
    });
  });

  // ==================== 事件回调 ====================
  describe('事件回调', () => {
    it('_onStart 应该调用 start()', () => {
      const startSpy = jest.spyOn(ai, 'start');
      ai.start();
      expect(startSpy).toHaveBeenCalled();
      startSpy.mockRestore();
    });

    it('_onStop 应该调用 stop()', () => {
      const stopSpy = jest.spyOn(ai, 'stop');
      const cancelSpy = jest.spyOn(mockScheduler, 'cancel');
      ai.stop();
      expect(stopSpy).toHaveBeenCalled();
      stopSpy.mockRestore();
      cancelSpy.mockRestore();
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
      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 480);
    });
  });

  // ==================== getDifficultyConfig ====================
  describe('getDifficultyConfig', () => {
    it('应该为 expert 难度返回 EXPERT 配置', () => {
      mockStore.getDifficulty.mockReturnValue('expert');
      const config = ai.getDifficultyConfig();
      expect(config).toBeDefined();
      expect(config.lookahead).toBeDefined();
      expect(config.weights).toBeDefined();
    });

    it('应该为 unknown 难度降级为 NORMAL', () => {
      mockStore.getDifficulty.mockReturnValue('unknown');
      const config = ai.getDifficultyConfig();
      expect(config).toBeDefined();
    });

    it('所有难度都应该返回有效配置', () => {
      const difficulties = ['easy', 'normal', 'hard', 'expert'];
      difficulties.forEach((diff) => {
        mockStore.getDifficulty.mockReturnValue(diff);
        const config = ai.getDifficultyConfig();
        expect(config).toBeDefined();
        expect(config.lookahead).toBeGreaterThanOrEqual(1);
        expect(config.delay).toBeGreaterThan(0);
      });
    });
  });

  // ==================== think - Worker 模式 ====================
  describe('think - Worker 模式', () => {
    it('Worker 模式下应该发送 postMessage 并设置 workerBusy', () => {
      const mockWorker = {
        postMessage: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      ai.worker = mockWorker;
      ai.workerBusy = false;

      const state = mockStore.getState();
      const difficulty = {
        lookahead: 2,
        weights: {
          holes: -5,
          height: -0.3,
          bumpiness: -0.2,
          completeLines: 20,
        },
        beam: 5,
      };

      ai.think(state, difficulty);

      expect(ai.workerBusy).toBe(true);
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'think',
        state,
        bag: [],
        weights: difficulty.weights,
        depth: difficulty.lookahead,
        beam: difficulty.beam,
        algorithm: 'selfPlay',
        mode: 'survival',
      });

      ai.worker = null;
    });

    it('expert 难度 Worker 模式应该使用 mcts 算法', () => {
      mockStore.getDifficulty.mockReturnValue('expert');

      const mockWorker = {
        postMessage: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      ai.worker = mockWorker;
      ai.workerBusy = false;

      const state = mockStore.getState();
      const difficulty = ai.getDifficultyConfig();

      ai.think(state, difficulty);

      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          algorithm: 'mcts',
        }),
      );

      ai.worker = null;
    });

    it('Worker 模式下 think 应该返回 undefined', () => {
      const mockWorker = {
        postMessage: jest.fn(),
      };
      ai.worker = mockWorker;

      const state = mockStore.getState();
      const difficulty = {
        lookahead: 1,
        weights: {},
        beam: 3,
      };

      const result = ai.think(state, difficulty);
      expect(result).toBeUndefined();

      ai.worker = null;
    });

    it('Worker 模式发送的消息应包含完整的配置参数', () => {
      const mockWorker = {
        postMessage: jest.fn(),
      };
      ai.worker = mockWorker;

      const state = mockStore.getState();
      const difficulty = {
        lookahead: 4,
        weights: {
          holes: -10,
          height: -0.5,
          bumpiness: -0.3,
          completeLines: 30,
        },
        beam: 8,
      };

      ai.think(state, difficulty);

      const callArgs = mockWorker.postMessage.mock.calls[0][0];
      expect(callArgs).toEqual({
        type: 'think',
        state,
        bag: [],
        weights: difficulty.weights,
        depth: 4,
        beam: 8,
        algorithm: 'selfPlay',
        mode: 'survival',
      });

      ai.worker = null;
    });
  });

  // ==================== think - 主线程模式 ====================
  describe('think - 主线程模式', () => {
    it('应该调用 createSnapshot 创建快照', () => {
      const state = mockStore.getState();
      const difficulty = {
        lookahead: 1,
        weights: {},
        beam: 3,
      };

      ai.worker = null;
      selfPlay.mockReturnValue({ actions: ['DROP'], y: 18 });

      ai.think(state, difficulty);

      expect(selfPlay).toHaveBeenCalledTimes(1);
      const snapshot = selfPlay.mock.calls[0][0];
      expect(snapshot).toHaveProperty('board');
      expect(snapshot).toHaveProperty('piece');
      expect(snapshot.board).toBeDefined();
      expect(snapshot.piece).toBeDefined();
    });

    it('应该将 weights、lookahead、beam 传递给 selfPlay', () => {
      const state = mockStore.getState();
      const difficulty = {
        lookahead: 3,
        weights: {
          holes: -8,
          height: -0.4,
          bumpiness: -0.25,
          completeLines: 15,
        },
        beam: 6,
      };

      ai.worker = null;
      selfPlay.mockReturnValue({ actions: ['MOVE_LEFT', 'DROP'], y: 17 });

      ai.think(state, difficulty);

      expect(selfPlay).toHaveBeenCalledWith(
        expect.any(Object),
        difficulty.weights,
        difficulty.lookahead,
        difficulty.beam,
        'survival',
      );
    });

    it('应该返回 selfPlay 的完整结果', () => {
      const state = mockStore.getState();
      const difficulty = {
        lookahead: 1,
        weights: {},
        beam: 3,
      };

      const expectedResult = {
        actions: ['ROTATE', 'MOVE_RIGHT', 'MOVE_RIGHT', 'DROP'],
        y: 16,
        placeOn: jest.fn(),
      };

      ai.worker = null;
      selfPlay.mockReturnValue(expectedResult);

      const result = ai.think(state, difficulty);

      expect(result).toBe(expectedResult);
      expect(result.actions).toEqual(expectedResult.actions);
    });

    it('主线程模式 selfPlay 返回 null 时应返回 null', () => {
      const state = mockStore.getState();
      const difficulty = {
        lookahead: 1,
        weights: {},
        beam: 3,
      };

      ai.worker = null;
      selfPlay.mockReturnValue(null);

      const result = ai.think(state, difficulty);

      expect(result).toBeNull();
    });

    it('主线程模式应该正确序列化棋盘状态', () => {
      const state = {
        mode: 'playing',
        board: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        curr: {
          shape: [
            [1, 1],
            [1, 1],
          ],
          color: '#ff0000',
        },
        cx: 4,
        cy: 0,
      };

      const difficulty = {
        lookahead: 2,
        weights: { holes: -5 },
        beam: 4,
      };

      ai.worker = null;
      selfPlay.mockReturnValue({ actions: ['DROP'], y: 0 });

      ai.think(state, difficulty);

      const snapshot = selfPlay.mock.calls[0][0];
      expect(snapshot.board).toEqual(state.board);
      expect(snapshot.piece.shape).toEqual(state.curr.shape);
    });

    it('expert 难度在主线程模式也走 selfPlay', () => {
      mockStore.getDifficulty.mockReturnValue('expert');

      const state = mockStore.getState();
      const difficulty = ai.getDifficultyConfig();

      ai.worker = null;
      selfPlay.mockReturnValue({ actions: ['DROP'], y: 15 });

      ai.think(state, difficulty);

      expect(selfPlay).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== Worker 忙碌状态下的 loop 分支 ====================
  describe('loop - Worker 忙碌状态', () => {
    it('Worker 忙碌且无 action 时应继续调度不退出', () => {
      ai.enabled = true;
      ai.worker = {};
      ai.workerBusy = true;
      ai.actions = [];

      ai.loop();

      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 480);
      expect(emitSpy).not.toHaveBeenCalled();
      ai.worker = null;
    });

    it('Worker 忙碌但有 action 时应该执行 action', () => {
      ai.enabled = true;
      ai.worker = {};
      ai.workerBusy = true;
      ai.actions = ['DROP'];

      ai.loop();

      expect(emitSpy).toHaveBeenCalledWith(DISPATCH_INPUT, {
        device: 'ai',
        action: 'DROP',
        payload: { Game: mockGame },
      });
      ai.worker = null;
    });

    it('Worker 完成后的 _onWorkerMessage 应正确恢复状态', () => {
      ai.workerBusy = true;
      ai.actions = [];

      ai._onWorkerMessage({
        data: {
          type: 'result',
          best: { actions: ['MOVE_LEFT', 'ROTATE', 'DROP'] },
        },
      });

      expect(ai.workerBusy).toBe(false);
      expect(ai.actions).toEqual(['MOVE_LEFT', 'ROTATE', 'DROP']);
    });

    it('Worker result 为 null 时不应修改 actions', () => {
      ai.workerBusy = true;
      ai.actions = [];

      ai._onWorkerMessage({
        data: { type: 'result', best: null },
      });

      expect(ai.workerBusy).toBe(false);
      expect(ai.actions).toEqual([]);
    });
  });

  // ==================== addEventListeners / removeEventListeners ====================
  describe('Worker 事件监听器', () => {
    it('addEventListeners 应该绑定 message 和 error 事件', () => {
      const mockWorker = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      ai.worker = mockWorker;

      ai.addEventListeners();

      expect(mockWorker.addEventListener).toHaveBeenCalledWith(
        'message',
        ai._onWorkerMessage,
      );
      expect(mockWorker.addEventListener).toHaveBeenCalledWith(
        'error',
        ai._onWorkerError,
      );

      ai.worker = null;
    });

    it('removeEventListeners 应该解绑 message 和 error 事件', () => {
      const mockWorker = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      ai.worker = mockWorker;

      ai.removeEventListeners();

      expect(mockWorker.removeEventListener).toHaveBeenCalledWith(
        'message',
        ai._onWorkerMessage,
      );
      expect(mockWorker.removeEventListener).toHaveBeenCalledWith(
        'error',
        ai._onWorkerError,
      );

      ai.worker = null;
    });

    it('addEventListeners 在 worker 为 null 时不报错', () => {
      ai.worker = null;
      expect(() => ai.addEventListeners()).not.toThrow();
    });

    it('removeEventListeners 在 worker 为 null 时不报错', () => {
      ai.worker = null;
      expect(() => ai.removeEventListeners()).not.toThrow();
    });
  });

  // ==================== _onWorkerError ====================
  describe('_onWorkerError', () => {
    it('应该设置 workerBusy 为 false', () => {
      ai.workerBusy = true;
      ai.worker = {};
      ai._onWorkerError(new ErrorEvent('error', { message: 'test' }));
      expect(ai.workerBusy).toBe(false);
    });

    it('应该设置 worker 为 null（降级为主线程）', () => {
      ai.worker = {};
      ai._onWorkerError(new ErrorEvent('error', { message: 'test' }));
      expect(ai.worker).toBeNull();
    });

    it('应该记录错误日志', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      ai.worker = {};

      ai._onWorkerError(new ErrorEvent('error', { message: 'worker crash' }));

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ==================== _onWorkerMessage ====================
  describe('_onWorkerMessage', () => {
    it('result 类型应该设置 workerBusy 为 false', () => {
      ai.workerBusy = true;
      ai._onWorkerMessage({
        data: { type: 'result', best: { actions: ['DROP'] } },
      });
      expect(ai.workerBusy).toBe(false);
    });

    it('result 类型应该写入 actions', () => {
      ai._onWorkerMessage({
        data: {
          type: 'result',
          best: { actions: ['MOVE_RIGHT', 'MOVE_RIGHT', 'DROP'] },
        },
      });
      expect(ai.actions).toEqual(['MOVE_RIGHT', 'MOVE_RIGHT', 'DROP']);
    });

    it('error 类型应该设置 workerBusy 为 false', () => {
      ai.workerBusy = true;
      ai._onWorkerMessage({
        data: { type: 'error', error: 'something went wrong' },
      });
      expect(ai.workerBusy).toBe(false);
    });

    it('error 类型应该记录错误日志', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      ai._onWorkerMessage({
        data: { type: 'error', error: 'worker error message' },
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'AI Worker Error:',
        'worker error message',
      );
      consoleSpy.mockRestore();
    });

    it('未知 type 不应该修改 actions', () => {
      ai.workerBusy = true;
      ai.actions = ['EXISTING'];
      ai._onWorkerMessage({
        data: { type: 'unknown', data: {} },
      });
      expect(ai.workerBusy).toBe(true);
      expect(ai.actions).toEqual(['EXISTING']);
    });
  });

  // ==================== 综合场景 ====================
  describe('综合场景', () => {
    it('完整的主线程 AI 决策到执行流程', () => {
      ai.worker = null;
      ai.enabled = true;

      const bestMove = {
        actions: ['ROTATE', 'MOVE_LEFT', 'MOVE_LEFT', 'DROP'],
        y: 18,
        placeOn: jest.fn(),
      };
      selfPlay.mockReturnValue(bestMove);

      // 第一帧：决策 + 执行第一个动作
      ai.loop();
      expect(emitSpy).toHaveBeenCalledWith(DISPATCH_INPUT, {
        device: 'ai',
        action: 'ROTATE',
        payload: { Game: mockGame },
      });
      expect(ai.actions).toEqual(['MOVE_LEFT', 'MOVE_LEFT', 'DROP']);

      // 第二帧：执行第二个动作
      emitSpy.mockClear();
      ai.loop();
      expect(emitSpy).toHaveBeenCalledWith(DISPATCH_INPUT, {
        device: 'ai',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
      expect(ai.actions).toEqual(['MOVE_LEFT', 'DROP']);
    });

    it('Worker 模式下完整异步决策流程', () => {
      const mockWorker = {
        postMessage: jest.fn(),
      };
      ai.worker = mockWorker;
      ai.enabled = true;
      ai.workerBusy = false;

      const state = mockStore.getState();
      const difficulty = {
        lookahead: 1,
        weights: {},
        beam: 3,
      };

      // 1. think 发送消息给 Worker
      ai.think(state, difficulty);
      expect(ai.workerBusy).toBe(true);
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'think' }),
      );

      // 2. loop 在 Worker 忙碌时继续调度
      emitSpy.mockClear();
      ai.loop();
      expect(emitSpy).not.toHaveBeenCalled();
      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 480);

      // 3. Worker 返回结果
      ai._onWorkerMessage({
        data: {
          type: 'result',
          best: { actions: ['ROTATE', 'DROP'] },
        },
      });
      expect(ai.workerBusy).toBe(false);
      expect(ai.actions).toEqual(['ROTATE', 'DROP']);

      // 4. 下一帧执行 action
      emitSpy.mockClear();
      ai.loop();
      expect(emitSpy).toHaveBeenCalledWith(DISPATCH_INPUT, {
        device: 'ai',
        action: 'ROTATE',
        payload: { Game: mockGame },
      });

      ai.worker = null;
    });

    it('Worker 错误后降级为主线程模式', () => {
      const mockWorker = {
        postMessage: jest.fn(),
      };
      ai.worker = mockWorker;
      ai.workerBusy = true;

      // Worker 错误
      ai._onWorkerError(new ErrorEvent('error', { message: 'crash' }));
      expect(ai.worker).toBeNull();
      expect(ai.workerBusy).toBe(false);

      // 后续 think 走主线程模式
      selfPlay.mockReturnValue({ actions: ['DROP'], y: 19 });

      const state = mockStore.getState();
      const difficulty = {
        lookahead: 1,
        weights: {},
        beam: 3,
      };

      const result = ai.think(state, difficulty);
      expect(result).toBeDefined();
      expect(result.actions).toEqual(['DROP']);
      expect(selfPlay).toHaveBeenCalled();
    });
  });
});
