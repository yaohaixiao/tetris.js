import dispatchInput from '@/lib/engine/dispatch-input';
import Command from '@/lib/core/command/command';
import CommandQueue from '@/lib/core/command/command-queue';
import EventBus from '@/lib/core/event-bus';

jest.mock('@/lib/core/command/command');
jest.mock('@/lib/core/command/command-queue', () => ({
  enqueue: jest.fn(),
  flush: jest.fn(),
  clear: jest.fn(),
  queue: [],
}));
jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

describe('dispatchInput', () => {
  const defaultContext = { isBlocked: false, ms: 1000 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== 正常分发 ==========
  test('正常 input 被转换为 Command 并入队', () => {
    const input = { action: 'MOVE_LEFT', payload: {} };

    dispatchInput(input, defaultContext);

    expect(Command).toHaveBeenCalledWith('MOVE_LEFT', { isBlocked: false });
    expect(CommandQueue.enqueue).toHaveBeenCalled();
  });

  test('payload 被合并了 isBlocked', () => {
    const input = { action: 'ROTATE', payload: { clockwise: true } };

    dispatchInput(input, defaultContext);

    expect(Command).toHaveBeenCalledWith('ROTATE', {
      clockwise: true,
      isBlocked: false,
    });
  });

  test('发出 replay:add:record 事件', () => {
    const input = { action: 'DROP', payload: {} };

    dispatchInput(input, { isBlocked: false, ms: 2500 });

    expect(EventBus.emit).toHaveBeenCalledWith('replay:add:record', {
      ms: 2500,
      cmd: expect.any(Object),
    });
  });

  // ========== 拦截 ==========
  test('isBlocked 为 true 时不执行', () => {
    const input = { action: 'MOVE_LEFT', payload: {} };

    dispatchInput(input, { isBlocked: true, ms: 1000 });

    expect(Command).not.toHaveBeenCalled();
    expect(CommandQueue.enqueue).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('action 为空时不执行', () => {
    dispatchInput({ action: '', payload: {} }, defaultContext);
    dispatchInput({ action: null, payload: {} }, defaultContext);
    dispatchInput({ action: undefined, payload: {} }, defaultContext);

    expect(Command).not.toHaveBeenCalled();
    expect(CommandQueue.enqueue).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  // ========== 多次调用 ==========
  test('多次调用分别入队和记录', () => {
    dispatchInput({ action: 'MOVE_LEFT', payload: {} }, { isBlocked: false, ms: 1000 });
    dispatchInput({ action: 'MOVE_RIGHT', payload: {} }, { isBlocked: false, ms: 1100 });

    expect(CommandQueue.enqueue).toHaveBeenCalledTimes(2);
    expect(EventBus.emit).toHaveBeenCalledTimes(2);
  });
});
