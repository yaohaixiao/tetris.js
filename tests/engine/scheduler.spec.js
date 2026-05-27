import Scheduler from '@/lib/engine/scheduler';

describe('Scheduler', () => {
  let scheduler;

  beforeEach(() => {
    scheduler = new Scheduler();
    // 固定初始时间为 0，避免 performance.now() 影响测试
    scheduler.now = 0;
  });

  // ==================== delay ====================

  describe('delay', () => {
    it('返回唯一的任务 ID', () => {
      const id1 = scheduler.delay(jest.fn(), 100);
      const id2 = scheduler.delay(jest.fn(), 200);
      expect(id1).toBe(1);
      expect(id2).toBe(2);
    });

    it('注册后队列长度增加', () => {
      scheduler.delay(jest.fn(), 100);
      expect(scheduler.size()).toBe(1);
    });

    it('默认 delay 为 0', () => {
      const fn = jest.fn();
      scheduler.delay(fn);
      scheduler.tick(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('delay 未到时不执行', () => {
      const fn = jest.fn();
      scheduler.delay(fn, 100);
      scheduler.tick(50);
      expect(fn).not.toHaveBeenCalled();
      expect(scheduler.size()).toBe(1);
    });

    it('delay 到达时执行', () => {
      const fn = jest.fn();
      scheduler.delay(fn, 100);
      scheduler.tick(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('delay 超过时执行', () => {
      const fn = jest.fn();
      scheduler.delay(fn, 100);
      scheduler.tick(150);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('执行后自动删除', () => {
      const fn = jest.fn();
      scheduler.delay(fn, 100);
      scheduler.tick(100);
      expect(scheduler.size()).toBe(0);
    });

    it('多个 delay 按时间顺序执行', () => {
      const order = [];
      scheduler.delay(() => order.push(2), 200);
      scheduler.delay(() => order.push(1), 100);
      scheduler.delay(() => order.push(3), 300);

      scheduler.tick(150);
      expect(order).toEqual([1]);

      scheduler.tick(250);
      expect(order).toEqual([1, 2]);

      scheduler.tick(350);
      expect(order).toEqual([1, 2, 3]);
    });
  });

  // ==================== interval ====================

  describe('interval', () => {
    it('返回唯一的任务 ID', () => {
      const id = scheduler.interval(jest.fn(), 100);
      expect(id).toBeGreaterThan(0);
    });

    it('注册后队列长度增加', () => {
      scheduler.interval(jest.fn(), 100);
      expect(scheduler.size()).toBe(1);
    });

    it('首次到时间就触发（无空等周期）', () => {
      const fn = jest.fn();
      scheduler.interval(fn, 100);
      scheduler.tick(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('未到时间不触发', () => {
      const fn = jest.fn();
      scheduler.interval(fn, 100);
      scheduler.tick(50);
      expect(fn).not.toHaveBeenCalled();
    });

    it('周期性重复触发', () => {
      const fn = jest.fn();
      scheduler.interval(fn, 100);
      scheduler.tick(100);
      scheduler.tick(200);
      scheduler.tick(300);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('每次执行后自动重新插入队列', () => {
      const fn = jest.fn();
      scheduler.interval(fn, 100);
      scheduler.tick(100);
      expect(scheduler.size()).toBe(1);
    });

    it('多个 interval 独立运行', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      scheduler.interval(fn1, 50);
      scheduler.interval(fn2, 100);

      scheduler.tick(100);
      expect(fn1).toHaveBeenCalledTimes(2);
      expect(fn2).toHaveBeenCalledTimes(1);

      scheduler.tick(200);
      expect(fn1).toHaveBeenCalledTimes(4);
      expect(fn2).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== sequence ====================

  describe('sequence', () => {
    it('返回所有任务的 ID 数组', () => {
      const ids = scheduler.sequence([
        { fn: jest.fn() },
        { fn: jest.fn(), delay: 100 },
        { fn: jest.fn() },
      ]);
      expect(ids).toHaveLength(3);
      expect(ids[0]).toBeGreaterThan(0);
      expect(ids[1]).toBeGreaterThan(ids[0]);
      expect(ids[2]).toBeGreaterThan(ids[1]);
    });

    it('任务按时间顺序执行', () => {
      const order = [];
      scheduler.sequence([
        { fn: () => order.push(1) },
        { fn: () => order.push(2), delay: 100 },
        { fn: () => order.push(3), delay: 100 },
      ]);

      scheduler.tick(0);
      expect(order).toEqual([1]);

      scheduler.tick(100);
      expect(order).toEqual([1, 2]);

      scheduler.tick(200);
      expect(order).toEqual([1, 2, 3]);
    });

    it('sequence 不依赖 tick 初始化（绝对时间模型）', () => {
      const fn = jest.fn();
      scheduler.sequence([{ fn }]);
      // 直接 tick 就能触发，不需要两次 tick
      scheduler.tick(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== cancel ====================

  describe('cancel', () => {
    it('取消 delay 后不再执行', () => {
      const fn = jest.fn();
      const id = scheduler.delay(fn, 100);
      scheduler.cancel(id);
      scheduler.tick(100);
      expect(fn).not.toHaveBeenCalled();
    });

    it('取消 interval 后不再执行', () => {
      const fn = jest.fn();
      const id = scheduler.interval(fn, 100);
      scheduler.tick(100);
      expect(fn).toHaveBeenCalledTimes(1);
      scheduler.cancel(id);
      scheduler.tick(200);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('取消不存在的 ID 不报错', () => {
      expect(() => scheduler.cancel(999)).not.toThrow();
    });

    it('cancel 后 dirty 标记为 true', () => {
      const id = scheduler.delay(jest.fn(), 100);
      scheduler.cancel(id);
      expect(scheduler.dirty).toBe(true);
    });

    it('tick 末尾清理已取消的任务', () => {
      scheduler.delay(jest.fn(), 100);
      scheduler.delay(jest.fn(), 200);
      scheduler.cancel(1);
      scheduler.tick(200);
      expect(scheduler.size()).toBe(0);
    });
  });

  // ==================== clear ====================

  describe('clear', () => {
    it('清空所有任务', () => {
      scheduler.delay(jest.fn(), 100);
      scheduler.interval(jest.fn(), 50);
      scheduler.sequence([{ fn: jest.fn() }]);
      expect(scheduler.size()).toBeGreaterThan(0);
      scheduler.clear();
      expect(scheduler.size()).toBe(0);
    });

    it('清空后 dirty 重置为 false', () => {
      scheduler.cancel(scheduler.delay(jest.fn(), 100));
      scheduler.clear();
      expect(scheduler.dirty).toBe(false);
    });
  });

  // ==================== tick ====================

  describe('tick', () => {
    it('无任务时 tick 不报错', () => {
      expect(() => scheduler.tick(100)).not.toThrow();
    });

    it('默认 gameTime 为 performance.now()', () => {
      const fn = jest.fn();
      scheduler.delay(fn, 0);
      scheduler.tick();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('tick 更新 now', () => {
      scheduler.tick(5000);
      expect(scheduler.now).toBe(5000);
    });
  });

  // ==================== size ====================

  describe('size', () => {
    it('初始 size 为 0', () => {
      expect(scheduler.size()).toBe(0);
    });

    it('添加任务后 size 增加', () => {
      scheduler.delay(jest.fn(), 100);
      scheduler.interval(jest.fn(), 50);
      expect(scheduler.size()).toBe(2);
    });

    it('delay 执行后 size 减少', () => {
      scheduler.delay(jest.fn(), 100);
      scheduler.tick(100);
      expect(scheduler.size()).toBe(0);
    });
  });

  // ==================== 排序稳定性 ====================

  describe('排序稳定性', () => {
    it('同一时间按 order 顺序执行', () => {
      const order = [];
      scheduler.delay(() => order.push(1), 100);
      scheduler.delay(() => order.push(2), 100);
      scheduler.delay(() => order.push(3), 100);

      scheduler.tick(100);
      expect(order).toEqual([1, 2, 3]);
    });

    it('不同时间按 time 顺序执行', () => {
      const order = [];
      scheduler.delay(() => order.push(3), 300);
      scheduler.delay(() => order.push(1), 100);
      scheduler.delay(() => order.push(2), 200);

      scheduler.tick(300);
      expect(order).toEqual([1, 2, 3]);
    });
  });

  // ==================== 补帧保护 ====================

  describe('补帧保护', () => {
    it('长时间未 tick 时 interval 最多补 maxCatchUp 次', () => {
      const fn = jest.fn();
      scheduler.interval(fn, 100);
      // 模拟长时间暂停后 tick 一个很大的时间
      scheduler.tick(10000);
      expect(fn.mock.calls.length).toBeLessThanOrEqual(scheduler.maxCatchUp);
    });

    it('补帧后 nextTime 重置为当前时间', () => {
      const fn = jest.fn();
      const id = scheduler.interval(fn, 100);
      scheduler.tick(10000);
      // 之后应该正常间隔触发
      const countBefore = fn.mock.calls.length;
      scheduler.tick(10100);
      expect(fn.mock.calls.length).toBeGreaterThan(countBefore);
    });
  });

  // ==================== 边界情况 ====================

  describe('边界情况', () => {
    it('delay 为负数立即执行', () => {
      const fn = jest.fn();
      scheduler.delay(fn, -100);
      scheduler.tick(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('大量任务都能正确执行', () => {
      const fns = Array.from({ length: 100 }, () => jest.fn());
      fns.forEach((fn) => scheduler.delay(fn, 50));

      // 调试：检查排序
      const firstTask = scheduler.tasks[0];
      console.log(
        'first task time:',
        firstTask?.time,
        'order:',
        firstTask?.order,
      );

      scheduler.tick(100);

      // 调试：检查执行后状态
      console.log('now:', scheduler.now, 'size:', scheduler.size());

      fns.forEach((fn) => expect(fn).toHaveBeenCalledTimes(1));
      expect(scheduler.size()).toBe(0);
    });

    // it('cancel 后 tick 不再触发 BGM 回调', () => {
    //   const fn = jest.fn();
    //
    //   scheduler.clear();
    //   const id = scheduler.interval(fn, 25);
    //   audio.bgmSchedulerId = id;
    //
    //   // 新 Scheduler：首次 tick 即触发
    //   scheduler.tick(25);
    //   expect(fn).toHaveBeenCalledTimes(1);
    //
    //   stopBGM(audio);
    //
    //   jest.clearAllMocks();
    //
    //   scheduler.tick(200);
    //   expect(fn).not.toHaveBeenCalled();
    // });

    it('大量任务都能正确执行', () => {
      const fns = Array.from({ length: 100 }, () => jest.fn());
      fns.forEach((fn) => scheduler.delay(fn, 50));
      scheduler.tick(100);
      fns.forEach((fn) => expect(fn).toHaveBeenCalledTimes(1));
      expect(scheduler.size()).toBe(0);
    });

    it('同一 ID 重复 cancel 不报错', () => {
      const id = scheduler.delay(jest.fn(), 100);
      scheduler.cancel(id);
      expect(() => scheduler.cancel(id)).not.toThrow();
    });
  });
});
