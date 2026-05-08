import PausedAnimation from '@/lib/services/animations/paused-animation';
import EventBus from '@/lib/core/event-bus';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

describe('PausedAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== 构造函数 ==========
  describe('constructor', () => {
    test('初始状态正确', () => {
      const anim = new PausedAnimation();

      expect(anim.layer).toBe(500);
      expect(anim.blocking).toBe(true);
      expect(anim.name).toBe('paused');
      expect(anim.timer).toBe(0);
      expect(anim.active).toBe(true);
    });
  });

  // ========== update ==========
  describe('update', () => {
    test('timer 累加', () => {
      const anim = new PausedAnimation();
      anim.update(0.3);
      expect(anim.timer).toBeCloseTo(0.3);
    });

    test('timer 未满 1 秒时不播放滴答声', () => {
      const anim = new PausedAnimation();
      anim.update(0.9);
      expect(EventBus.emit).not.toHaveBeenCalled();
    });

    test('timer 达到 1 秒时播放滴答声并重置', () => {
      const anim = new PausedAnimation();
      anim.update(1);

      expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:second:tick');
      expect(anim.timer).toBe(0);
    });

    test('超过 1 秒时播放并保留余量', () => {
      const anim = new PausedAnimation();
      anim.update(1.3);

      expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:second:tick');
      expect(anim.timer).toBe(0);
    });

    test('连续两秒播放两次滴答声', () => {
      const anim = new PausedAnimation();

      anim.update(1);
      expect(EventBus.emit).toHaveBeenCalledTimes(1);

      anim.update(1);
      expect(EventBus.emit).toHaveBeenCalledTimes(2);
    });

    test('累积多帧达到 1 秒', () => {
      const anim = new PausedAnimation();

      anim.update(0.4);
      anim.update(0.3);
      expect(EventBus.emit).not.toHaveBeenCalled();

      anim.update(0.3);
      expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:second:tick');
      expect(anim.timer).toBe(0);
    });

    test('active 时始终返回 true', () => {
      const anim = new PausedAnimation();
      expect(anim.update(0.1)).toBe(true);
      expect(anim.update(0.5)).toBe(true);
    });

    test('active 为 false 时返回 false', () => {
      const anim = new PausedAnimation();
      anim.active = false;
      expect(anim.update(0.1)).toBe(false);
    });

    test('active 为 false 时不触发滴答声', () => {
      const anim = new PausedAnimation();
      anim.active = false;
      anim.update(1);
      expect(EventBus.emit).not.toHaveBeenCalled();
    });
  });

  // ========== stop ==========
  describe('stop', () => {
    test('设置 active 为 false', () => {
      const anim = new PausedAnimation();
      anim.stop();
      expect(anim.active).toBe(false);
    });

    test('stop 后 update 返回 false', () => {
      const anim = new PausedAnimation();
      anim.stop();
      expect(anim.update(0.1)).toBe(false);
    });
  });

  // ========== render ==========
  describe('render', () => {
    test('设置 active 为 true', () => {
      const anim = new PausedAnimation();
      anim.active = false;
      anim.render();
      expect(anim.active).toBe(true);
    });
  });

  // ========== 完整周期 ==========
  describe('完整周期', () => {
    test('active → 滴答多次 → stop → update 返回 false', () => {
      const anim = new PausedAnimation();

      // 播放 3 秒
      for (let i = 0; i < 3; i++) {
        anim.update(1);
      }
      expect(EventBus.emit).toHaveBeenCalledTimes(3);

      // 停止
      anim.stop();
      expect(anim.active).toBe(false);
      expect(anim.update(0.1)).toBe(false);
    });
  });
});
