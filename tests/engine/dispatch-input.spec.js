import EventBus from '@/lib/core/event-bus/index.js';
import dispatchInput from '@/lib/engine/dispatch-input.js';

describe('dispatchInput', () => {
  beforeEach(() => {
    EventBus.clear();
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该根据输入构建 Command 并入队', () => {
      const handler = jest.fn();
      const gameId = 'game-001';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        action: 'MOVE',
        payload: {
          direction: 'left',
          Game: { id: gameId },
        },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input, context);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        cmd: expect.objectContaining({
          action: 'MOVE',
          payload: {
            direction: 'left',
            Game: { id: gameId },
          },
        }),
      });
    });

    it('应该发送 replay 记录事件', () => {
      const replayHandler = jest.fn();
      const gameId = 'game-002';
      EventBus.on(`replay:${gameId}:add:record`, replayHandler);

      const input = {
        action: 'ROTATE',
        payload: {
          direction: 'cw',
          Game: { id: gameId },
        },
      };
      const context = { isBlocked: false, ms: 2500 };

      dispatchInput(input, context);

      expect(replayHandler).toHaveBeenCalledTimes(1);
      expect(replayHandler).toHaveBeenCalledWith({
        ms: 2500,
        cmd: expect.objectContaining({
          action: 'ROTATE',
          payload: {
            direction: 'cw',
            Game: { id: gameId },
          },
        }),
      });
    });

    it('应该同时发送 command:queue 和 replay 事件', () => {
      const enqueueHandler = jest.fn();
      const replayHandler = jest.fn();
      const gameId = 'game-003';

      EventBus.on(`command:queue:${gameId}:enqueue`, enqueueHandler);
      EventBus.on(`replay:${gameId}:add:record`, replayHandler);

      const input = {
        action: 'DROP',
        payload: { Game: { id: gameId } },
      };
      const context = { isBlocked: false, ms: 500 };

      dispatchInput(input, context);

      expect(enqueueHandler).toHaveBeenCalledTimes(1);
      expect(replayHandler).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 输入拦截 ====================
  describe('输入拦截', () => {
    it('当 isBlocked 为 true 时不应该处理输入', () => {
      const handler = jest.fn();
      const gameId = 'game-004';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        action: 'MOVE',
        payload: {
          direction: 'left',
          Game: { id: gameId },
        },
      };
      const context = { isBlocked: true, ms: 1000 };

      dispatchInput(input, context);

      expect(handler).not.toHaveBeenCalled();
    });

    it('当 isBlocked 为 true 时也不应该发送 replay 事件', () => {
      const replayHandler = jest.fn();
      const gameId = 'game-005';
      EventBus.on(`replay:${gameId}:add:record`, replayHandler);

      const input = {
        action: 'MOVE',
        payload: { Game: { id: gameId } },
      };
      const context = { isBlocked: true, ms: 1000 };

      dispatchInput(input, context);

      expect(replayHandler).not.toHaveBeenCalled();
    });

    it('当 action 为空字符串时不应该处理输入', () => {
      const handler = jest.fn();
      const gameId = 'game-006';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        action: '',
        payload: { Game: { id: gameId } },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input, context);

      expect(handler).not.toHaveBeenCalled();
    });

    it('当 action 为 null 时不应该处理输入', () => {
      const handler = jest.fn();
      const gameId = 'game-007';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        action: null,
        payload: { Game: { id: gameId } },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input, context);

      expect(handler).not.toHaveBeenCalled();
    });

    it('当 action 为 undefined 时不应该处理输入', () => {
      const handler = jest.fn();
      const gameId = 'game-008';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        // 没有 action 属性
        payload: { Game: { id: gameId } },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input, context);

      expect(handler).not.toHaveBeenCalled();
    });

    it('当同时满足 isBlocked 和 action 为空时不应该处理输入', () => {
      const handler = jest.fn();
      const gameId = 'game-009';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        action: '',
        payload: { Game: { id: gameId } },
      };
      const context = { isBlocked: true, ms: 1000 };

      dispatchInput(input, context);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ==================== ms 参数 ====================
  describe('ms 参数', () => {
    it('应该在 replay 事件中正确传递 ms', () => {
      const replayHandler = jest.fn();
      const gameId = 'game-010';
      EventBus.on(`replay:${gameId}:add:record`, replayHandler);

      const input = {
        action: 'MOVE',
        payload: { Game: { id: gameId } },
      };

      dispatchInput(input, { isBlocked: false, ms: 0 });
      expect(replayHandler).toHaveBeenCalledWith(
        expect.objectContaining({ ms: 0 }),
      );

      dispatchInput(input, { isBlocked: false, ms: 9999 });
      expect(replayHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({ ms: 9999 }),
      );
    });

    it('应该支持 ms 为 undefined', () => {
      const replayHandler = jest.fn();
      const gameId = 'game-011';
      EventBus.on(`replay:${gameId}:add:record`, replayHandler);

      const input = {
        action: 'PAUSE',
        payload: { Game: { id: gameId } },
      };
      const context = { isBlocked: false, ms: undefined };

      dispatchInput(input, context);

      expect(replayHandler).toHaveBeenCalledWith({
        ms: undefined,
        cmd: expect.any(Object),
      });
    });
  });

  // ==================== 不同 Game 实例隔离 ====================
  describe('不同 Game 实例隔离', () => {
    it('不同 gameId 的事件应该发送到各自的事件通道', () => {
      const handlerGame1 = jest.fn();
      const handlerGame2 = jest.fn();
      const gameId1 = 'game-012';
      const gameId2 = 'game-013';

      EventBus.on(`command:queue:${gameId1}:enqueue`, handlerGame1);
      EventBus.on(`command:queue:${gameId2}:enqueue`, handlerGame2);

      const input1 = {
        action: 'MOVE',
        payload: { direction: 'left', Game: { id: gameId1 } },
      };
      const input2 = {
        action: 'ROTATE',
        payload: { direction: 'cw', Game: { id: gameId2 } },
      };
      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(input1, context);
      dispatchInput(input2, context);

      expect(handlerGame1).toHaveBeenCalledTimes(1);
      expect(handlerGame2).toHaveBeenCalledTimes(1);
    });

    it('同一个 gameId 多次调用应该发送到同一个事件通道', () => {
      const handler = jest.fn();
      const gameId = 'game-014';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const context = { isBlocked: false, ms: 1000 };

      dispatchInput(
        { action: 'MOVE', payload: { Game: { id: gameId } } },
        context,
      );
      dispatchInput(
        { action: 'ROTATE', payload: { Game: { id: gameId } } },
        context,
      );
      dispatchInput(
        { action: 'DROP', payload: { Game: { id: gameId } } },
        context,
      );

      expect(handler).toHaveBeenCalledTimes(3);
    });
  });

  // ==================== 参数完整性 ====================
  describe('参数完整性', () => {
    it('Command 的 action 应该和输入的 action 一致', () => {
      const handler = jest.fn();
      const gameId = 'game-015';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        action: 'HARD_DROP',
        payload: { Game: { id: gameId }, instant: true },
      };
      const context = { isBlocked: false, ms: 500 };

      dispatchInput(input, context);

      const { cmd } = handler.mock.calls[0][0];
      expect(cmd.action).toBe('HARD_DROP');
    });

    it('Command 的 payload 应该和输入的 payload 一致', () => {
      const handler = jest.fn();
      const gameId = 'game-016';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        action: 'MOVE',
        payload: {
          direction: 'down',
          speed: 2,
          Game: { id: gameId },
        },
      };
      const context = { isBlocked: false, ms: 200 };

      dispatchInput(input, context);

      const { cmd } = handler.mock.calls[0][0];
      expect(cmd.payload).toEqual({
        direction: 'down',
        speed: 2,
        Game: { id: gameId },
      });
    });

    it('replay 事件中的 cmd 和入队事件中的 cmd 应该是同一个引用', () => {
      const enqueueHandler = jest.fn();
      const replayHandler = jest.fn();
      const gameId = 'game-017';

      EventBus.on(`command:queue:${gameId}:enqueue`, enqueueHandler);
      EventBus.on(`replay:${gameId}:add:record`, replayHandler);

      const input = {
        action: 'START_GAME',
        payload: { Game: { id: gameId }, level: 1 },
      };
      const context = { isBlocked: false, ms: 0 };

      dispatchInput(input, context);

      const enqueueCmd = enqueueHandler.mock.calls[0][0].cmd;
      const replayCmd = replayHandler.mock.calls[0][0].cmd;

      expect(enqueueCmd).toBe(replayCmd);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('context 只包含 isBlocked 时应该正常工作', () => {
      const handler = jest.fn();
      const gameId = 'game-018';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        action: 'MOVE',
        payload: { Game: { id: gameId } },
      };
      const context = { isBlocked: false };

      expect(() => {
        dispatchInput(input, context);
      }).not.toThrow();
    });

    it('payload 为空对象时应该正常工作', () => {
      const handler = jest.fn();
      const gameId = 'game-019';
      EventBus.on(`command:queue:${gameId}:enqueue`, handler);

      const input = {
        action: 'START_GAME',
        payload: { Game: { id: gameId } },
      };
      const context = { isBlocked: false, ms: 0 };

      dispatchInput(input, context);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('在没有监听器时调用不应该报错', () => {
      const input = {
        action: 'MOVE',
        payload: { Game: { id: 'game-020' } },
      };
      const context = { isBlocked: false, ms: 0 };

      expect(() => {
        dispatchInput(input, context);
      }).not.toThrow();
    });
  });
});
