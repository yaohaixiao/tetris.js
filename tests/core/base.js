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

      expect(callCount).toBe(1);

      expect(() => {
        EventBus.emit('test:once:error');
      }).not.toThrow();

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

      base1.clear();

      EventBus.emit('shared:event', 'data');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  // ==================== 边界条件测试（确保 100% 覆盖率） ====================
  describe('边界条件和异常处理', () => {
    it('once 方法应该正确处理 EventBus 异常', () => {
      const base = new Base();
      const handler = jest.fn(() => {
        throw new Error('Handler error');
      });

      // 确保即使 handler 抛出异常，once 也能正常工作
      base.once('test:error', handler);

      expect(() => {
        EventBus.emit('test:error');
      }).toThrow('Handler error');

      // 再次 emit 不应该再触发
      expect(() => {
        EventBus.emit('test:error');
      }).not.toThrow();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('off 方法应该能移除通过 once 注册的监听', () => {
      const handler = jest.fn();
      const base = new Base();

      base.once('test:once:off', handler);
      base.off('test:once:off', handler);

      EventBus.emit('test:once:off', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    it('多次调用 clear 不应该报错', () => {
      const base = new Base();

      expect(() => {
        base.clear();
        base.clear();
        base.clear();
      }).not.toThrow();
    });

    it('inject 方法应该处理 null 和 undefined 参数', () => {
      const base = new Base();

      expect(() => {
        base.inject(null);
      }).not.toThrow();

      expect(() => {
        base.inject(undefined);
      }).not.toThrow();

      // 验证 null 和 undefined 不会破坏实例
      expect(base).toBeDefined();
    });

    it('构造函数应该正确处理 null 和 undefined 参数', () => {
      expect(() => {
        new Base(null);
      }).not.toThrow();

      expect(() => {
        new Base(undefined);
      }).not.toThrow();
    });
  });
});
