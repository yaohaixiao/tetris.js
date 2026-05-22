import ClearLinesAnimation from '@/lib/services/animations/clear-lines-animation.js';

// ============================================================
// Mocks
// ============================================================

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

jest.mock('@/lib/game/actions/apply-clear-lines.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    level: 5,
    levelUp: true,
    stateHandler: { type: 'CLEAR_LINES', linesCleared: 2 },
  })),
}));

jest.mock('@/lib/events/event-catalog.js', () => ({
  AudioEvents: () => ({ PLAY_SOUND: 'audio:playSound' }),
  GameEvents: (id) => ({
    UPDATE_STATE: `game:${id}:updateState`,
    SAVE_HIGH_SCORE: `game:${id}:saveHighScore`,
    UPDATE_HUD: `game:${id}:updateHud`,
  }),
  ReplayEvents: (id) => ({
    STOP_CLEAR_LINES: `replay:${id}:stopClearLines`,
  }),
  UIEvents: (id) => ({
    RENDER_CLEAR_LINES: `ui:${id}:renderClearLines`,
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

function createAnimation(overrides = {}) {
  const Scheduler = overrides.Scheduler || createMockScheduler();
  const Game = overrides.Game || { id: 'test' };
  const lines = overrides.lines || [5, 10, 15];

  const anim = new ClearLinesAnimation({ Game, Scheduler, lines });
  return { anim, Scheduler, Game, lines };
}

// ============================================================
// 构造函数 & initialize
// ============================================================
describe('ClearLinesAnimation - 构造函数 & initialize', () => {
  it('应该设置正确的默认属性', () => {
    const { anim } = createAnimation();

    expect(anim.layer).toBe(200);
    expect(anim.blocking).toBe(true);
    expect(anim.name).toBe('clear-lines');
    expect(anim._finished).toBe(false);
  });

  it('应该根据传入的 lines 创建行数据，初始 alpha 为 1', () => {
    const { anim, lines } = createAnimation({ lines: [3, 7] });

    expect(anim.lines).toEqual([
      { y: 3, alpha: 1 },
      { y: 7, alpha: 1 },
    ]);
  });

  it('应该播放消除音效，传入 lines.length - 1', () => {
    const Scheduler = createMockScheduler();
    new ClearLinesAnimation({
      Game: { id: 'test' },
      Scheduler,
      lines: [0, 1, 2, 3],
    });

    // 通过 Scheduler 被正确调用间接证明 initialize 执行了
    expect(Scheduler.sequence).toHaveBeenCalled();
    expect(Scheduler.delay).toHaveBeenCalled();
  });

  it('应该注册闪烁序列（5 次 toggle，每次间隔 120ms）', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.sequence).toHaveBeenCalledTimes(1);

    const sequenceArg = Scheduler.sequence.mock.calls[0][0];
    expect(sequenceArg).toHaveLength(5);
    for (const item of sequenceArg) {
      expect(item.delay).toBe(120);
      expect(typeof item.fn).toBe('function');
    }
  });

  it('应该注册结束定时器（720ms 后标记 _finished）', () => {
    const Scheduler = createMockScheduler();
    createAnimation({ Scheduler });

    expect(Scheduler.delay).toHaveBeenCalledWith(
      expect.any(Function),
      720,
    );
  });

  it('应该将所有 Scheduler 任务 ID 记录到 _schedulerIds', () => {
    const Scheduler = createMockScheduler();
    Scheduler.delay
             .mockReturnValueOnce(1)
             .mockReturnValueOnce(2)
             .mockReturnValueOnce(3)
             .mockReturnValueOnce(4)
             .mockReturnValueOnce(5)
             .mockReturnValueOnce(6);

    const { anim } = createAnimation({ Scheduler });

    expect(anim._schedulerIds).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

// ============================================================
// toggle 闪烁逻辑
// ============================================================
describe('ClearLinesAnimation - toggle 闪烁', () => {
  it('toggle 应该将 alpha 从 1 切换为 0', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler, lines: [5] });

    const sequenceArg = Scheduler.sequence.mock.calls[0][0];
    const toggle = sequenceArg[0].fn;

    expect(anim.lines[0].alpha).toBe(1);

    toggle();
    expect(anim.lines[0].alpha).toBe(0);
  });

  it('toggle 应该将 alpha 从 0 切换回 1', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler, lines: [5] });

    const sequenceArg = Scheduler.sequence.mock.calls[0][0];
    const toggle = sequenceArg[0].fn;

    toggle();
    expect(anim.lines[0].alpha).toBe(0);

    toggle();
    expect(anim.lines[0].alpha).toBe(1);
  });

  it('toggle 应该同时切换所有行', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler, lines: [0, 1, 2] });

    const sequenceArg = Scheduler.sequence.mock.calls[0][0];
    const toggle = sequenceArg[0].fn;

    toggle();
    expect(anim.lines).toEqual([
      { y: 0, alpha: 0 },
      { y: 1, alpha: 0 },
      { y: 2, alpha: 0 },
    ]);
  });

  it('5 次 toggle 后最终 alpha 应为 0', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler, lines: [5] });

    const sequenceArg = Scheduler.sequence.mock.calls[0][0];

    sequenceArg[0].fn();
    sequenceArg[1].fn();
    sequenceArg[2].fn();
    sequenceArg[3].fn();
    sequenceArg[4].fn();

    expect(anim.lines[0].alpha).toBe(0);
  });
});

// ============================================================
// 结束定时器
// ============================================================
describe('ClearLinesAnimation - 结束定时器', () => {
  it('720ms 后应该设置 _finished 为 true', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler });

    const endFn = Scheduler.delay.mock.calls[5][0];

    expect(anim._finished).toBe(false);

    endFn();
    expect(anim._finished).toBe(true);
  });
});

// ============================================================
// render
// ============================================================
describe('ClearLinesAnimation - render', () => {
  it('应该发送 RENDER_CLEAR_LINES 事件并传递行数据', () => {
    const { anim } = createAnimation({ lines: [2, 4] });
    const handler = jest.fn();
    anim.on('ui:test:renderClearLines', handler);

    anim.render();

    expect(handler).toHaveBeenCalledWith({
      state: {
        lines: [
          { y: 2, alpha: 1 },
          { y: 4, alpha: 1 },
        ],
      },
    });
  });

  it('alpha 变化后 render 应该反映最新状态', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler, lines: [3] });

    const sequenceArg = Scheduler.sequence.mock.calls[0][0];
    sequenceArg[0].fn();

    const handler = jest.fn();
    anim.on('ui:test:renderClearLines', handler);

    anim.render();

    expect(handler).toHaveBeenCalledWith({
      state: {
        lines: [{ y: 3, alpha: 0 }],
      },
    });
  });
});

// ============================================================
// dispose
// ============================================================
describe('ClearLinesAnimation - dispose', () => {
  it('应该取消所有 Scheduler 任务', () => {
    const Scheduler = createMockScheduler();
    Scheduler.delay
             .mockReturnValueOnce(1)
             .mockReturnValueOnce(2)
             .mockReturnValueOnce(3)
             .mockReturnValueOnce(4)
             .mockReturnValueOnce(5)
             .mockReturnValueOnce(6);

    const { anim } = createAnimation({ Scheduler });

    anim.dispose();

    expect(Scheduler.cancel).toHaveBeenCalledTimes(6);
    expect(Scheduler.cancel).toHaveBeenCalledWith(1);
    expect(Scheduler.cancel).toHaveBeenCalledWith(6);
  });

  it('应该调用 applyClearLines 并传入 Game', () => {
    const { default: applyClearLines } = require('@/lib/game/actions/apply-clear-lines.js');
    const Game = { id: 'test' };
    const { anim } = createAnimation({ Game });

    applyClearLines.mockClear();
    anim.dispose();

    expect(applyClearLines).toHaveBeenCalledWith(Game);
  });

  it('应该触发 STOP_CLEAR_LINES 事件', () => {
    const { anim } = createAnimation();
    const handler = jest.fn();
    anim.on('replay:test:stopClearLines', handler);

    anim.dispose();

    const Scheduler = anim.Scheduler;
    const sequenceCalls = Scheduler.sequence.mock.calls;
    const disposeSequenceCall = sequenceCalls[sequenceCalls.length - 1];
    const stopClearLinesFn = disposeSequenceCall[0][0].fn;

    stopClearLinesFn();

    expect(handler).toHaveBeenCalledWith({
      isLevelUp: true,
      level: 5,
    });
  });

  it('应该触发 UPDATE_STATE 事件', () => {
    const { anim } = createAnimation();
    const handler = jest.fn();
    anim.on('game:test:updateState', handler);

    anim.dispose();

    const Scheduler = anim.Scheduler;
    const sequenceCalls = Scheduler.sequence.mock.calls;
    const disposeSequenceCall = sequenceCalls[sequenceCalls.length - 1];
    const updateStateFn = disposeSequenceCall[0][1].fn;

    updateStateFn();

    expect(handler).toHaveBeenCalledWith({
      stateHandler: { type: 'CLEAR_LINES', linesCleared: 2 },
    });
  });

  it('应该触发 SAVE_HIGH_SCORE 事件', () => {
    const { anim } = createAnimation();
    const handler = jest.fn();
    anim.on('game:test:saveHighScore', handler);

    anim.dispose();

    const Scheduler = anim.Scheduler;
    const sequenceCalls = Scheduler.sequence.mock.calls;
    const disposeSequenceCall = sequenceCalls[sequenceCalls.length - 1];
    const saveHighScoreFn = disposeSequenceCall[0][2].fn;

    saveHighScoreFn();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('应该触发 UPDATE_HUD 事件', () => {
    const { anim } = createAnimation();
    const handler = jest.fn();
    anim.on('game:test:updateHud', handler);

    anim.dispose();

    const Scheduler = anim.Scheduler;
    const sequenceCalls = Scheduler.sequence.mock.calls;
    const disposeSequenceCall = sequenceCalls[sequenceCalls.length - 1];
    const updateHudFn = disposeSequenceCall[0][3].fn;

    updateHudFn();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('dispose 中的 sequence 应该包含 4 个任务', () => {
    const { anim } = createAnimation();

    anim.dispose();

    const Scheduler = anim.Scheduler;
    const sequenceCalls = Scheduler.sequence.mock.calls;
    const disposeSequenceArg = sequenceCalls[sequenceCalls.length - 1][0];

    expect(disposeSequenceArg).toHaveLength(4);
  });
});

// ============================================================
// 完整生命周期集成测试
// ============================================================
describe('ClearLinesAnimation - 完整生命周期', () => {
  it('initialize → 闪烁 → 结束 → dispose → 收尾事件', () => {
    const Scheduler = createMockScheduler();
    const { anim } = createAnimation({ Scheduler, lines: [5] });

    // 1. 初始状态
    expect(anim._finished).toBe(false);
    expect(anim.lines[0].alpha).toBe(1);

    // 2. 模拟 5 次闪烁
    const sequenceArg = Scheduler.sequence.mock.calls[0][0];
    sequenceArg[0].fn();
    expect(anim.lines[0].alpha).toBe(0);
    sequenceArg[1].fn();
    expect(anim.lines[0].alpha).toBe(1);
    sequenceArg[2].fn();
    expect(anim.lines[0].alpha).toBe(0);
    sequenceArg[3].fn();
    expect(anim.lines[0].alpha).toBe(1);
    sequenceArg[4].fn();
    expect(anim.lines[0].alpha).toBe(0);

    // 3. 720ms 结束
    const endFn = Scheduler.delay.mock.calls[5][0];
    endFn();
    expect(anim._finished).toBe(true);

    // 4. dispose 调用 applyClearLines
    const { default: applyClearLines } = require('@/lib/game/actions/apply-clear-lines.js');
    applyClearLines.mockClear();
    anim.dispose();
    expect(applyClearLines).toHaveBeenCalledTimes(1);

    // 5. 所有 Scheduler 任务被取消
    expect(Scheduler.cancel).toHaveBeenCalledTimes(6);
  });
});
