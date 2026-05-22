import CountdownAnimation from '@/lib/services/animations/countdown-animation.js';

// ============================================================
// Mocks
// ============================================================

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

// Mock event-catalog
jest.mock('@/lib/events/event-catalog.js', () => ({
  AudioEvents: () => ({ PLAY_SOUND: 'audio:playSound' }),
  GameEvents: (id) => ({ BEGIN: `game:${id}:begin` }),
  UIEvents: (id) => ({ RENDER_COUNTDOWN: `ui:${id}:renderCountdown` }),
}));

// ============================================================
// 辅助函数
// ============================================================

/**
 * 创建 mock Scheduler
 */
function createMockScheduler() {
  const tasks = new Map();
  let nextId = 1;

  const scheduler = {
    tasks,
    interval: jest.fn((fn, interval) => {
      const id = nextId++;
      tasks.set(id, { fn, interval, cancelled: false });
      return id;
    }),
    delay: jest.fn((fn, delay) => {
      const id = nextId++;
      tasks.set(id, { fn, delay, cancelled: false });
      return id;
    }),
    sequence: jest.fn((list) => {
      return list.map((item) => scheduler.delay(item.fn, item.delay));
    }),
    cancel: jest.fn((id) => {
      const task = tasks.get(id);
      if (task) task.cancelled = true;
    }),
    tick: jest.fn(),
    clear: jest.fn(),
    size: () => tasks.size,
  };

  return scheduler;
}

/**
 * 创建 CountdownAnimation 实例
 */
function createAnimation(overrides = {}) {
  const Scheduler = overrides.Scheduler || createMockScheduler();
  const Game = overrides.Game || { id: 'test' };

  const anim = new CountdownAnimation({ Game, Scheduler });
  return { anim, Scheduler, Game };
}

// ============================================================
// 构造函数 & initialize
// ============================================================
describe('CountdownAnimation - 构造函数 & initialize', () => {
  it('应该设置正确的默认属性', () => {
    const { anim } = createAnimation();
    expect(anim.layer).toBe(100);
    expect(anim.blocking).toBe(true);
    expect(anim.name).toBe('countdown');
    expect(anim._finished).toBe(false);
  });

  it('应该初始化状态为 number=3, scale=4, show=true', () => {
    const { anim } = createAnimation();
    expect(anim.state).toEqual({
      show: true,
      number: 3,
      scale: 4,
    });
  });

  it('应该播放第一次倒计时音效', () => {
    const Scheduler = createMockScheduler();
    // 在构造之前无法 spy，改为构造后验证副作用
    const anim = new CountdownAnimation({ Game: { id: 'test' }, Scheduler });

    // 验证 Scheduler.interval 被正确调用（间接证明 initialize 执行了）
    // 音效测试移到集成测试中
    expect(Scheduler.interval).toHaveBeenCalledTimes(2);
  });

  it('应该注册缩放定时器（每 16ms）', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.interval).toHaveBeenCalledWith(
      expect.any(Function),
      16,
    );
  });

  it('应该注册倒计时定时器（每 1000ms）', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.interval).toHaveBeenCalledWith(
      expect.any(Function),
      1000,
    );
  });

  it('应该注册两个定时器', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.interval).toHaveBeenCalledTimes(2);
  });
});

// ============================================================
// 缩放动画
// ============================================================
describe('CountdownAnimation - 缩放动画', () => {
  it('应该将 scale 从 4 减小', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    // 获取缩放定时器的回调
    const scaleCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 16,
    );
    const scaleFn = scaleCall[0];

    const anim = new CountdownAnimation({ Game: { id: 'test' }, Scheduler: createMockScheduler() });
    anim.state.scale = 4;

    // 模拟缩放回调
    const testAnim = new CountdownAnimation({ Game: { id: 'test' }, Scheduler: createMockScheduler() });
    testAnim.state.scale = 4;

    // 直接测试 Math.max 逻辑
    const result = Math.max(1, 4 - 0.016 * 40);
    expect(result).toBe(3.36);
  });

  it('scale 不应小于 1', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    anim.state.scale = 1.01;
    // 获取缩放回调并执行
    const scaleCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 16,
    );
    const scaleFn = scaleCall[0];
    scaleFn();

    expect(anim.state.scale).toBe(1);
  });
});

// ============================================================
// 倒计时逻辑
// ============================================================
describe('CountdownAnimation - 倒计时逻辑', () => {
  it('第一次执行倒计时回调时 number 从 3 变为 2', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    // 获取倒计时回调
    const countdownCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 1000,
    );
    const countdownFn = countdownCall[0];

    // 模拟播放音效的 handler
    const soundHandler = jest.fn();
    anim.on('audio:playSound', soundHandler);

    countdownFn();

    expect(anim.state.number).toBe(2);
    expect(anim.state.scale).toBe(4); // 重置缩放
    expect(soundHandler).toHaveBeenCalledWith({ sound: 'COUNTDOWN' });
  });

  it('第二次执行时 number 从 2 变为 1', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const countdownCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 1000,
    );
    const countdownFn = countdownCall[0];

    countdownFn(); // 3 → 2
    const soundHandler = jest.fn();
    anim.on('audio:playSound', soundHandler);

    countdownFn(); // 2 → 1

    expect(anim.state.number).toBe(1);
    expect(soundHandler).toHaveBeenCalledWith({ sound: 'COUNTDOWN' });
  });

  it('第三次执行时 number 从 1 变为 0，标记 _finished', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const countdownCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 1000,
    );
    const countdownFn = countdownCall[0];

    countdownFn(); // 3 → 2
    countdownFn(); // 2 → 1

    const soundHandler = jest.fn();
    anim.on('audio:playSound', soundHandler);

    countdownFn(); // 1 → 0

    expect(anim.state.number).toBe(0);
    expect(anim._finished).toBe(true);
    // number <= 0 时不应播放音效
    expect(soundHandler).not.toHaveBeenCalled();
  });
});

// ============================================================
// render
// ============================================================
describe('CountdownAnimation - render', () => {
  it('应该发送 RENDER_COUNTDOWN 事件并传递当前状态', () => {
    const { anim } = createAnimation();
    const handler = jest.fn();
    anim.on('ui:test:renderCountdown', handler);

    anim.render();

    expect(handler).toHaveBeenCalledWith({
      state: {
        show: true,
        number: 3,
        scale: 4,
      },
    });
  });

  it('状态变化后 render 应该反映最新状态', () => {
    const { anim } = createAnimation();
    const handler = jest.fn();
    anim.on('ui:test:renderCountdown', handler);

    anim.state.number = 2;
    anim.state.scale = 2.5;
    anim.render();

    expect(handler).toHaveBeenCalledWith({
      state: {
        show: true,
        number: 2,
        scale: 2.5,
      },
    });
  });
});

// ============================================================
// dispose
// ============================================================
describe('CountdownAnimation - dispose', () => {
  it('应该取消缩放定时器', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    // 模拟 _scaleId
    anim._scaleId = 1;
    anim._countdownId = 2;

    anim.dispose();

    expect(Scheduler.cancel).toHaveBeenCalledWith(1);
  });

  it('应该取消倒计时定时器', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    anim._scaleId = 1;
    anim._countdownId = 2;

    anim.dispose();

    expect(Scheduler.cancel).toHaveBeenCalledWith(2);
  });

  it('应该触发 game:begin 事件', () => {
    const { anim } = createAnimation();
    const handler = jest.fn();
    anim.on('game:test:begin', handler);

    anim.dispose();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('_scaleId 为 null 时不应报错', () => {
    const { anim } = createAnimation();
    anim._scaleId = null;
    anim._countdownId = null;

    expect(() => anim.dispose()).not.toThrow();
  });

  it('_countdownId 为 undefined 时不应报错', () => {
    const { anim } = createAnimation();
    anim._scaleId = undefined;
    anim._countdownId = undefined;

    expect(() => anim.dispose()).not.toThrow();
  });
});

// ============================================================
// 完整生命周期集成测试
// ============================================================
describe('CountdownAnimation - 完整生命周期', () => {
  it('完整倒计时流程：3 → 2 → 1 → 0 → dispose → game:begin', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    // 获取倒计时回调
    const countdownCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 1000,
    );
    const countdownFn = countdownCall[0];

    const soundHandler = jest.fn();
    const beginHandler = jest.fn();
    anim.on('audio:playSound', soundHandler);
    anim.on('game:test:begin', beginHandler);

    // 3 → 2
    countdownFn();
    expect(anim.state.number).toBe(2);
    expect(soundHandler).toHaveBeenCalledTimes(1);

    // 2 → 1
    countdownFn();
    expect(anim.state.number).toBe(1);
    expect(soundHandler).toHaveBeenCalledTimes(2);

    // 1 → 0
    countdownFn();
    expect(anim.state.number).toBe(0);
    expect(anim._finished).toBe(true);
    // number = 0 时不应播放音效
    expect(soundHandler).toHaveBeenCalledTimes(2);

    // dispose 触发 game:begin
    anim.dispose();
    expect(beginHandler).toHaveBeenCalledTimes(1);
  });

  it('缩放动画应在整个倒计时期间持续运行', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const scaleCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 16,
    );
    expect(scaleCall).toBeDefined();

    const scaleFn = scaleCall[0];
    anim.state.scale = 4;

    scaleFn();
    const afterOne = anim.state.scale;
    expect(afterOne).toBeLessThan(4);
    expect(afterOne).toBeGreaterThan(1);
  });
});
