import AIController from '@/lib/ai/ai-controller.js';

// Mock 依赖
jest.mock('@/lib/ai/generate-moves.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/evaluate-board.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import generateMoves from '@/lib/ai/generate-moves.js';
import evaluateBoard from '@/lib/ai/evaluate-board.js';

describe('AIController', () => {
  let ai;
  let mockGame;
  let mockStore;
  let mockScheduler;
  let mockAnimations;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

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

    // Mock 父类 Base 的 on/off/emit
    const mockOn = jest.fn();
    const mockOff = jest.fn();
    const mockEmit = jest.fn();

    generateMoves.mockReturnValue([]);

    // 创建实例并手动注入方法
    ai = new AIController({
      Game: mockGame,
      Store: mockStore,
      Scheduler: mockScheduler,
    });

    // 手动注入 Animations（因为 AIController 通过 Game 访问它）
    ai.Animations = mockAnimations;

    ai.on = mockOn;
    ai.off = mockOff;
    ai.emit = mockEmit;
  });

  afterEach(() => {
    jest.useRealTimers();
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

    it('think 返回最佳移动时应该设置 actions 并执行第一个', () => {
      const bestMove = {
        board: [],
        actions: ['MOVE_LEFT', 'DROP'],
      };
      jest.spyOn(ai, 'think').mockReturnValue(bestMove);

      ai.enabled = true;
      ai.loop();

      // 第一个 action 被 shift 并发送
      expect(mockGame.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'ai',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
      // 剩余 actions
      expect(ai.actions).toEqual(['DROP']);
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
      const thinkSpy = jest.spyOn(ai, 'think');
      thinkSpy.mockReturnValue(null);

      ai.enabled = true;

      ai.loop();

      expect(thinkSpy).toHaveBeenCalled();
      thinkSpy.mockRestore();
    });

    it('think 返回最佳移动时应该返回正确的 actions', () => {
      const bestMove = {
        board: [],
        actions: ['MOVE_LEFT', 'DROP'],
      };
      generateMoves.mockReturnValue([bestMove]);
      evaluateBoard.mockReturnValue(0);

      const result = ai.think(mockStore.getState());

      expect(result.actions).toEqual(['MOVE_LEFT', 'DROP']);
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

      // 第一次调用
      ai.loop();

      expect(mockGame.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'ai',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });

      // actions 应该还剩 2 个
      expect(ai.actions).toEqual(['ROTATE', 'DROP']);

      // 第二次调用
      ai.loop();

      expect(mockGame.emit).toHaveBeenCalledWith('dispatch:input', {
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

      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 200);
    });

    it('调度延迟应该使用 Game.getSpeed()', () => {
      mockGame.getSpeed.mockReturnValue(350);
      ai.actions = ['DROP'];
      ai.enabled = true;

      ai.loop();

      expect(mockScheduler.delay).toHaveBeenCalledWith(ai.loop, 350);
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
    it('应该转换 board 为数字格式', () => {
      const colorBoard = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      );
      colorBoard[19][0] = '#00c8ff';
      colorBoard[19][1] = null;

      mockStore.getState.mockReturnValue({
        mode: 'playing',
        board: colorBoard,
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

      generateMoves.mockReturnValue([]);

      ai.think(mockStore.getState());

      // 验证 generateMoves 收到的是数字格式
      const boardArg = generateMoves.mock.calls[0][0].board;
      expect(boardArg[19][0]).toBe(1);
      expect(boardArg[19][1]).toBe(0);
    });

    it('应该返回评分最高的 move', () => {
      const move1 = { board: [[0]], actions: ['DROP'] };
      const move2 = { board: [[1]], actions: ['MOVE_LEFT', 'DROP'] };
      const move3 = { board: [[0, 1]], actions: ['MOVE_RIGHT', 'DROP'] };

      generateMoves.mockReturnValue([move1, move2, move3]);
      evaluateBoard
        .mockReturnValueOnce(-5) // move1
        .mockReturnValueOnce(-1) // move2 (最高分)
        .mockReturnValueOnce(-3); // move3

      const best = ai.think(mockStore.getState());

      expect(best).toBe(move2);
    });

    it('所有 move 评分相同时应该返回第一个', () => {
      const move1 = { board: [[0]], actions: ['DROP'] };
      const move2 = { board: [[1]], actions: ['MOVE_LEFT', 'DROP'] };

      generateMoves.mockReturnValue([move1, move2]);
      evaluateBoard.mockReturnValue(0);

      const best = ai.think(mockStore.getState());

      expect(best).toBe(move1);
    });

    it('没有 moves 时应该返回 null', () => {
      generateMoves.mockReturnValue([]);

      const best = ai.think(mockStore.getState());

      expect(best).toBeNull();
    });

    it('应该构建正确的 piece 对象', () => {
      mockStore.getState.mockReturnValue({
        mode: 'playing',
        board: Array.from({ length: 20 }, () =>
          Array.from({ length: 10 }, () => 0),
        ),
        curr: {
          shape: [
            [1, 0],
            [1, 1],
            [1, 0],
          ],
          color: '#5050ff',
        },
        cx: 5,
        cy: 2,
      });

      generateMoves.mockReturnValue([]);

      ai.think(mockStore.getState());

      const pieceArg = generateMoves.mock.calls[0][0].piece;
      expect(pieceArg.shape).toEqual([
        [1, 0],
        [1, 1],
        [1, 0],
      ]);
      expect(pieceArg.position.x).toBe(5);
      expect(pieceArg.position.y).toBe(2);
    });

    it('应该调用 evaluateBoard 为每个 move 评分', () => {
      const move1 = { board: [[0]], actions: ['DROP'] };
      const move2 = { board: [[1]], actions: ['DROP'] };

      generateMoves.mockReturnValue([move1, move2]);

      ai.think(mockStore.getState());

      expect(evaluateBoard).toHaveBeenCalledWith(move1.board);
      expect(evaluateBoard).toHaveBeenCalledWith(move2.board);
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
      jest.spyOn(ai, 'think').mockReturnValue({
        board: [],
        actions: [],
      });

      ai.enabled = true;

      ai.loop();

      expect(mockGame.emit).not.toHaveBeenCalled();
    });

    it('think 应该处理空棋盘', () => {
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

      generateMoves.mockReturnValue([]);

      const best = ai.think(mockStore.getState());

      expect(best).toBeNull();
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
});
