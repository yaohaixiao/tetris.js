import EventBus from '@/lib/core/event-bus/index.js';

describe('EventBus', () => {
  beforeEach(() => {
    // 清空所有事件，保证测试隔离
    EventBus._listeners = {};
    EventBus.events.clear();
  });

  // ==================== on + emit ====================
  describe('on + emit', () => {
    test('订阅后能收到消息', () => {
      const fn = jest.fn();
      EventBus.on('test:event', fn);
      EventBus.emit('test:event', { value: 1 });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith({ value: 1 });
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

    test('事件名隔离', () => {
      const fnA = jest.fn();
      const fnB = jest.fn();
      EventBus.on('event:a', fnA);
      EventBus.on('event:b', fnB);
      EventBus.emit('event:a');
      expect(fnA).toHaveBeenCalledTimes(1);
      expect(fnB).not.toHaveBeenCalled();
    });

    test('触发没有订阅的事件不会报错', () => {
      expect(() => EventBus.emit('nonexistent')).not.toThrow();
    });
  });

  // ==================== on 参数校验 ====================
  describe('on 参数校验', () => {
    test('event 非字符串时不注册', () => {
      const fn = jest.fn();
      EventBus.on(null, fn);
      EventBus.emit(null);
      expect(fn).not.toHaveBeenCalled();
    });

    test('handler 非函数时不注册', () => {
      EventBus.on('test:event', 'not a function');
      expect(() => EventBus.emit('test:event')).not.toThrow();
    });
  });

  // ==================== off ====================
  describe('off', () => {
    test('取消订阅后不再收到消息', () => {
      const fn = jest.fn();
      EventBus.on('test:event', fn);
      EventBus.off('test:event', fn);
      EventBus.emit('test:event');
      expect(fn).not.toHaveBeenCalled();
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

    test('off 不存在的事件不会报错', () => {
      const fn = jest.fn();
      expect(() => EventBus.off('nonexistent', fn)).not.toThrow();
    });

    test('off 后 event 没有订阅者时清理事件条目', () => {
      const fn = jest.fn();
      EventBus.on('test:cleanup', fn);
      EventBus.off('test:cleanup', fn);
      expect(() => EventBus.emit('test:cleanup')).not.toThrow();
    });
  });

  // ==================== off 参数校验 ====================
  describe('off 参数校验', () => {
    test('event 非字符串时不操作', () => {
      const fn = jest.fn();
      EventBus.on('test:event', fn);
      EventBus.off(123, fn);
      EventBus.emit('test:event');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('handler 非函数时不操作', () => {
      const fn = jest.fn();
      EventBus.on('test:event', fn);
      EventBus.off('test:event', 'not a function');
      EventBus.emit('test:event');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== once ====================
  describe('once', () => {
    test('只触发一次', () => {
      const fn = jest.fn();
      EventBus.once('test:once', fn);
      EventBus.emit('test:once', { value: 1 });
      EventBus.emit('test:once', { value: 2 });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith({ value: 1 });
    });

    test('event 非字符串时不注册', () => {
      const fn = jest.fn();
      EventBus.once(123, fn);
      EventBus.emit(123);
      expect(fn).not.toHaveBeenCalled();
    });

    test('handler 非函数时不注册', () => {
      EventBus.once('test:once', 'not a function');
      expect(() => EventBus.emit('test:once')).not.toThrow();
    });

    test('handler 抛错后仍能取消订阅', () => {
      const fn = jest.fn(() => {
        throw new Error('test error');
      });
      EventBus.once('test:once', fn);
      expect(() => EventBus.emit('test:once')).toThrow('test error');
      expect(() => EventBus.emit('test:once')).not.toThrow();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== emit 边界 ====================
  describe('emit 边界', () => {
    test('跳过非法 handler', () => {
      const fn = jest.fn();
      EventBus.on('test:emit', fn);
      // 手动注入非法 handler 模拟边界
      EventBus.events.get('test:emit').add('not a function');
      expect(() => EventBus.emit('test:emit')).not.toThrow();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== clear ====================
  describe('clear', () => {
    test('clear 后所有事件被清空', () => {
      const fn = jest.fn();
      EventBus.on('test:event', fn);
      EventBus.clear();
      EventBus.emit('test:event');
      expect(fn).not.toHaveBeenCalled();
    });

    test('clear 后 events Map 为空', () => {
      EventBus.on('test:a', jest.fn());
      EventBus.on('test:b', jest.fn());
      EventBus.clear();
      expect(EventBus.events.size).toBe(0);
    });
  });
});
