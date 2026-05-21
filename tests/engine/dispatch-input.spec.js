import EventBus from '@/lib/core/event-bus/index.js';
import dispatchInput from '@/lib/engine/dispatch-input.js';

describe('dispatchInput', () => {
  beforeEach(() => {
    EventBus.clear();
  });

  // 辅助函数：创建 mock Game
  const makeGame = (id, overrides = {}) => ({
    id,
    emit: jest.fn(),
    ...overrides,
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该根据输入构建 Command 并入队', () => {
      const gameId = 'game-001';
      const game = makeGame(gameId);

      const input = {
        action: 'MOVE',
        payload: {
          direction: 'left',
          Game: game,
        },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input, context);

      expect(game.emit).toHaveBeenCalledWith(
        `command:queue:${gameId}:enqueue`,
        expect.objectContaining({
          cmd: expect.objectContaining({
            action: 'MOVE',
            payload: expect.objectContaining({
              direction: 'left',
              Game: game,
            }),
          }),
        }),
      );
    });

    it('应该发送 replay 记录事件', () => {
      const gameId = 'game-002';
      const game = makeGame(gameId);

      const input = {
        action: 'ROTATE',
        payload: {
          direction: 'cw',
          Game: game,
        },
      };
      const context = { isBlocked: false, ms: 2500 };

      dispatchInput(input, context);

      expect(game.emit).toHaveBeenCalledWith(
        `replay:${gameId}:add:record`,
        expect.objectContaining({
          ms: 2500,
          cmd: expect.objectContaining({
            action: 'ROTATE',
            payload: expect.objectContaining({
              direction: 'cw',
              Game: game,
            }),
          }),
        }),
      );
    });

    it('应该同时发送 command:queue 和 replay 事件', () => {
      const gameId = 'game-003';
      const game = makeGame(gameId);

      const input = {
        action: 'DROP',
        payload: { Game: game },
      };
      const context = { isBlocked: false, ms: 500 };

      dispatchInput(input, context);

      expect(game.emit).toHaveBeenCalledWith(
        `command:queue:${gameId}:enqueue`,
        expect.any(Object),
      );
      expect(game.emit).toHaveBeenCalledWith(
        `replay:${gameId}:add:record`,
        expect.any(Object),
      );
      expect(game.emit).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== 输入拦截 ====================
  describe('输入拦截', () => {
    it('当 isBlocked 为 true 时不应该处理输入', () => {
      const game = makeGame('game-004');

      const input = {
        action: 'MOVE',
        payload: { Game: game },
      };
      const context = { isBlocked: true, ms: 1000 };

      dispatchInput(input, context);

      expect(game.emit).not.toHaveBeenCalled();
    });

    it('当 isBlocked 为 true 时也不应该发送 replay 事件', () => {
      const game = makeGame('game-005');

      const input = {
        action: 'MOVE',
        payload: { Game: game },
      };
      const context = { isBlocked: true, ms: 1000 };

      dispatchInput(input, context);

      expect(game.emit).not.toHaveBeenCalled();
    });

    it('当 action 为空字符串时不应该处理输入', () => {
      const game = makeGame('game-006');

      const input = {
        action: '',
        payload: { Game: game },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input, context);

      expect(game.emit).not.toHaveBeenCalled();
    });

    it('当 action 为 null 时不应该处理输入', () => {
      const game = makeGame('game-007');

      const input = {
        action: null,
        payload: { Game: game },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input, context);

      expect(game.emit).not.toHaveBeenCalled();
    });

    it('当 action 为 undefined 时不应该处理输入', () => {
      const game = makeGame('game-008');

      const input = {
        payload: { Game: game },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input, context);

      expect(game.emit).not.toHaveBeenCalled();
    });

    it('当同时满足 isBlocked 和 action 为空时不应该处理输入', () => {
      const game = makeGame('game-009');

      const input = {
        action: '',
        payload: { Game: game },
      };
      const context = { isBlocked: true, ms: 1000 };

      dispatchInput(input, context);

      expect(game.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== ms 参数 ====================
  describe('ms 参数', () => {
    it('应该在 replay 事件中正确传递 ms', () => {
      const gameId = 'game-010';
      const game = makeGame(gameId);

      const input = {
        action: 'MOVE',
        payload: { Game: game },
      };

      dispatchInput(input, { isBlocked: false, ms: 0 });
      expect(game.emit).toHaveBeenCalledWith(
        `replay:${gameId}:add:record`,
        expect.objectContaining({ ms: 0 }),
      );

      dispatchInput(input, { isBlocked: false, ms: 9999 });
      expect(game.emit).toHaveBeenCalledWith(
        `replay:${gameId}:add:record`,
        expect.objectContaining({ ms: 9999 }),
      );
    });

    it('应该支持 ms 为 undefined', () => {
      const gameId = 'game-011';
      const game = makeGame(gameId);

      const input = {
        action: 'PAUSE',
        payload: { Game: game },
      };
      const context = { isBlocked: false, ms: undefined };

      dispatchInput(input, context);

      expect(game.emit).toHaveBeenCalledWith(
        `replay:${gameId}:add:record`,
        expect.objectContaining({ ms: undefined }),
      );
    });
  });

  // ==================== 不同 Game 实例隔离 ====================
  describe('不同 Game 实例隔离', () => {
    it('不同 gameId 的事件应该发送到各自的事件通道', () => {
      const gameId1 = 'game-012';
      const gameId2 = 'game-013';
      const game1 = makeGame(gameId1);
      const game2 = makeGame(gameId2);

      const input1 = {
        action: 'MOVE',
        payload: { direction: 'left', Game: game1 },
      };
      const input2 = {
        action: 'ROTATE',
        payload: { direction: 'cw', Game: game2 },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input1, context);
      dispatchInput(input2, context);

      expect(game1.emit).toHaveBeenCalledWith(
        `command:queue:${gameId1}:enqueue`,
        expect.any(Object),
      );
      expect(game1.emit).toHaveBeenCalledTimes(2);
      expect(game2.emit).toHaveBeenCalledWith(
        `command:queue:${gameId2}:enqueue`,
        expect.any(Object),
      );
      expect(game2.emit).toHaveBeenCalledTimes(2);
    });

    it('同一个 gameId 多次调用应该发送到同一个事件通道', () => {
      const gameId = 'game-014';
      const game = makeGame(gameId);

      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(
        { action: 'MOVE', payload: { Game: game } },
        context,
      );
      dispatchInput(
        { action: 'ROTATE', payload: { Game: game } },
        context,
      );
      dispatchInput(
        { action: 'DROP', payload: { Game: game } },
        context,
      );

      expect(game.emit).toHaveBeenCalledTimes(6); // 每次调用发两个事件
    });
  });

  // ==================== 参数完整性 ====================
  describe('参数完整性', () => {
    it('Command 的 action 应该和输入的 action 一致', () => {
      const gameId = 'game-015';
      const game = makeGame(gameId);

      const input = {
        action: 'HARD_DROP',
        payload: { Game: game, instant: true },
      };
      const context = { isBlocked: false, ms: 500 };

      dispatchInput(input, context);

      const enqueueCall = game.emit.mock.calls.find(
        (call) => call[0] === `command:queue:${gameId}:enqueue`,
      );
      const { cmd } = enqueueCall[1];
      expect(cmd.action).toBe('HARD_DROP');
    });

    it('Command 的 payload 应该和输入的 payload 一致', () => {
      const gameId = 'game-016';
      const game = makeGame(gameId);

      const input = {
        action: 'MOVE',
        payload: {
          direction: 'down',
          speed: 2,
          Game: game,
        },
      };
      const context = { isBlocked: false, ms: 200 };

      dispatchInput(input, context);

      const enqueueCall = game.emit.mock.calls.find(
        (call) => call[0] === `command:queue:${gameId}:enqueue`,
      );
      const { cmd } = enqueueCall[1];
      expect(cmd.payload).toEqual({
        direction: 'down',
        speed: 2,
        Game: game,
      });
    });

    it('replay 事件中的 cmd 和入队事件中的 cmd 应该是同一个引用', () => {
      const gameId = 'game-017';
      const game = makeGame(gameId);

      const input = {
        action: 'START_GAME',
        payload: { Game: game, level: 1 },
      };
      const context = { isBlocked: false, ms: 0 };

      dispatchInput(input, context);

      const enqueueCall = game.emit.mock.calls.find(
        (call) => call[0] === `command:queue:${gameId}:enqueue`,
      );
      const replayCall = game.emit.mock.calls.find(
        (call) => call[0] === `replay:${gameId}:add:record`,
      );

      expect(enqueueCall[1].cmd).toBe(replayCall[1].cmd);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('context 只包含 isBlocked 时应该正常工作', () => {
      const game = makeGame('game-018');

      const input = {
        action: 'MOVE',
        payload: { Game: game },
      };
      const context = { isBlocked: false };

      expect(() => {
        dispatchInput(input, context);
      }).not.toThrow();
    });

    it('payload 为空对象时应该正常工作', () => {
      const game = makeGame('game-019');

      const input = {
        action: 'START_GAME',
        payload: { Game: game },
      };
      const context = { isBlocked: false, ms: 0 };

      dispatchInput(input, context);

      expect(game.emit).toHaveBeenCalledTimes(2);
    });

    it('在没有监听器时调用不应该报错', () => {
      const game = makeGame('game-020');

      const input = {
        action: 'MOVE',
        payload: { Game: game },
      };
      const context = { isBlocked: false, ms: 0 };

      expect(() => {
        dispatchInput(input, context);
      }).not.toThrow();
    });
  });
});
