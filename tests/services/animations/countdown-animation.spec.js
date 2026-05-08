import CountdownAnimation from '@/lib/services/animations/countdown-animation';
import EventBus from '@/lib/core/event-bus';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

describe('CountdownAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== 构造函数 ==========
  describe('constructor', () => {
    test('初始化状态正确', () => {
      const anim = new CountdownAnimation();

      expect(anim.state).toEqual({
        show: true,
        number: 3,
        scale: 4,
        count: 0,
        acc: 0,
      });
    });

    test('设置默认属性', () => {
      const anim = new CountdownAnimation();

      expect(anim.layer).toBe(100);
      expect(anim.blocking).toBe(true);
      expect(anim.name).toBe('countdown');
    });
  });

  // ========== update ==========
  describe('update', () => {
    test('acc 小于 0.01 时直接返回 true，不更新状态', () => {
      const anim = new CountdownAnimation();
      const result = anim.update(0.005);

      expect(result).toBe(true);
      expect(anim.state.acc).toBe(0.005);
      expect(anim.state.count).toBe(0);
      expect(anim.state.number).toBe(3);
    });

    test('delta >= 0.01 时累加 count', () => {
      const anim = new CountdownAnimation();
      anim.update(0.01);

      expect(anim.state.count).toBe(1);
    });

    test('acc 累加后超过 0.01 才触发更新', () => {
      const anim = new CountdownAnimation();

      // 第一帧 0.005，不够
      anim.update(0.005);
      expect(anim.state.count).toBe(0);

      // 第二帧 0.006，累计 0.011，触发一次
      anim.update(0.006);
      expect(anim.state.count).toBe(1);
      expect(anim.state.acc).toBe(0);
    });

    test('scale 逐渐缩小，最小为 1', () => {
      const anim = new CountdownAnimation();

      // 初始 scale = 4
      anim.update(0.01);
      expect(anim.state.scale).toBe(3.6);

      anim.update(0.01);
      expect(anim.state.scale).toBe(3.2);

      // 多次更新直到 scale 触底
      for (let i = 0; i < 10; i++) {
        anim.update(0.01);
      }
      expect(anim.state.scale).toBe(1);
    });

    test('每 50 帧切换一次数字', () => {
      const anim = new CountdownAnimation();

      // 推进 50 帧
      for (let i = 0; i < 50; i++) {
        anim.update(0.01);
      }

      expect(anim.state.number).toBe(2);
      expect(anim.state.scale).toBe(4); // reset
      expect(anim.state.count).toBe(0); // reset
    });

    test('数字切换时播放倒计时音效', () => {
      const anim = new CountdownAnimation();

      // 50 帧后 number 从 3 → 2
      for (let i = 0; i < 50; i++) {
        anim.update(0.01);
      }

      expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:countdown');

      // 再来 50 帧，number 从 2 → 1
      for (let i = 0; i < 50; i++) {
        anim.update(0.01);
      }

      expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:countdown');
      expect(EventBus.emit).toHaveBeenCalledTimes(2);
    });

    test('number 降到 0 时返回 false', () => {
      const anim = new CountdownAnimation();

      // 150 帧：3 → 2 → 1 → 0
      for (let i = 0; i < 150; i++) {
        anim.update(0.01);
      }

      expect(anim.state.number).toBeLessThanOrEqual(0);
    });

    test('number <= 0 时调用 stop', () => {
      const anim = new CountdownAnimation();
      jest.spyOn(anim, 'stop');

      for (let i = 0; i < 150; i++) {
        const result = anim.update(0.01);
        if (result === false) break;
      }

      expect(anim.stop).toHaveBeenCalledTimes(1);
    });

    test('完整倒计时流程', () => {
      const anim = new CountdownAnimation();
      const numbers = [];

      // 初始也记录
      numbers.push(anim.state.number);

      let alive = true;
      while (alive) {
        const prevNumber = anim.state.number;
        alive = anim.update(0.01);
        // number 变化时记录
        if (anim.state.number !== prevNumber) {
          numbers.push(anim.state.number);
        }
      }

      expect(numbers).toEqual([3, 2, 1, 0]);
    });
  });

  // ========== stop ==========
  describe('stop', () => {
    test('发射 game:begin 事件', () => {
      const anim = new CountdownAnimation();
      anim.stop();

      expect(EventBus.emit).toHaveBeenCalledWith('game:begin');
    });
  });

  // ========== render ==========
  describe('render', () => {
    test('发射 ui:render:countdown 事件并传递 state', () => {
      const anim = new CountdownAnimation();
      anim.render();

      expect(EventBus.emit).toHaveBeenCalledWith('ui:render:countdown', {
        state: {
          show: true,
          number: 3,
          scale: 4,
          count: 0,
          acc: 0,
        },
      });
    });

    test('render 传递当前最新 state', () => {
      const anim = new CountdownAnimation();

      for (let i = 0; i < 60; i++) {
        anim.update(0.01);
      }

      anim.render();

      const call = EventBus.emit.mock.calls.find(
        (c) => c[0] === 'ui:render:countdown'
      );
      expect(call[1].state.number).toBe(2);
    });
  });

  // ========== 边界 ==========
  describe('边界情况', () => {
    test('多次 update 后 stop 不重复发射 game:begin', () => {
      const anim = new CountdownAnimation();
      jest.spyOn(anim, 'stop');

      // 跑完
      for (let i = 0; i < 200; i++) {
        const result = anim.update(0.01);
        if (result === false) break;
      }

      expect(anim.stop).toHaveBeenCalledTimes(1);
      expect(EventBus.emit).toHaveBeenCalledWith('game:begin');
    });

    test('countdown 音效不包含 number=0', () => {
      const anim = new CountdownAnimation();

      // 跑到结束
      for (let i = 0; i < 200; i++) {
        const result = anim.update(0.01);
        if (result === false) break;
      }

      // 只有 3 次音效（3→2, 2→1, 1 之后不触发）
      const countdownCalls = EventBus.emit.mock.calls.filter(
        (call) => call[0] === 'audio:sounds:countdown'
      );
      expect(countdownCalls.length).toBe(2); // number 3→2 和 2→1
    });
  });
});
