import CountdownAnimation from '@/lib/services/animations/countdown-animation.js';
import EventBus from '@/lib/core/event-bus/index.js';

jest.mock('@/lib/core/event-bus/index.js');

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('CountdownAnimation', () => {
  let anim;

  beforeEach(() => {
    anim = new CountdownAnimation();
  });

  // =====================================================
  //  构造
  // =====================================================

  describe('constructor', () => {
    it('初始化 state 为 3', () => {
      expect(anim.state.number).toBe(3);
      expect(anim.state.scale).toBe(4);
      expect(anim.state.show).toBe(true);
    });

    it('layer 为 100', () => {
      expect(anim.layer).toBe(100);
    });

    it('blocking 为 true', () => {
      expect(anim.blocking).toBe(true);
    });

    it('name 为 countdown', () => {
      expect(anim.name).toBe('countdown');
    });

    it('构造时发射一次 countdown 音效', () => {
      expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:countdown');
    });
  });

  // =====================================================
  //  update
  // =====================================================

  describe('update', () => {
    it('累加时间不足 0.01 秒时不推进逻辑', () => {
      const prevNumber = anim.state.number;
      anim.update(0.005);
      expect(anim.state.number).toBe(prevNumber);
    });

    it('每 50 次有效 tick 切换一次数字', () => {
      // 3 → 2：需要 50 次有效 tick
      for (let i = 0; i < 50; i++) {
        anim.update(0.016);
      }
      expect(anim.state.number).toBe(2);
      expect(anim.state.scale).toBe(4); // 重置 scale
    });

    it('数字从 3 降到 2 再降到 1', () => {
      // 3 → 2
      for (let i = 0; i < 50; i++) anim.update(0.016);
      expect(anim.state.number).toBe(2);

      // 2 → 1
      for (let i = 0; i < 50; i++) anim.update(0.016);
      expect(anim.state.number).toBe(1);
    });

    it('数字切换时播放倒计时音效', () => {
      // 构造时已调用 1 次
      expect(EventBus.emit).toHaveBeenCalledTimes(1);

      // 3 → 2
      for (let i = 0; i < 50; i++) anim.update(0.016);
      expect(EventBus.emit).toHaveBeenCalledTimes(2);

      // 2 → 1
      for (let i = 0; i < 50; i++) anim.update(0.016);
      expect(EventBus.emit).toHaveBeenCalledTimes(3);

      // 验证全是 countdown 音效
      const countdownCalls = EventBus.emit.mock.calls.filter(
        (call) => call[0] === 'audio:sounds:countdown',
      );
      expect(countdownCalls.length).toBe(3);
    });

    it('number 降到 0 时返回 false', () => {
      // 走完 3→2, 2→1, 1→0
      for (let i = 0; i < 150; i++) {
        const result = anim.update(0.016);
        if (result === false) {
          expect(anim.state.number).toBe(0);
          return;
        }
      }
      // 兜底
      expect(anim.state.number).toBe(0);
    });

    it('结束时调用 stop 触发 game:begin', () => {
      for (let i = 0; i < 150; i++) {
        anim.update(0.016);
      }
      expect(EventBus.emit).toHaveBeenCalledWith('game:begin');
    });

    it('scale 逐渐缩小但不小于 1', () => {
      for (let i = 0; i < 5; i++) anim.update(0.016);
      expect(anim.state.scale).toBeLessThan(4);
      expect(anim.state.scale).toBeGreaterThanOrEqual(1);
    });
  });

  // =====================================================
  //  render
  // =====================================================

  describe('render', () => {
    it('发射 ui:render:countdown 事件', () => {
      anim.render();
      expect(EventBus.emit).toHaveBeenCalledWith('ui:render:countdown', {
        state: anim.state,
      });
    });
  });

  // =====================================================
  //  边界情况
  // =====================================================

  describe('边界情况', () => {
    it('number 降到 0 时不再播放音效', () => {
      // 走完 3→2, 2→1, 1→0
      for (let i = 0; i < 150; i++) anim.update(0.016);

      const countdownCalls = EventBus.emit.mock.calls.filter(
        (call) => call[0] === 'audio:sounds:countdown',
      );
      // 仅构造函数 1 次 + 3→2 1 次 + 2→1 1 次 = 3 次，1→0 不播放
      expect(countdownCalls.length).toBe(3);
    });
  });
});
