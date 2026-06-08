import EventBus from '@/lib/core/event-bus/index.js';
import Base from '@/lib/core/index.js';

describe('Base', () => {
  beforeEach(() => {
    EventBus.clear();
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('不传参数时应该正常创建实例', () => {
      const base = new Base();

      expect(base).toBeDefined();
      expect(base).toBeInstanceOf(Base);
    });

    it('传入 deps 时应该将依赖注入到实例上', () => {
      const mockGame = { id: 'game-001', state: 'playing' };
      const mockEngine = { tick: jest.fn() };

      const base = new Base({
        Game: mockGame,
        Engine: mockEngine,
      });

      expect(base.Game).toBe(mockGame);
      expect(base.Engine).toBe(mockEngine);
    });

    it('传入空对象时应该正常创建实例', () => {
      const base = new Base({});

      expect(base).toBeDefined();
    });
  });

  // ==================== inject 方法 ====================
  describe('inject 方法', () => {
    it('应该将依赖注入到实例上', () => {
      const base = new Base();
      const mockGame = { id: 'game-002' };
      const mockRenderer = { draw: jest.fn() };

      base.inject({
        Game: mockGame,
        Renderer: mockRenderer,
      });

      expect(base.Game).toBe(mockGame);
      expect(base.Renderer).toBe(mockRenderer);
    });

    it('应该支持多次注入，后续注入会覆盖同名属性', () => {
      const base = new Base();
      const gameV1 = { id: 'v1' };
      const gameV2 = { id: 'v2' };

      base.inject({ Game: gameV1 });
      expect(base.Game).toBe(gameV1);

      base.inject({ Game: gameV2 });
      expect(base.Game).toBe(gameV2);
    });

    it('多次注入时不应该删除之前注入的其他属性', () => {
      const base = new Base();
      const game = { id: 'game-003' };
      const engine = { tick: jest.fn() };

      base.inject({ Game: game });
      base.inject({ Engine: engine });

      expect(base.Game).toBe(game);
      expect(base.Engine).toBe(engine);
    });

    it('传入空对象时不应该报错也不应该影响已有属性', () => {
      const base = new Base({ Game: { id: 'game-004' } });

      expect(() => {
        base.inject({});
      }).not.toThrow();

      expect(base.Game).toEqual({ id: 'game-004' });
    });

    it('应该在构造函数中自动调用 inject', () => {
      const game = { id: 'game-005' };
      const base = new Base({ Game: game });

      expect(base.Game).toBe(game);
    });
  });

  // ==================== emit 方法 ====================
  describe('emit 方法', () => {
    it('应该通过 EventBus 发送事件', () => {
      const handler = jest.fn();
      EventBus.on('test:event', handler);

      const base = new Base();
      base.emit('test:event', { key: 'value' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ key: 'value' });
    });

    it('不传 payload 时应该传递 undefined', () => {
      const handler = jest.fn();
      EventBus.on('test:event', handler);

      const base = new Base();
      base.emit('test:event');

      expect(handler).toHaveBeenCalledWith(undefined);
    });

    it('没有监听器时调用 emit 不应该报错', () => {
      const base = new Base();

      expect(() => {
        base.emit('no:listener');
      }).not.toThrow();
    });

    it('应该支持传递各种类型的 payload', () => {
      const handler = jest.fn();
      EventBus.on('test:types', handler);

      const base = new Base();

      base.emit('test:types', null);
      expect(handler).toHaveBeenLastCalledWith(null);

      base.emit('test:types', 123);
      expect(handler).toHaveBeenLastCalledWith(123);

      base.emit('test:types', 'string');
      expect(handler).toHaveBeenLastCalledWith('string');

      base.emit('test:types', [1, 2, 3]);
      expect(handler).toHaveBeenLastCalledWith([1, 2, 3]);
    });
  });

  // ==================== on 方法 ====================
  describe('on 方法', () => {
    it('应该通过 EventBus 注册事件监听', () => {
      const handler = jest.fn();
      const base = new Base();

      base.on('test:event', handler);
      EventBus.emit('test:event', { data: 'hello' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ data: 'hello' });
    });

    it('同一个事件可以注册多个不同的 handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const base = new Base();

      base.on('test:multi', handler1);
      base.on('test:multi', handler2);
      EventBus.emit('test:multi', { value: 42 });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('同一个 handler 重复注册不会触发多次', () => {
      const handler = jest.fn();
      const base = new Base();

      base.on('test:dup', handler);
      base.on('test:dup', handler);
      EventBus.emit('test:dup');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('传入非法的 event 不应该报错', () => {
      const base = new Base();

      expect(() => {
        base.on(null, jest.fn());
      }).not.toThrow();

      expect(() => {
        base.on(undefined, jest.fn());
      }).not.toThrow();

      expect(() => {
        base.on(123, jest.fn());
      }).not.toThrow();
    });

    it('传入非法的 handler 不应该报错', () => {
      const base = new Base();

      expect(() => {
        base.on('test', null);
      }).not.toThrow();

      expect(() => {
        base.on('test', undefined);
      }).not.toThrow();

      expect(() => {
        base.on('test', 'not a function');
      }).not.toThrow();
    });
  });

  // ==================== once 方法 ====================
  describe('once 方法', () => {
    it('应该只触发一次监听', () => {
      const handler = jest.fn();
      const base = new Base();

      base.once('test:once', handler);

      EventBus.emit('test:once', 'first');
      EventBus.emit('test:once', 'second');
      EventBus.emit('test:once', 'third');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('first');
    });

    it('多个 once 监听应该互不影响', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const base = new Base();

      base.once('test:once:multi', handler1);
      base.once('test:once:multi', handler2);

      EventBus.emit('test:once:multi', 'data');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);

      EventBus.emit('test:once:multi', 'data2');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('handler 执行报错时也应该取消订阅', () => {
      const base = new Base();
      let callCount = 0;

      const handler = jest.fn(() => {
        callCount++;
        throw new Error('once 回调执行失败');
      });

      base.once('test:once:error', handler);

      expect(() => {
        EventBus.emit('test:once:error');
      }).toThrow('once 回调执行失败');

      // handler 被调用了一次
      expect(callCount).toBe(1);

      // 再次 emit，handler 不应该再被调用
      // 注意：EventBus.emit 没有 try-catch，
      // 第一次 emit 因为抛错中断了，但 handler 确实被执行了
      // once 的 wrapper 里用了 try-finally，所以 off 一定会执行
      expect(() => {
        EventBus.emit('test:once:error');
      }).not.toThrow();

      // 确认 handler 只被调用了一次
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('传入非法参数时不应该报错', () => {
      const base = new Base();

      expect(() => {
        base.once(null, jest.fn());
      }).not.toThrow();

      expect(() => {
        base.once('test', null);
      }).not.toThrow();
    });
  });

  // ==================== off 方法 ====================
  describe('off 方法', () => {
    it('应该取消已注册的事件监听', () => {
      const handler = jest.fn();
      const base = new Base();

      base.on('test:off', handler);
      base.off('test:off', handler);

      EventBus.emit('test:off', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    it('应该只取消指定的 handler，不影响其他 handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const base = new Base();

      base.on('test:off:multi', handler1);
      base.on('test:off:multi', handler2);

      base.off('test:off:multi', handler1);
      EventBus.emit('test:off:multi', 'data');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('取消未注册的 handler 不应该报错', () => {
      const base = new Base();

      expect(() => {
        base.off('no:such:event', jest.fn());
      }).not.toThrow();
    });

    it('取消不存在的事件的 handler 不应该报错', () => {
      const handler = jest.fn();
      const base = new Base();

      expect(() => {
        base.off('nonexistent', handler);
      }).not.toThrow();
    });

    it('传入非法参数时不应该报错', () => {
      const base = new Base();

      expect(() => {
        base.off(null, jest.fn());
      }).not.toThrow();

      expect(() => {
        base.off('test', null);
      }).not.toThrow();
    });
  });

  // ==================== clear 方法 ====================
  describe('clear 方法', () => {
    it('应该清空所有事件监听', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const base = new Base();

      base.on('event:one', handler1);
      base.on('event:two', handler2);
      base.clear();

      EventBus.emit('event:one');
      EventBus.emit('event:two');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('clear 后重新注册的监听应该正常工作', () => {
      const handler = jest.fn();
      const base = new Base();

      base.on('event:test', jest.fn());
      base.clear();
      base.on('event:test', handler);

      EventBus.emit('event:test', 'data');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('空实例调用 clear 不应该报错', () => {
      const base = new Base();

      expect(() => {
        base.clear();
      }).not.toThrow();
    });
  });

  // ==================== 集成场景 ====================
  describe('集成场景', () => {
    it('子类应该能够继承并正常使用事件系统', () => {
      class CustomComponent extends Base {
        constructor(deps) {
          super(deps);
        }

        doSomething() {
          this.emit('custom:action', { status: 'done' });
        }
      }

      const handler = jest.fn();
      const component = new CustomComponent({ Game: { id: 'custom-001' } });

      component.on('custom:action', handler);
      component.doSomething();

      expect(handler).toHaveBeenCalledWith({ status: 'done' });
    });

    it('多个实例共享同一个 EventBus 时应该互不干扰', () => {
      const base1 = new Base();
      const base2 = new Base();

      const handler1 = jest.fn();
      const handler2 = jest.fn();

      base1.on('shared:event', handler1);
      base2.on('shared:event', handler2);

      // 通过 EventBus 直接触发，两个 handler 都应该被调用
      EventBus.emit('shared:event', 'data');

      expect(handler1).toHaveBeenCalledWith('data');
      expect(handler2).toHaveBeenCalledWith('data');
    });

    it('一个实例调用 clear 会影响所有共享 EventBus 的实例', () => {
      const base1 = new Base();
      const base2 = new Base();

      const handler1 = jest.fn();
      const handler2 = jest.fn();

      base1.on('shared:event', handler1);
      base2.on('shared:event', handler2);

      // base1 调用 clear，清空整个 EventBus
      base1.clear();

      EventBus.emit('shared:event', 'data');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  // ==================== 补充覆盖 103: once 方法委托给 EventBus ====================
  describe('once 方法 - 验证委托给 EventBus', () => {
    it('应该直接调用 EventBus.once', () => {
      const onceSpy = jest.spyOn(EventBus, 'once');
      const handler = jest.fn();
      const base = new Base();

      base.once('test:direct:once', handler);

      expect(onceSpy).toHaveBeenCalledTimes(1);
      expect(onceSpy).toHaveBeenCalledWith('test:direct:once', handler);

      onceSpy.mockRestore();
    });

    it('多次调用 once 应该多次委托给 EventBus', () => {
      const onceSpy = jest.spyOn(EventBus, 'once');
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      const base = new Base();

      base.once('event:a', handler1);
      base.once('event:b', handler2);
      base.once('event:c', handler3);

      expect(onceSpy).toHaveBeenCalledTimes(3);
      expect(onceSpy).toHaveBeenNthCalledWith(1, 'event:a', handler1);
      expect(onceSpy).toHaveBeenNthCalledWith(2, 'event:b', handler2);
      expect(onceSpy).toHaveBeenNthCalledWith(3, 'event:c', handler3);

      onceSpy.mockRestore();
    });

    it('同一个 handler 多次 once 应该多次委托', () => {
      const onceSpy = jest.spyOn(EventBus, 'once');
      const handler = jest.fn();
      const base = new Base();

      base.once('event:x', handler);
      base.once('event:x', handler);

      expect(onceSpy).toHaveBeenCalledTimes(2);

      onceSpy.mockRestore();
    });

    it('once 注册后实际只触发一次', () => {
      const handler = jest.fn();
      const base = new Base();

      base.once('test:once:verify', handler);

      // 触发第一次
      EventBus.emit('test:once:verify', 'first');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('first');

      // 触发第二次 - 不应该再调用
      EventBus.emit('test:once:verify', 'second');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('once 和 on 混合使用', () => {
      const onHandler = jest.fn();
      const onceHandler = jest.fn();
      const base = new Base();

      base.on('test:mixed', onHandler);
      base.once('test:mixed', onceHandler);

      // 第一次触发
      EventBus.emit('test:mixed', 'first');
      expect(onHandler).toHaveBeenCalledTimes(1);
      expect(onceHandler).toHaveBeenCalledTimes(1);

      // 第二次触发 - once 不再触发
      EventBus.emit('test:mixed', 'second');
      expect(onHandler).toHaveBeenCalledTimes(2);
      expect(onceHandler).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 补充覆盖 127: off 方法委托给 EventBus ====================
  describe('off 方法 - 验证委托给 EventBus', () => {
    it('应该直接调用 EventBus.off', () => {
      const offSpy = jest.spyOn(EventBus, 'off');
      const handler = jest.fn();
      const base = new Base();

      base.on('test:direct:off', handler);
      base.off('test:direct:off', handler);

      expect(offSpy).toHaveBeenCalledTimes(1);
      expect(offSpy).toHaveBeenCalledWith('test:direct:off', handler);

      offSpy.mockRestore();
    });

    it('多次调用 off 应该多次委托给 EventBus', () => {
      const offSpy = jest.spyOn(EventBus, 'off');
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const base = new Base();

      base.on('event:a', handler1);
      base.on('event:b', handler2);

      base.off('event:a', handler1);
      base.off('event:b', handler2);

      expect(offSpy).toHaveBeenCalledTimes(2);
      expect(offSpy).toHaveBeenNthCalledWith(1, 'event:a', handler1);
      expect(offSpy).toHaveBeenNthCalledWith(2, 'event:b', handler2);

      offSpy.mockRestore();
    });

    it('off 未注册的 handler 也应该委托给 EventBus', () => {
      const offSpy = jest.spyOn(EventBus, 'off');
      const handler = jest.fn();
      const base = new Base();

      base.off('nonexistent:event', handler);

      // 即使不存在，也应该委托给 EventBus
      expect(offSpy).toHaveBeenCalledWith('nonexistent:event', handler);

      offSpy.mockRestore();
    });

    it('off 后 handler 不应该再被调用', () => {
      const handler = jest.fn();
      const base = new Base();

      base.on('test:off:verify', handler);
      base.off('test:off:verify', handler);

      EventBus.emit('test:off:verify', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    it('off 一个 handler 不应该影响同一事件的其他 handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      const base = new Base();

      base.on('test:off:partial', handler1);
      base.on('test:off:partial', handler2);
      base.on('test:off:partial', handler3);

      base.off('test:off:partial', handler2);

      EventBus.emit('test:off:partial', 'data');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('重复 off 不应该报错', () => {
      const handler = jest.fn();
      const base = new Base();

      base.on('test:off:dup', handler);
      base.off('test:off:dup', handler);

      expect(() => {
        base.off('test:off:dup', handler);
      }).not.toThrow();
    });
  });

  // ==================== 所有方法的 spy 验证 ====================
  describe('所有方法委托验证', () => {
    it('emit 应该委托给 EventBus.emit', () => {
      const emitSpy = jest.spyOn(EventBus, 'emit');
      const base = new Base();

      base.emit('test:spy:emit', { key: 'value' });

      expect(emitSpy).toHaveBeenCalledWith('test:spy:emit', { key: 'value' });
      emitSpy.mockRestore();
    });

    it('on 应该委托给 EventBus.on', () => {
      const onSpy = jest.spyOn(EventBus, 'on');
      const handler = jest.fn();
      const base = new Base();

      base.on('test:spy:on', handler);

      expect(onSpy).toHaveBeenCalledWith('test:spy:on', handler);
      onSpy.mockRestore();
    });

    it('once 应该委托给 EventBus.once', () => {
      const onceSpy = jest.spyOn(EventBus, 'once');
      const handler = jest.fn();
      const base = new Base();

      base.once('test:spy:once', handler);

      expect(onceSpy).toHaveBeenCalledWith('test:spy:once', handler);
      onceSpy.mockRestore();
    });

    it('off 应该委托给 EventBus.off', () => {
      const offSpy = jest.spyOn(EventBus, 'off');
      const handler = jest.fn();
      const base = new Base();

      base.off('test:spy:off', handler);

      expect(offSpy).toHaveBeenCalledWith('test:spy:off', handler);
      offSpy.mockRestore();
    });

    it('clear 应该委托给 EventBus.clear', () => {
      const clearSpy = jest.spyOn(EventBus, 'clear');
      const base = new Base();

      base.clear();

      expect(clearSpy).toHaveBeenCalledTimes(1);
      clearSpy.mockRestore();
    });
  });

  // ==================== 委托方法的返回值验证 ====================
  describe('委托方法返回值', () => {
    it('emit 应该返回 EventBus.emit 的返回值', () => {
      // EventBus.emit 返回 void (undefined)
      const base = new Base();
      const result = base.emit('test:return');
      expect(result).toBeUndefined();
    });

    it('on 应该返回 EventBus.on 的返回值', () => {
      const base = new Base();
      const handler = jest.fn();
      const result = base.on('test:return:on', handler);
      expect(result).toBeUndefined();
    });

    it('once 应该返回 EventBus.once 的返回值', () => {
      const base = new Base();
      const handler = jest.fn();
      const result = base.once('test:return:once', handler);
      expect(result).toBeUndefined();
    });

    it('off 应该返回 EventBus.off 的返回值', () => {
      const base = new Base();
      const handler = jest.fn();
      const result = base.off('test:return:off', handler);
      expect(result).toBeUndefined();
    });

    it('clear 应该返回 EventBus.clear 的返回值', () => {
      const base = new Base();
      const result = base.clear();
      expect(result).toBeUndefined();
    });
  });
});
