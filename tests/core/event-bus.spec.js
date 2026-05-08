import EventBus from '@/lib/core/event-bus/index.js';

describe('EventBus', () => {
  beforeEach(() => {
    // 清空所有事件，保证测试隔离
    EventBus._listeners = {};
  });

  test('on + emit：订阅后能收到消息', () => {
    const fn = jest.fn();
    EventBus.on('test:event', fn);
    EventBus.emit('test:event', { value: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({ value: 1 });
  });

  test('off：取消订阅后不再收到消息', () => {
    const fn = jest.fn();
    EventBus.on('test:event', fn);
    EventBus.off('test:event', fn);
    EventBus.emit('test:event');
    expect(fn).not.toHaveBeenCalled();
  });

  test('同一个事件多个回调都能收到', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    EventBus.on('test:event', fn1);
    EventBus.on('test:event', fn2);
    EventBus.emit('test:event');
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  test('监听后再取消，不会影响其他回调', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    EventBus.on('test:event', fn1);
    EventBus.on('test:event', fn2);
    EventBus.off('test:event', fn1);
    EventBus.emit('test:event');
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  test('触发没有订阅的事件不会报错', () => {
    expect(() => EventBus.emit('nonexistent')).not.toThrow();
  });

  test('事件名隔离', () => {
    const fnA = jest.fn();
    const fnB = jest.fn();
    EventBus.on('event:a', fnA);
    EventBus.on('event:b', fnB);
    EventBus.emit('event:a');
    expect(fnA).toHaveBeenCalledTimes(1);
    expect(fnB).not.toHaveBeenCalled();
  });
});
