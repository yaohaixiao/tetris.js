import ClearLinesAnimation from '@/lib/services/animations/clear-lines-animation';

jest.mock('@/lib/game/actions/apply-clear-lines', () =>
    jest.fn(() => ({
    level: 5,
    levelUp: true,
    stateHandler: jest.fn(),
  })),
);

describe('ClearLinesAnimation', () => {
  let mockGame;
  let lines;
  let mockScheduler

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = {
      id: 'test-uuid-002',
    };

    lines = [18, 17];

    mockScheduler = {
      sequence: jest.fn(),
      interval: jest.fn(),
      cancel: jest.fn(),
      delay: jest.fn(),
    };
  });

  // ==================== 初始化 ====================

  describe('初始化', () => {
    test('layer 为 200', () => {
      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });
      expect(anim.layer).toBe(200);
    });

    test('blocking 为 true', () => {
      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });
      expect(anim.blocking).toBe(true);
    });

    test('name 为 clear-lines', () => {
      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });
      expect(anim.name).toBe('clear-lines');
    });

    test('lines 根据传入的 y 数组初始化', () => {
      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      expect(anim.lines).toHaveLength(2);
      expect(anim.lines[0]).toEqual({ y: 18, alpha: 1, timer: 0 });
      expect(anim.lines[1]).toEqual({ y: 17, alpha: 1, timer: 0 });
    });

    test('构造时发射 CLEAR 音效，lines.length - 1', () => {
      const spyEmit = jest.spyOn(ClearLinesAnimation.prototype, 'emit');

      const anim = new ClearLinesAnimation({
        Game: mockGame,
        lines: [5, 10, 15], Scheduler:mockScheduler
      });

      expect(spyEmit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'CLEAR',
        lines: 2,
      });

      spyEmit.mockRestore();
    });
  });

  // ==================== update ====================

  describe('update', () => {
    test('偶数 phase 时 alpha=1，奇数 phase 时 alpha=0', () => {
      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      // 第一次 update：timer=0, phase=0, alpha=1, timer→0.06
      anim.update(0.06);
      expect(anim.lines[0].alpha).toBe(1);
      expect(anim.lines[0].timer).toBe(0.06);

      // 第二次 update：timer=0.06, phase=0(floor(0.06/0.12)=0), alpha=1, timer→0.12
      anim.update(0.06);
      expect(anim.lines[0].alpha).toBe(1);
      expect(anim.lines[0].timer).toBe(0.12);

      // 第三次 update：timer=0.12, phase=1, alpha=0, timer→0.18
      anim.update(0.06);
      expect(anim.lines[0].alpha).toBe(0);
      expect(anim.lines[0].timer).toBe(0.18);

      // 第四次 update：timer=0.18, phase=1, alpha=0, timer→0.24
      anim.update(0.06);
      expect(anim.lines[0].alpha).toBe(0);
      expect(anim.lines[0].timer).toBe(0.24);

      // 第五次 update：timer=0.24, phase=2, alpha=1, timer→0.30
      anim.update(0.06);
      expect(anim.lines[0].alpha).toBe(1);
    });

    test('所有行 timer < 0.72 时返回 true', () => {
      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      expect(anim.update(0.5)).toBe(true);
    });

    test('所有行 timer >= 0.72 时返回 false 并调用 stop', () => {
      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      anim.lines.forEach((line) => {
        line.timer = 0.72;
      });

      const spyStop = jest.spyOn(anim, 'stop');

      expect(anim.update(0.01)).toBe(false);
      expect(spyStop).toHaveBeenCalled();
    });

    test('部分行未完成时返回 true', () => {
      const anim = new ClearLinesAnimation({
        Game: mockGame,
        lines: [5, 10], Scheduler:mockScheduler
      });

      anim.lines[0].timer = 0.72;
      anim.lines[1].timer = 0.5;

      expect(anim.update(0.01)).toBe(true);
    });
  });

  // ==================== stop ====================

  describe('stop', () => {
    test('调用 mockScheduler.sequence', () => {
      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      anim.stop();

      expect(mockScheduler.sequence).toHaveBeenCalled();
    });

    test('sequence 包含 4 个任务', () => {
      const Engine = require('@/lib/engine').default;

      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      anim.stop();

      const queue = mockScheduler.sequence.mock.calls[0][0];

      expect(queue).toHaveLength(4);
      queue.forEach((item) => {
        expect(item).toHaveProperty('fn');
        expect(typeof item.fn).toBe('function');
      });
    });

    test('第一个任务发射 replay:stop:clear:lines', () => {
      const Engine = require('@/lib/engine').default;
      const spyEmit = jest.spyOn(ClearLinesAnimation.prototype, 'emit');

      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      anim.stop();

      const queue = mockScheduler.sequence.mock.calls[0][0];
      queue[0].fn();

      expect(spyEmit).toHaveBeenCalledWith(
        'replay:test-uuid-002:stop:clear:lines',
        { isLevelUp: true, level: 5 },
      );

      spyEmit.mockRestore();
    });

    test('第二个任务发射 game:update:state', () => {
      const Engine = require('@/lib/engine').default;
      const spyEmit = jest.spyOn(ClearLinesAnimation.prototype, 'emit');

      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      anim.stop();

      const queue = mockScheduler.sequence.mock.calls[0][0];
      queue[1].fn();

      expect(spyEmit).toHaveBeenCalledWith(
        'game:test-uuid-002:update:state',
        expect.objectContaining({ stateHandler: expect.any(Function) }),
      );

      spyEmit.mockRestore();
    });

    test('第三个任务发射 game:save:high:score', () => {
      const Engine = require('@/lib/engine').default;
      const spyEmit = jest.spyOn(ClearLinesAnimation.prototype, 'emit');

      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      anim.stop();

      const queue = mockScheduler.sequence.mock.calls[0][0];
      queue[2].fn();

      expect(spyEmit).toHaveBeenCalledWith(
        'game:test-uuid-002:save:high:score',
      );

      spyEmit.mockRestore();
    });

    test('第四个任务发射 game:update:hud', () => {
      const Engine = require('@/lib/engine').default;
      const spyEmit = jest.spyOn(ClearLinesAnimation.prototype, 'emit');

      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });

      anim.stop();

      const queue = mockScheduler.sequence.mock.calls[0][0];
      queue[3].fn();

      expect(spyEmit).toHaveBeenCalledWith('game:test-uuid-002:update:hud');

      spyEmit.mockRestore();
    });
  });

  // ==================== render ====================

  describe('render', () => {
    test('发射 render:clear 事件', () => {
      const anim = new ClearLinesAnimation({ Game: mockGame, lines, Scheduler:mockScheduler });
      const spyEmit = jest.spyOn(anim, 'emit');

      anim.render();

      expect(spyEmit).toHaveBeenCalledWith('ui:test-uuid-002:render:clear:lines', {
        state: { lines: anim.lines },
      });
    });
  });
});
