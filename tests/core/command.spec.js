import Command from '@/lib/core/command/command.js';
import EventBus from '@/lib/core/event-bus/index.js';

jest.mock('@/lib/core/event-bus/index.js', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

describe('Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('构造函数正确保存 action 和 payload', () => {
    const cmd = new Command('MOVE_LEFT', { direction: 'left' });

    expect(cmd.action).toBe('MOVE_LEFT');
    expect(cmd.payload).toEqual({ direction: 'left' });
  });

  test('不传 payload 时默认为空对象', () => {
    const cmd = new Command('DROP');

    expect(cmd.action).toBe('DROP');
    expect(cmd.payload).toEqual({});
  });

  test('execute 触发 EventBus.emit，参数格式正确', () => {
    const cmd = new Command('ROTATE', { clockwise: true });
    cmd.execute();

    expect(EventBus.emit).toHaveBeenCalledTimes(1);
    expect(EventBus.emit).toHaveBeenCalledWith('dispatch:command', {
      action: 'ROTATE',
      payload: { clockwise: true },
    });
  });

  test('不同 action 的 emit 事件名一致', () => {
    const cmd1 = new Command('MOVE_LEFT');
    const cmd2 = new Command('DROP');

    cmd1.execute();
    cmd2.execute();

    expect(EventBus.emit).toHaveBeenCalledTimes(2);
    expect(EventBus.emit).toHaveBeenNthCalledWith(1, 'dispatch:command', {
      action: 'MOVE_LEFT',
      payload: {},
    });
    expect(EventBus.emit).toHaveBeenNthCalledWith(2, 'dispatch:command', {
      action: 'DROP',
      payload: {},
    });
  });

  test('同一个 Command 实例可以多次 execute', () => {
    const cmd = new Command('MOVE_DOWN');

    cmd.execute();
    cmd.execute();
    cmd.execute();

    expect(EventBus.emit).toHaveBeenCalledTimes(3);
  });

  test('execute 传出的 payload 不包含多余字段', () => {
    const cmd = new Command('START_GAME', { level: 5 });
    cmd.execute();

    const emitted = EventBus.emit.mock.calls[0][1];
    expect(Object.keys(emitted)).toEqual(['action', 'payload']);
  });
});
