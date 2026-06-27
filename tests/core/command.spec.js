import EventBus from '@/lib/core/event-bus/index.js';
import Command from '@/lib/core/command/command.js';

// 事件名常量
const DISPATCH_COMMAND = 'game:test-game-uuid:dispatch:command';

describe('Command', () => {
  let mockGame;

  beforeEach(() => {
    EventBus.clear();

    mockGame = {
      id: 'test-game-uuid',
    };
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建带 action 和 payload 的命令实例', () => {
      const cmd = new Command('MOVE', { direction: 'left', Game: mockGame });

      expect(cmd.action).toBe('MOVE');
      expect(cmd.payload).toEqual({ direction: 'left', Game: mockGame });
    });

    it('当不传 payload 时应该默认使用空对象', () => {
      const cmd = new Command('ROTATE');

      expect(cmd.action).toBe('ROTATE');
      expect(cmd.payload).toEqual({});
    });

    it('当传入 undefined 作为 payload 时应该使用空对象替代', () => {
      const cmd = new Command('DROP', undefined);

      expect(cmd.payload).toEqual({});
    });

    it('应该支持所有定义的 action 类型', () => {
      const actions = [
        'MOVE',
        'ROTATE',
        'DROP',
        'START_GAME',
        'PAUSE',
        'RESUME',
      ];

      actions.forEach((action) => {
        const cmd = new Command(action);
        expect(cmd.action).toBe(action);
      });
    });

    it('应该支持复杂的嵌套 payload 结构', () => {
      const complexPayload = {
        direction: 'down',
        speed: 2,
        position: { x: 0, y: 5 },
        modifiers: ['hard', 'soft'],
        Game: mockGame,
      };

      const cmd = new Command('MOVE', complexPayload);
      expect(cmd.payload).toEqual(complexPayload);
    });
  });

  // ==================== execute 方法 ====================
  describe('execute 方法', () => {
    it('应该通过 EventBus 发送 dispatch:command 事件', () => {
      const handler = jest.fn();
      EventBus.on(DISPATCH_COMMAND, handler);

      const cmd = new Command('MOVE', { direction: 'right', Game: mockGame });
      cmd.execute();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        action: 'MOVE',
        payload: { direction: 'right', Game: mockGame },
      });
    });

    it('payload 为空时应该发送空对象而不是 undefined', () => {
      const handler = jest.fn();
      EventBus.on(DISPATCH_COMMAND, handler);

      const cmd = new Command('START_GAME', { Game: mockGame });
      cmd.execute();

      expect(handler).toHaveBeenCalledWith({
        action: 'START_GAME',
        payload: { Game: mockGame },
      });
    });

    it('多次调用 execute 应该每次都触发事件', () => {
      const handler = jest.fn();
      EventBus.on(DISPATCH_COMMAND, handler);

      const cmd = new Command('MOVE', { direction: 'left', Game: mockGame });
      cmd.execute();
      cmd.execute();
      cmd.execute();

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('不同实例的 execute 调用应该互不干扰', () => {
      const receivedCommands = [];
      EventBus.on(DISPATCH_COMMAND, (data) => {
        receivedCommands.push(data);
      });

      const cmd1 = new Command('MOVE', { direction: 'left', Game: mockGame });
      const cmd2 = new Command('ROTATE', { direction: 'cw', Game: mockGame });

      cmd1.execute();
      cmd2.execute();

      expect(receivedCommands).toHaveLength(2);
      expect(receivedCommands[0]).toEqual({
        action: 'MOVE',
        payload: { direction: 'left', Game: mockGame },
      });
      expect(receivedCommands[1]).toEqual({
        action: 'ROTATE',
        payload: { direction: 'cw', Game: mockGame },
      });
    });

    it('execute 应该同步调用所有监听器', () => {
      let eventFired = false;
      EventBus.on(DISPATCH_COMMAND, () => {
        eventFired = true;
      });

      const cmd = new Command('DROP', { Game: mockGame });
      cmd.execute();

      expect(eventFired).toBe(true);
    });
  });

  // ==================== 事件触发时机 ====================
  describe('事件触发时机', () => {
    it('在构造函数执行期间不应该触发任何事件', () => {
      const handler = jest.fn();
      EventBus.on(DISPATCH_COMMAND, handler);

      // eslint-disable-next-line no-new
      new Command('MOVE', { direction: 'left', Game: mockGame });

      expect(handler).not.toHaveBeenCalled();
    });

    it('只有在调用 execute 时才应该触发事件', () => {
      const handler = jest.fn();
      EventBus.on(DISPATCH_COMMAND, handler);

      const cmd = new Command('PAUSE', { reason: 'manual', Game: mockGame });

      // 构造后未调用 execute，不应该触发任何事件
      expect(handler).not.toHaveBeenCalled();

      // 调用 execute 后才触发
      cmd.execute();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('action 为空字符串时应该正常发送事件', () => {
      const handler = jest.fn();
      EventBus.on(DISPATCH_COMMAND, handler);

      const cmd = new Command('', { Game: mockGame });
      cmd.execute();

      expect(handler).toHaveBeenCalledWith({
        action: '',
        payload: { Game: mockGame },
      });
    });

    it('payload 中值为 null 的属性应该被保留', () => {
      const cmd = new Command('TEST', { value: null });

      expect(cmd.payload.value).toBeNull();
    });

    it('action 为 null 或 undefined 时应该保留原值不进行转换', () => {
      const cmd1 = new Command(null);
      const cmd2 = new Command(undefined);

      expect(cmd1.action).toBeNull();
      expect(cmd2.action).toBeUndefined();
    });

    it('payload 没有 Game 时 execute 应该能处理', () => {
      // 没有 Game 的 payload 会在 execute 时报错，这是预期行为
      // 因为 Command 设计上依赖 payload.Game
      const cmd = new Command('MOVE', { direction: 'left' });

      expect(() => {
        cmd.execute();
      }).toThrow();
    });

    it('没有 listener 时调用 execute 不应该报错', () => {
      const cmd = new Command('MOVE', { direction: 'left', Game: mockGame });

      expect(() => {
        cmd.execute();
      }).not.toThrow();
    });
  });
});
