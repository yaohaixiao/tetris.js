import LevelUpAnimation from '@/lib/services/animations/level-up-animation.js';

// ============================================================
// Mocks
// ============================================================

// Mock Base
jest.mock('@/lib/core', () => {
  function MockBase(options) {
    this.Game = options?.Game;
    this.Scheduler = options?.Scheduler;
    this.UI = options?.UI;
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

// Mock COLORS
jest.mock('@/lib/constants/colors.js', () => ({
  TEAL: '#00FFFF',
  YELLOW: '#FFFF00',
  PURPLE: '#800080',
  ORANGE: '#FFA500',
  GREEN: '#00FF00',
  RED: '#FF0000',
  PINK: '#FFC0CB',
}));

// Mock event-catalog
jest.mock('@/lib/events/event-catalog.js', () => ({
  AudioEvents: () => ({
    PLAY_SOUND: 'audio:playSound',
    RESUME_BGM: 'audio:resumeBgm',
  }),
  UIEvents: (id) => ({
    RENDER_LEVEL_UP: `ui:${id}:renderLevelUp`,
  }),
}));

// ============================================================
// 辅助函数
// ============================================================

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

function createMockUI() {
  return {
    Renderer: {
      Canvas: {
        gameBoard: {
          width: 800,
          height: 600,
        },
      },
    },
  };
}

function createAnimation(overrides = {}) {
  const Scheduler = overrides.Scheduler || createMockScheduler();
  const Game = overrides.Game || { id: 'test' };
  const UI = overrides.UI || createMockUI();
  const level = overrides.level ?? 5;

  const anim = new LevelUpAnimation({ Game, Scheduler, UI, level });
  return { anim, Scheduler, Game, UI, level };
}

// ============================================================
// 构造函数 & initialize
// ============================================================
describe('LevelUpAnimation - 构造函数 & initialize', () => {
  it('应该设置正确的默认属性', () => {
    const { anim } = createAnimation();

    expect(anim.layer).toBe(100);
    expect(anim.blocking).toBe(true);
    expect(anim.name).toBe('level-up');
    expect(anim._finished).toBe(false);
    expect(anim.level).toBe(5);
  });

  it('应该创建初始烟花粒子', () => {
    const { anim } = createAnimation();

    expect(anim.fireworks).toBeDefined();
    expect(Array.isArray(anim.fireworks)).toBe(true);
    expect(anim.fireworks.length).toBe(40);
  });

  it('应该注册烟花生成定时器（每 600ms）', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.interval).toHaveBeenCalledWith(expect.any(Function), 600);
  });

  it('应该注册粒子物理更新定时器（每 16ms）', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.interval).toHaveBeenCalledWith(expect.any(Function), 16);
  });

  it('应该注册动画结束定时器（3000ms 后）', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.delay).toHaveBeenCalledWith(expect.any(Function), 3000);
  });

  it('应该注册三个 Scheduler 任务', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    // 两次 interval + 一次 delay
    expect(Scheduler.interval).toHaveBeenCalledTimes(2);
    expect(Scheduler.delay).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// createFireworks
// ============================================================
describe('LevelUpAnimation - createFireworks', () => {
  it('应该生成 40 个粒子', () => {
    const { anim } = createAnimation();
    const particles = anim.createFireworks();

    expect(particles).toHaveLength(40);
  });

  it('每个粒子应该包含必要的属性', () => {
    const { anim } = createAnimation();
    const particles = anim.createFireworks();

    for (const p of particles) {
      expect(p).toHaveProperty('x');
      expect(p).toHaveProperty('y');
      expect(p).toHaveProperty('vx');
      expect(p).toHaveProperty('vy');
      expect(p).toHaveProperty('radius');
      expect(p).toHaveProperty('color');
      expect(p).toHaveProperty('alpha');
    }
  });

  it('粒子初始位置应该在画布中心上方', () => {
    const { anim, UI } = createAnimation();
    const particles = anim.createFireworks();
    const { width, height } = UI.Renderer.Canvas.gameBoard;

    for (const p of particles) {
      expect(p.x).toBe(width / 2);
      expect(p.y).toBe(height / 2 - 60);
    }
  });

  it('粒子初始 alpha 应该为 1（完全不透明）', () => {
    const { anim } = createAnimation();
    const particles = anim.createFireworks();

    for (const p of particles) {
      expect(p.alpha).toBe(1);
    }
  });

  it('粒子半径应该在 3 到 7 之间', () => {
    const { anim } = createAnimation();
    const particles = anim.createFireworks();

    for (const p of particles) {
      expect(p.radius).toBeGreaterThanOrEqual(3);
      expect(p.radius).toBeLessThanOrEqual(7);
    }
  });

  it('粒子颜色应该来自预定义的颜色列表', () => {
    const { anim } = createAnimation();
    const particles = anim.createFireworks();
    const validColors = [
      '#00FFFF',
      '#FFFF00',
      '#800080',
      '#FFA500',
      '#00FF00',
      '#FF0000',
      '#FFC0CB',
    ];

    for (const p of particles) {
      expect(validColors).toContain(p.color);
    }
  });

  it('每次调用应该生成不同的粒子（随机性）', () => {
    const { anim } = createAnimation();
    const particles1 = anim.createFireworks();
    const particles2 = anim.createFireworks();

    // 由于随机性，两次生成的粒子不会完全相同
    const allSame = particles1.every(
      (p, i) => p.vx === particles2[i].vx && p.vy === particles2[i].vy,
    );
    expect(allSame).toBe(false);
  });
});

// ============================================================
// 烟花生成定时器
// ============================================================
describe('LevelUpAnimation - 烟花生成定时器', () => {
  it('每次触发应该新增 40 个粒子', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const initialCount = anim.fireworks.length;
    expect(initialCount).toBe(40);

    // 获取烟花生成回调
    const spawnCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 600,
    );
    const spawnFn = spawnCall[0];

    spawnFn();

    expect(anim.fireworks.length).toBe(80); // 40 + 40
  });

  it('多次触发应该累加粒子', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const spawnCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 600,
    );
    const spawnFn = spawnCall[0];

    spawnFn();
    spawnFn();
    spawnFn();

    expect(anim.fireworks.length).toBe(160); // 40 + 40*3
  });
});

// ============================================================
// updateFireworks
// ============================================================
describe('LevelUpAnimation - updateFireworks', () => {
  it('应该更新所有粒子的物理状态', () => {
    const { anim } = createAnimation();

    const before = anim.fireworks[0].x;
    anim.updateFireworks(0.016);
    const after = anim.fireworks[0].x;

    // 粒子位置应该发生变化
    expect(after).not.toBe(before);
  });

  it('透明度应该逐渐降低', () => {
    const { anim } = createAnimation();

    expect(anim.fireworks[0].alpha).toBe(1);

    anim.updateFireworks(0.016);

    expect(anim.fireworks[0].alpha).toBeLessThan(1);
  });

  it('半径应该逐渐增大', () => {
    const { anim } = createAnimation();

    const before = anim.fireworks[0].radius;
    anim.updateFireworks(0.016);
    const after = anim.fireworks[0].radius;

    expect(after).toBeGreaterThan(before);
  });

  it('应该过滤掉透明度 <= 0 的粒子', () => {
    const { anim } = createAnimation();

    // 将所有粒子透明度设为接近 0
    for (const p of anim.fireworks) {
      p.alpha = 0.0001;
    }

    const initialCount = anim.fireworks.length;
    anim.updateFireworks(0.016);

    // 透明度降至 0 以下的粒子应该被移除
    expect(anim.fireworks.length).toBeLessThan(initialCount);
  });

  it('固定步长 delta = 0.016 时的衰减计算', () => {
    const { anim } = createAnimation();
    const p = anim.fireworks[0];

    // 手动计算预期值
    const expectedVx = p.vx * 0.98;
    const expectedVy = p.vy * 0.98 + 0.01 * 0.016;
    const expectedX = p.x + expectedVx * 0.016 * 0.008;
    const expectedY = p.y + expectedVy * 0.016 * 0.008;
    const expectedAlpha = p.alpha - 0.016 * 0.024;
    const expectedRadius = p.radius + 0.016 * 10;

    anim.updateFireworks(0.016);

    expect(p.vx).toBeCloseTo(expectedVx, 10);
    expect(p.vy).toBeCloseTo(expectedVy, 10);
    expect(p.x).toBeCloseTo(expectedX, 10);
    expect(p.y).toBeCloseTo(expectedY, 10);
    expect(p.alpha).toBeCloseTo(expectedAlpha, 10);
    expect(p.radius).toBeCloseTo(expectedRadius, 10);
  });
});

// ============================================================
// 粒子物理更新定时器
// ============================================================
describe('LevelUpAnimation - 粒子物理更新定时器', () => {
  it('应该以 delta = 0.016 调用 updateFireworks', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    // 获取物理更新回调
    const updateCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 16,
    );
    const updateFn = updateCall[0];

    const before = anim.fireworks[0].x;
    updateFn();
    const after = anim.fireworks[0].x;

    expect(after).not.toBe(before);
  });
});

// ============================================================
// 结束定时器
// ============================================================
describe('LevelUpAnimation - 结束定时器', () => {
  it('3000ms 后应该设置 _finished 为 true', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const endFn = Scheduler.delay.mock.calls[0][0];

    expect(anim._finished).toBe(false);

    endFn();
    expect(anim._finished).toBe(true);
  });
});

// ============================================================
// render
// ============================================================
describe('LevelUpAnimation - render', () => {
  it('应该发送 RENDER_LEVEL_UP 事件并传递等级和粒子数据', () => {
    const { anim } = createAnimation();
    const handler = jest.fn();
    anim.on('ui:test:renderLevelUp', handler);

    anim.render();

    expect(handler).toHaveBeenCalledWith({
      level: 5,
      fireworks: anim.fireworks,
    });
  });

  it('粒子变化后 render 应该反映最新状态', () => {
    const { anim } = createAnimation();

    anim.updateFireworks(0.016);

    const handler = jest.fn();
    anim.on('ui:test:renderLevelUp', handler);

    anim.render();

    const callArg = handler.mock.calls[0][0];
    expect(callArg.level).toBe(5);
    expect(callArg.fireworks).toBe(anim.fireworks);
  });
});

// ============================================================
// dispose
// ============================================================
describe('LevelUpAnimation - dispose', () => {
  it('应该取消烟花生成定时器', () => {
    const Scheduler = createMockScheduler();
    Scheduler.interval.mockReturnValueOnce(1).mockReturnValueOnce(2);
    Scheduler.delay.mockReturnValue(3);

    const { anim } = createAnimation({ Scheduler });

    expect(anim._spawnId).toBe(1);

    anim.dispose();

    expect(Scheduler.cancel).toHaveBeenCalledWith(1);
  });

  it('应该取消粒子物理更新定时器', () => {
    const Scheduler = createMockScheduler();
    Scheduler.interval.mockReturnValueOnce(1).mockReturnValueOnce(2);
    Scheduler.delay.mockReturnValue(3);

    const { anim } = createAnimation({ Scheduler });

    expect(anim._updateId).toBe(2);

    anim.dispose();

    expect(Scheduler.cancel).toHaveBeenCalledWith(2);
  });

  it('应该取消动画结束定时器', () => {
    const Scheduler = createMockScheduler();
    Scheduler.interval.mockReturnValueOnce(1).mockReturnValueOnce(2);
    Scheduler.delay.mockReturnValue(3);

    const { anim } = createAnimation({ Scheduler });

    expect(anim._endId).toBe(3);

    anim.dispose();

    expect(Scheduler.cancel).toHaveBeenCalledWith(3);
  });

  it('应该取消全部三个定时器', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    anim.dispose();

    expect(Scheduler.cancel).toHaveBeenCalledTimes(3);
  });

  it('应该触发 RESUME_BGM 事件', () => {
    const { anim } = createAnimation({ level: 8 });
    const handler = jest.fn();
    anim.on('audio:resumeBgm', handler);

    anim.dispose();

    expect(handler).toHaveBeenCalledWith({ level: 8 });
  });

  it('定时器 ID 为 null 时不应报错', () => {
    const { anim } = createAnimation();

    anim._spawnId = null;
    anim._updateId = null;
    anim._endId = null;

    expect(() => anim.dispose()).not.toThrow();
  });

  it('定时器 ID 为 undefined 时不应报错', () => {
    const { anim } = createAnimation();

    anim._spawnId = undefined;
    anim._updateId = undefined;
    anim._endId = undefined;

    expect(() => anim.dispose()).not.toThrow();
  });
});

// ============================================================
// 完整生命周期集成测试
// ============================================================
describe('LevelUpAnimation - 完整生命周期', () => {
  it('initialize → 生成烟花 → 更新物理 → 结束 → dispose → 恢复音乐', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler, level: 3 });

    // 1. 初始状态
    expect(anim._finished).toBe(false);
    expect(anim.fireworks.length).toBe(40);
    expect(anim.level).toBe(3);

    // 2. 模拟烟花生成
    const spawnCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 600,
    );
    spawnCall[0]();
    expect(anim.fireworks.length).toBe(80);

    // 3. 模拟粒子物理更新
    const updateCall = Scheduler.interval.mock.calls.find(
      (call) => call[1] === 16,
    );
    const beforeAlpha = anim.fireworks[0].alpha;
    updateCall[0]();
    expect(anim.fireworks[0].alpha).toBeLessThan(beforeAlpha);

    // 4. 模拟 3 秒结束
    const endFn = Scheduler.delay.mock.calls[0][0];
    endFn();
    expect(anim._finished).toBe(true);

    // 5. dispose 清理
    const bgmHandler = jest.fn();
    anim.on('audio:resumeBgm', bgmHandler);
    anim.dispose();

    expect(Scheduler.cancel).toHaveBeenCalledTimes(3);
    expect(bgmHandler).toHaveBeenCalledWith({ level: 3 });
  });
});
