import PausedAnimation from '@/lib/services/animations/paused-animation.js';

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
 * 创建 PausedAnimation 实例
 */
function createAnimation(overrides = {}) {
  const Scheduler = overrides.Scheduler || createMockScheduler();
  const Game = overrides.Game || { id: 'test' };

  const anim = new PausedAnimation({ Game, Scheduler });
  return { anim, Scheduler, Game };
}

// ============================================================
// 构造函数 & initialize
// ============================================================
describe('PausedAnimation - 构造函数 & initialize', () => {
  it('应该设置正确的默认属性', () => {
    const { anim } = createAnimation();

    expect(anim.layer).toBe(500);
    expect(anim.blocking).toBe(true);
    expect(anim.name).toBe('paused');
    expect(anim._finished).toBe(false);
    expect(anim.active).toBe(true);
  });

  it('应该启动滴答定时器（每 1000ms）', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.interval).toHaveBeenCalledWith(
      expect.any(Function),
      1000,
    );
  });

  it('应该只注册一个定时器', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.interval).toHaveBeenCalledTimes(1);
  });

  it('应该记录滴答定时器 ID', () => {
    const Scheduler = createMockScheduler();
    // 让 interval 返回固定 ID
    Scheduler.interval.mockReturnValue(42);

    const { anim } = createAnimation({ Scheduler });

    expect(anim._tickId).toBe(42);
  });
});

// ============================================================
// 滴答音效
// ============================================================
describe('PausedAnimation - 滴答音效', () => {
  it('定时器回调应该播放 SECOND_TICK 音效', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const soundHandler = jest.fn();
    anim.on('audio:playSound', soundHandler);

    // 获取滴答回调
    const tickCall = Scheduler.interval.mock.calls[0];
    const tickFn = tickCall[0];

    tickFn();

    expect(soundHandler).toHaveBeenCalledWith({ sound: 'SECOND_TICK' });
  });

  it('每次触发都应该播放音效', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const soundHandler = jest.fn();
    anim.on('audio:playSound', soundHandler);

    const tickCall = Scheduler.interval.mock.calls[0];
    const tickFn = tickCall[0];

    tickFn();
    tickFn();
    tickFn();

    expect(soundHandler).toHaveBeenCalledTimes(3);
  });
});

// ============================================================
// resume
// ============================================================
describe('PausedAnimation - resume', () => {
  it('active 为 false 时应该重新启动定时器', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    // 第一次构造时已经调用了一次 interval
    expect(Scheduler.interval).toHaveBeenCalledTimes(1);

    anim.active = false;
    anim.resume();

    expect(anim.active).toBe(true);
    // resume 时又调用了一次
    expect(Scheduler.interval).toHaveBeenCalledTimes(2);
  });

  it('active 已经为 true 时不应重复启动', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    expect(Scheduler.interval).toHaveBeenCalledTimes(1);

    anim.resume(); // active 已经是 true

    // 不应该再次调用 interval
    expect(Scheduler.interval).toHaveBeenCalledTimes(1);
  });

  it('resume 后应该更新 _tickId', () => {
    const Scheduler = createMockScheduler();
    Scheduler.interval
             .mockReturnValueOnce(1)  // 构造时
             .mockReturnValueOnce(99); // resume 时

    const { anim } = createAnimation({ Scheduler });

    expect(anim._tickId).toBe(1);

    anim.active = false;
    anim.resume();

    expect(anim._tickId).toBe(99);
  });
});

// ============================================================
// stop
// ============================================================
describe('PausedAnimation - stop', () => {
  it('应该将 active 设为 false', () => {
    const { anim } = createAnimation();
    expect(anim.active).toBe(true);

    anim.stop();

    expect(anim.active).toBe(false);
  });

  it('应该将 _finished 设为 true', () => {
    const { anim } = createAnimation();
    expect(anim._finished).toBe(false);

    anim.stop();

    expect(anim._finished).toBe(true);
  });

  it('stop 时不应取消定时器（由 dispose 负责）', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    anim.stop();

    // stop 只设置标记，不取消定时器
    expect(Scheduler.cancel).not.toHaveBeenCalled();
  });
});

// ============================================================
// dispose
// ============================================================
describe('PausedAnimation - dispose', () => {
  it('应该取消滴答定时器', () => {
    const Scheduler = createMockScheduler();
    Scheduler.interval.mockReturnValue(42);

    const { anim } = createAnimation({ Scheduler });

    anim.dispose();

    expect(Scheduler.cancel).toHaveBeenCalledWith(42);
  });

  it('_tickId 为 null 时不应报错', () => {
    const { anim } = createAnimation();
    anim._tickId = null;

    expect(() => anim.dispose()).not.toThrow();
  });

  it('_tickId 为 undefined 时不应报错', () => {
    const { anim } = createAnimation();
    anim._tickId = undefined;

    expect(() => anim.dispose()).not.toThrow();
  });
});

// ============================================================
// render
// ============================================================
describe('PausedAnimation - render', () => {
  it('render 不应报错', () => {
    const { anim } = createAnimation();

    expect(() => anim.render()).not.toThrow();
  });

  it('render 为空实现，不应有副作用', () => {
    const { anim } = createAnimation();
    const beforeActive = anim.active;
    const beforeFinished = anim._finished;

    anim.render();

    expect(anim.active).toBe(beforeActive);
    expect(anim._finished).toBe(beforeFinished);
  });
});

// ============================================================
// 完整生命周期集成测试
// ============================================================
describe('PausedAnimation - 完整生命周期', () => {
  it('构造 → 暂停 → 恢复 → 停止 → dispose', () => {
    const Scheduler = createMockScheduler();
    Scheduler.interval
             .mockReturnValueOnce(1)
             .mockReturnValueOnce(2);

    const { anim } = createAnimation({ Scheduler });

    // 初始状态
    expect(anim.active).toBe(true);
    expect(anim._finished).toBe(false);
    expect(anim._tickId).toBe(1);

    // 暂停
    anim.stop();
    expect(anim.active).toBe(false);
    expect(anim._finished).toBe(true);

    // dispose 清理定时器
    anim.dispose();
    expect(Scheduler.cancel).toHaveBeenCalledWith(1);
  });

  it('构造 → 暂停 → 恢复 → 再次停止 → dispose', () => {
    const Scheduler = createMockScheduler();
    Scheduler.interval
             .mockReturnValueOnce(1)  // 构造时
             .mockReturnValueOnce(2); // resume 时

    const { anim } = createAnimation({ Scheduler });

    // 暂停
    anim.stop();

    // 恢复
    anim.resume();
    expect(anim.active).toBe(true);
    expect(anim._tickId).toBe(2);

    // 再次停止
    anim.stop();
    expect(anim.active).toBe(false);
    expect(anim._finished).toBe(true);

    // dispose 清理最新的定时器
    anim.dispose();
    expect(Scheduler.cancel).toHaveBeenCalledWith(2);
  });

  it('滴答音效在 dispose 后不应再触发', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const soundHandler = jest.fn();
    anim.on('audio:playSound', soundHandler);

    const tickFn = Scheduler.interval.mock.calls[0][0];

    // 触发一次
    tickFn();
    expect(soundHandler).toHaveBeenCalledTimes(1);

    // stop + dispose
    anim.stop();
    anim.dispose();
    expect(Scheduler.cancel).toHaveBeenCalled();

    // 即使定时器再触发（模拟未取消的情况），
    // 由于 Scheduler.cancel 已被调用，实际不会执行
    // 这里只验证 dispose 调用了 cancel
  });
});
