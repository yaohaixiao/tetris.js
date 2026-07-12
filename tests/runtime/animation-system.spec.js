import AnimationSystem from '@/lib/runtime/animation-system.js';

// Mock Base
jest.mock('@/lib/core', () => {
  function MockBase(options) {
    this.Game = options?.Game;
    this.Scheduler = options?.Scheduler;
    this._events = {};
  }

  MockBase.prototype.on = function (event, fn) {
    (this._events[event] ??= []).push(fn);
  };

  MockBase.prototype.off = function (event, fn) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter((f) => f !== fn);
  };

  MockBase.prototype.emit = function (event, ...args) {
    if (!this._events[event]) return;
    for (const fn of this._events[event]) {
      fn(...args);
    }
  };

  return { __esModule: true, default: MockBase };
});

// Mock AnimationsEvents
jest.mock('@/lib/events/event-catalog.js', () => ({
  AnimationsEvents: (id) => ({ CLEAR: `animations:${id}:clear` }),
}));

// ============================================================
// 辅助函数
// ============================================================

/** 创建有效的动画对象 */
function createAnim(overrides = {}) {
  return {
    render: jest.fn(),
    layer: 0,
    blocking: false,
    name: 'anonymous',
    _finished: false,
    dispose: jest.fn(),
    ...overrides,
  };
}

/** 创建 AnimationSystem 实例 */
function createSystem() {
  return new AnimationSystem({ Game: { id: 'test' } });
}

// ============================================================
// 构造函数 & size
// ============================================================
describe('AnimationSystem - 构造函数 & size', () => {
  it('初始 size 应该为 0', () => {
    const system = createSystem();
    expect(system.size).toBe(0);
  });
});

// ============================================================
// register
// ============================================================
describe('AnimationSystem - register', () => {
  it('应该将动画加入队列，size 增加', () => {
    const system = createSystem();
    const anim = createAnim();
    system.register(anim);
    expect(system.size).toBe(1);
  });

  it('应该为缺失属性设置默认值', () => {
    const system = createSystem();
    const anim = { render: jest.fn() };
    system.register(anim);
    expect(anim.layer).toBe(0);
    expect(anim.blocking).toBe(false);
    expect(anim.name).toBe('anonymous');
  });

  it('应该保留已有的属性值不被覆盖', () => {
    const system = createSystem();
    const anim = {
      render: jest.fn(),
      layer: 5,
      blocking: true,
      name: 'custom-name',
    };
    system.register(anim);
    expect(anim.layer).toBe(5);
    expect(anim.blocking).toBe(true);
    expect(anim.name).toBe('custom-name');
  });

  it('传入 null 时应该抛出错误', () => {
    const system = createSystem();
    expect(() => system.register(null)).toThrow(
      'Invalid animation: must implement render()',
    );
  });

  it('传入没有 render 方法的对象时应该抛出错误', () => {
    const system = createSystem();
    expect(() => system.register({})).toThrow(
      'Invalid animation: must implement render()',
    );
  });

  it('传入 render 不是函数的对象时应该抛出错误', () => {
    const system = createSystem();
    expect(() => system.register({ render: 'not a function' })).toThrow(
      'Invalid animation: must implement render()',
    );
  });
});

// ============================================================
// flush - 合并待注册动画
// ============================================================
describe('AnimationSystem - flush（合并 pending）', () => {
  it('flush 后 pending 中的动画应该进入活跃队列', () => {
    const system = createSystem();
    const anim = createAnim();
    system.register(anim);
    system.flush();
    // flush 后动画仍在队列中（未结束）
    expect(system.size).toBe(1);
  });

  it('多次 register 后一次 flush 应该全部合并', () => {
    const system = createSystem();
    const a1 = createAnim();
    const a2 = createAnim();
    const a3 = createAnim();
    system.register(a1);
    system.register(a2);
    system.register(a3);
    expect(system.size).toBe(3);
    system.flush();
    expect(system.size).toBe(3);
  });

  it('空队列时 flush 不应报错', () => {
    const system = createSystem();
    expect(() => system.flush()).not.toThrow();
  });

  it('连续多次 flush 不应出错', () => {
    const system = createSystem();
    const anim = createAnim();
    system.register(anim);
    system.flush();
    system.flush();
    expect(system.size).toBe(1);
  });
});

// ============================================================
// flush - 移除已结束动画
// ============================================================
describe('AnimationSystem - flush（移除已结束动画）', () => {
  it('应该移除 _finished 为 true 的动画', () => {
    const system = createSystem();
    const anim = createAnim({ _finished: true });
    system.register(anim);
    system.flush();
    expect(system.size).toBe(0);
  });

  it('移除时应该调用动画的 dispose 方法', () => {
    const system = createSystem();
    const dispose = jest.fn();
    const anim = createAnim({ _finished: true, dispose });
    system.register(anim);
    system.flush();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('动画没有 dispose 方法时不应报错', () => {
    const system = createSystem();
    const anim = createAnim({ _finished: true });
    delete anim.dispose;
    system.register(anim);
    expect(() => system.flush()).not.toThrow();
    expect(system.size).toBe(0);
  });

  it('应该只移除已结束的动画，保留未结束的', () => {
    const system = createSystem();
    const finished = createAnim({ _finished: true, name: 'done' });
    const running = createAnim({ name: 'running' });
    system.register(finished);
    system.register(running);
    system.flush();
    expect(system.size).toBe(1);
  });

  it('应该正确处理多个已结束动画同时存在的情况', () => {
    const system = createSystem();
    const a1 = createAnim({ _finished: true, name: 'a1' });
    const a2 = createAnim({ name: 'a2' });
    const a3 = createAnim({ _finished: true, name: 'a3' });
    system.register(a1);
    system.register(a2);
    system.register(a3);
    system.flush();
    expect(system.size).toBe(1);
  });

  it('所有动画都结束时 size 应该为 0', () => {
    const system = createSystem();
    system.register(createAnim({ _finished: true }));
    system.register(createAnim({ _finished: true }));
    system.flush();
    expect(system.size).toBe(0);
  });
});

// ============================================================
// render
// ============================================================
describe('AnimationSystem - render', () => {
  it('应该按 layer 升序渲染（layer 小的先渲染）', () => {
    const system = createSystem();
    const order = [];
    const top = createAnim({ layer: 10, render: () => order.push(10) });
    const bottom = createAnim({ layer: 0, render: () => order.push(0) });
    const middle = createAnim({ layer: 5, render: () => order.push(5) });
    system.register(top);
    system.register(bottom);
    system.register(middle);
    system.flush();
    system.render();
    expect(order).toEqual([0, 5, 10]);
  });

  it('相同 layer 的动画应保持注册顺序（稳定排序）', () => {
    const system = createSystem();
    const order = [];
    const first = createAnim({
      layer: 1,
      name: 'first',
      render: () => order.push('first'),
    });
    const second = createAnim({
      layer: 1,
      name: 'second',
      render: () => order.push('second'),
    });
    system.register(first);
    system.register(second);
    system.flush();
    system.render();
    expect(order).toEqual(['first', 'second']);
  });

  it('队列无变化时第二次 render 应该复用排序缓存', () => {
    const system = createSystem();
    const anim = createAnim();
    system.register(anim);
    system.flush();
    system.render();
    expect(anim.render).toHaveBeenCalledTimes(1);
    system.render();
    expect(anim.render).toHaveBeenCalledTimes(2);
  });

  it('空队列时 render 不应报错', () => {
    const system = createSystem();
    expect(() => system.render()).not.toThrow();
  });

  it('新动画加入后 render 应该重新排序', () => {
    const system = createSystem();
    const order = [];
    const first = createAnim({ layer: 10, render: () => order.push(10) });
    system.register(first);
    system.flush();
    system.render();
    expect(order).toEqual([10]);

    const second = createAnim({ layer: 5, render: () => order.push(5) });
    system.register(second);
    system.flush();
    order.length = 0;
    system.render();
    expect(order).toEqual([5, 10]);
  });
});

// ============================================================
// hasBlocking
// ============================================================
describe('AnimationSystem - hasBlocking', () => {
  it('没有阻塞动画时应返回 false', () => {
    const system = createSystem();
    system.register(createAnim({ blocking: false }));
    system.flush();
    expect(system.hasBlocking()).toBe(false);
  });

  it('存在阻塞动画时应返回 true', () => {
    const system = createSystem();
    system.register(createAnim({ blocking: true }));
    system.flush();
    expect(system.hasBlocking()).toBe(true);
  });

  it('混合阻塞和非阻塞动画时应返回 true', () => {
    const system = createSystem();
    system.register(createAnim({ blocking: false, name: 'non-blocking' }));
    system.register(createAnim({ blocking: true, name: 'blocking' }));
    system.flush();
    expect(system.hasBlocking()).toBe(true);
  });

  it('按名称精确匹配阻塞动画', () => {
    const system = createSystem();
    system.register(createAnim({ blocking: true, name: 'clear-lines' }));
    system.register(createAnim({ blocking: true, name: 'countdown' }));
    system.flush();

    expect(system.hasBlocking(['clear-lines'])).toBe(true);
    expect(system.hasBlocking(['level-up'])).toBe(false);
  });

  it('names 为空数组时应该匹配所有阻塞动画', () => {
    const system = createSystem();
    system.register(createAnim({ blocking: true, name: 'a' }));
    system.register(createAnim({ blocking: true, name: 'b' }));
    system.flush();

    expect(system.hasBlocking()).toBe(true);
    expect(system.hasBlocking([])).toBe(true);
  });

  it('空队列时应该返回 false', () => {
    const system = createSystem();
    expect(system.hasBlocking()).toBe(false);
  });
});

// ============================================================
// clear
// ============================================================
describe('AnimationSystem - clear', () => {
  it('应该清空所有队列，size 变为 0', () => {
    const system = createSystem();
    system.register(createAnim());
    system.register(createAnim());
    system.flush();
    system.register(createAnim()); // pending 中还有一个
    expect(system.size).toBe(3);

    system.clear();
    expect(system.size).toBe(0);
  });

  it('应该调用所有动画（queue 和 pending）的 dispose', () => {
    const system = createSystem();
    const d1 = jest.fn();
    const d2 = jest.fn();
    const d3 = jest.fn();

    system.register(createAnim({ dispose: d1 }));
    system.register(createAnim({ dispose: d2 }));
    system.flush(); // d1, d2 进入 queue
    system.register(createAnim({ dispose: d3 })); // d3 在 pending

    system.clear();
    expect(d1).toHaveBeenCalledTimes(1);
    expect(d2).toHaveBeenCalledTimes(1);
    expect(d3).toHaveBeenCalledTimes(1);
  });

  it('没有 dispose 方法的动画 clear 时不应报错', () => {
    const system = createSystem();
    const anim = createAnim();
    delete anim.dispose;
    system.register(anim);
    system.flush();
    expect(() => system.clear()).not.toThrow();
  });

  it('clear 后可以继续注册新动画', () => {
    const system = createSystem();
    system.register(createAnim());
    system.clear();
    system.register(createAnim());
    expect(system.size).toBe(1);
  });
});

// ============================================================
// subscribe / unsubscribe
// ============================================================
describe('AnimationSystem - subscribe / unsubscribe', () => {
  it('subscribe 后收到 CLEAR 事件应该触发 clear', () => {
    const system = createSystem();
    const anim = createAnim();
    system.register(anim);
    system.flush();
    system.subscribe();

    system.emit('animations:test:clear');
    expect(system.size).toBe(1);
  });

  it('unsubscribe 后收到 CLEAR 事件不应触发 clear', () => {
    const system = createSystem();
    const anim = createAnim();
    system.register(anim);
    system.flush();
    system.subscribe();
    system.unsubscribe();

    system.emit('animations:test:clear');
    expect(system.size).toBe(1);
  });
});

// ============================================================
// 完整生命周期集成测试
// ============================================================
describe('AnimationSystem - 完整生命周期', () => {
  it('register → flush → render → _finished → flush → dispose', () => {
    const system = createSystem();
    const dispose = jest.fn();
    const render = jest.fn();
    const anim = createAnim({ render, dispose });

    // 1. 注册：进入 pending
    system.register(anim);
    expect(system.size).toBe(1);

    // 2. flush：进入 queue
    system.flush();
    expect(system.size).toBe(1);

    // 3. 渲染
    system.render();
    expect(render).toHaveBeenCalledTimes(1);

    // 4. 动画自身标记结束
    anim._finished = true;

    // 5. flush：调用 dispose 并移除
    system.flush();
    expect(system.size).toBe(0);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('flush 过程中新注册的动画在下次 flush 时合并', () => {
    const system = createSystem();
    const a1 = createAnim({ name: 'a1' });
    const a2 = createAnim({ name: 'a2' });

    // 注册 a1 并 flush
    system.register(a1);
    system.flush();
    expect(system.size).toBe(1);

    // 在 a1 活跃期间注册 a2
    system.register(a2);
    expect(system.size).toBe(2);

    // a2 还在 pending，flush 后进入 queue
    system.flush();
    expect(system.size).toBe(2);
  });

  it('动画结束时不应该渲染已移除的动画', () => {
    const system = createSystem();
    const render1 = jest.fn();
    const render2 = jest.fn();

    const a1 = createAnim({ render: render1, _finished: true });
    const a2 = createAnim({ render: render2 });

    system.register(a1);
    system.register(a2);
    system.flush(); // a1 被移除

    system.render();
    expect(render1).not.toHaveBeenCalled();
    expect(render2).toHaveBeenCalledTimes(1);
  });
});
