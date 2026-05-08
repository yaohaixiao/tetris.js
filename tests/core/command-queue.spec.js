import CommandQueue from '@/lib/core/command/command-queue.js';
import Command from '@/lib/core/command/command.js';
import EventBus from '@/lib/core/event-bus/index.js';

jest.mock('@/lib/core/event-bus/index.js', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

describe('CommandQueue', () => {
  beforeEach(() => {
    CommandQueue.clear();
    jest.clearAllMocks();
  });

  test('enqueue + flush：入队后 flush 执行所有命令', () => {
    const cmd1 = new Command('MOVE_LEFT', {});
    const cmd2 = new Command('ROTATE', {});

    CommandQueue.enqueue(cmd1);
    CommandQueue.enqueue(cmd2);
    CommandQueue.flush();

    expect(EventBus.emit).toHaveBeenCalledTimes(2);
    expect(EventBus.emit).toHaveBeenNthCalledWith(1, 'dispatch:command', {
      action: 'MOVE_LEFT',
      payload: {},
    });
    expect(EventBus.emit).toHaveBeenNthCalledWith(2, 'dispatch:command', {
      action: 'ROTATE',
      payload: {},
    });
  });

  test('flush 后队列清空', () => {
    CommandQueue.enqueue(new Command('MOVE_LEFT', {}));
    CommandQueue.flush();
    expect(CommandQueue.queue.length).toBe(0);
  });

  test('clear：丢弃所有未执行命令', () => {
    CommandQueue.enqueue(new Command('MOVE_LEFT', {}));
    CommandQueue.clear();
    expect(CommandQueue.queue.length).toBe(0);
    CommandQueue.flush();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });
});
