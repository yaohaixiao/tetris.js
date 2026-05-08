// tests/clear-lines-animation.test.js
import ClearLinesAnimation from '@/lib/services/animations/clear-lines-animation';
import EventBus from '@/lib/core/event-bus';
import applyClearLines from '../../../lib/game/actions/apply-clear-lines.js';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('../../../lib/game/actions/apply-clear-lines.js', () => jest.fn());

describe('ClearLinesAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    applyClearLines.mockReturnValue({
      level: 2,
      levelUp: true,
      stateHandler: jest.fn(),
    });
  });

  // ========== 构造函数 ==========
  describe('constructor', () => {
    test('正确初始化 lines 数据', () => {
      const anim = new ClearLinesAnimation([3, 5, 7]);

      expect(anim.lines).toHaveLength(3);
      expect(anim.lines[0]).toEqual({ y: 3, alpha: 1, timer: 0 });
      expect(anim.lines[1]).toEqual({ y: 5, alpha: 1, timer: 0 });
      expect(anim.lines[2]).toEqual({ y: 7, alpha: 1, timer: 0 });
    });

    test('空数组也可以', () => {
      const anim = new ClearLinesAnimation([]);
      expect(anim.lines).toEqual([]);
    });

    test('发射消除音效事件', () => {
      new ClearLinesAnimation([0]);
      expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:clear', {
        lines: 0,
      });
    });

    test('多行消除时发送正确的数量', () => {
      new ClearLinesAnimation([1, 2, 3, 4]);
      expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:clear', {
        lines: 3,
      });
    });

    test('设置默认属性', () => {
      const anim = new ClearLinesAnimation([0]);

      expect(anim.layer).toBe(200);
      expect(anim.blocking).toBe(true);
      expect(anim.name).toBe('clear-lines');
    });
  });

  // ========== update ==========
  describe('update', () => {
    test('动画未完成时返回 true', () => {
      const anim = new ClearLinesAnimation([0]);
      const result = anim.update(0.016);
      expect(result).toBe(true);
    });

    test('前 0.12 秒 alpha = 1（偶数 phase）', () => {
      const anim = new ClearLinesAnimation([0]);

      // timer: 0 → 0.06, phase 用 0 算 = 0, alpha = 1
      anim.update(0.06);
      expect(anim.lines[0].alpha).toBe(1);

      // timer: 0.06 → 0.12, phase 用 0.06 算 = 0, alpha = 1
      anim.update(0.06);
      expect(anim.lines[0].alpha).toBe(1);
    });

    test('0.12 ~ 0.24 秒 alpha = 0（奇数 phase）', () => {
      const anim = new ClearLinesAnimation([0]);

      // timer: 0 → 0.06, phase = 0, alpha = 1
      anim.update(0.06);
      // timer: 0.06 → 0.12, phase = 0, alpha = 1
      anim.update(0.06);
      // timer: 0.12 → 0.18, phase = 1, alpha = 0
      anim.update(0.06);

      expect(anim.lines[0].alpha).toBe(0);
    });

    test('timer 累加', () => {
      const anim = new ClearLinesAnimation([0]);
      anim.update(0.1);
      expect(anim.lines[0].timer).toBeCloseTo(0.1);
      anim.update(0.1);
      expect(anim.lines[0].timer).toBeCloseTo(0.2);
    });

    test('动画完成时返回 false', () => {
      const anim = new ClearLinesAnimation([0]);
      // 直接用 0.72，timer 从 0 开始，phase 用 0 算 = 0，更新后 timer = 0.72
      // 然后 done 判断 timer(0.72) >= 0.72，所以第一次 update(0.72) 就结束
      const result = anim.update(0.72);
      expect(result).toBe(false);
    });

    test('动画完成时调用 stop', () => {
      const anim = new ClearLinesAnimation([0]);
      jest.spyOn(anim, 'stop');
      anim.update(0.72);
      expect(anim.stop).toHaveBeenCalledTimes(1);
    });

    test('多行同时闪烁同步', () => {
      const anim = new ClearLinesAnimation([0, 1]);

      // timer: 0 → 0.06, phase = 0, alpha = 1
      anim.update(0.06);
      expect(anim.lines[0].alpha).toBe(1);
      expect(anim.lines[1].alpha).toBe(1);

      // timer: 0.06 → 0.12, phase = 0, alpha = 1
      anim.update(0.06);
      // timer: 0.12 → 0.18, phase = 1, alpha = 0
      anim.update(0.06);
      expect(anim.lines[0].alpha).toBe(0);
      expect(anim.lines[1].alpha).toBe(0);
    });

    test('闪烁完整周期：6 个 phase 后结束', () => {
      const anim = new ClearLinesAnimation([0]);

      let alive = true;
      let updates = 0;
      while (alive) {
        alive = anim.update(0.12);
        updates++;
      }

      expect(updates).toBe(6);
    });
  });

  // ========== stop ==========
  describe('stop', () => {
    test('调用 applyClearLines', () => {
      const anim = new ClearLinesAnimation([0]);
      anim.stop();
      expect(applyClearLines).toHaveBeenCalledTimes(1);
    });

    test('发射 replay:stop:clear:lines', () => {
      const anim = new ClearLinesAnimation([0]);
      anim.stop();
      expect(EventBus.emit).toHaveBeenCalledWith('replay:stop:clear:lines', {
        isLevelUp: true,
        level: 2,
      });
    });

    test('发射 game:update:state', () => {
      const anim = new ClearLinesAnimation([0]);
      anim.stop();
      expect(EventBus.emit).toHaveBeenCalledWith('game:update:state', {
        stateHandler: expect.any(Function),
      });
    });

    test('发射 game:save:high:score', () => {
      const anim = new ClearLinesAnimation([0]);
      anim.stop();
      expect(EventBus.emit).toHaveBeenCalledWith('game:save:high:score');
    });

    test('发射 game:update:hud', () => {
      const anim = new ClearLinesAnimation([0]);
      anim.stop();
      expect(EventBus.emit).toHaveBeenCalledWith('game:update:hud');
    });

    test('未升级时 isLevelUp 为 false', () => {
      applyClearLines.mockReturnValue({
        level: 1,
        levelUp: false,
        stateHandler: jest.fn(),
      });

      const anim = new ClearLinesAnimation([0]);
      anim.stop();

      expect(EventBus.emit).toHaveBeenCalledWith('replay:stop:clear:lines', {
        isLevelUp: false,
        level: 1,
      });
    });
  });

  // ========== render ==========
  describe('render', () => {
    test('发射 ui:render:clear 事件', () => {
      const anim = new ClearLinesAnimation([3, 7]);
      anim.render();

      expect(EventBus.emit).toHaveBeenCalledWith('ui:render:clear', {
        state: {
          lines: [
            { y: 3, alpha: 1, timer: 0 },
            { y: 7, alpha: 1, timer: 0 },
          ],
        },
      });
    });

    test('渲染时保留当前 alpha 和 timer 状态', () => {
      const anim = new ClearLinesAnimation([0]);

      // timer: 0 → 0.06, phase = 0, alpha = 1
      anim.update(0.06);
      // timer: 0.06 → 0.12, phase = 0, alpha = 1
      anim.update(0.06);
      // timer: 0.12 → 0.18, phase = 1, alpha = 0
      anim.update(0.06);

      anim.render();

      const emitted = EventBus.emit.mock.calls.find(
        (call) => call[0] === 'ui:render:clear',
      )[1];

      expect(emitted.state.lines[0].alpha).toBe(0);
      expect(emitted.state.lines[0].timer).toBeGreaterThan(0);
    });
  });

  // ========== 完整生命周期 ==========
  describe('完整生命周期', () => {
    test('构造 → update 多次 → 自动 stop → 返回 false', () => {
      const anim = new ClearLinesAnimation([0]);

      let alive = true;
      let updates = 0;
      while (alive) {
        alive = anim.update(0.12);
        updates++;
      }

      expect(updates).toBe(6);
      expect(applyClearLines).toHaveBeenCalledTimes(1);
    });

    test('事件发射顺序', () => {
      const anim = new ClearLinesAnimation([0]);

      expect(EventBus.emit).toHaveBeenNthCalledWith(1, 'audio:sounds:clear', {
        lines: 0,
      });

      jest.clearAllMocks();

      anim.stop();

      expect(EventBus.emit).toHaveBeenNthCalledWith(
        1,
        'replay:stop:clear:lines',
        expect.any(Object),
      );
      expect(EventBus.emit).toHaveBeenNthCalledWith(
        2,
        'game:update:state',
        expect.any(Object),
      );
      expect(EventBus.emit).toHaveBeenNthCalledWith(3, 'game:save:high:score');
      expect(EventBus.emit).toHaveBeenNthCalledWith(4, 'game:update:hud');
    });
  });
});
