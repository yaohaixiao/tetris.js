import Scheduler from '@/lib/engine/scheduler';

describe('Scheduler', () => {
  let scheduler;

  beforeEach(() => {
    scheduler = new Scheduler();
  });

  // ==================== delay ====================

  describe('delay', () => {
    test('返回唯一的任务 id', () => {
      const id1 = scheduler.delay(jest.fn(), 100);
      const id2 = scheduler.delay(jest.fn(), 200);

      expect(id1).toBe(1);
      expect(id2).toBe(2);
    });

    test('注册任务后 size 增加', () => {
      scheduler.delay(jest.fn(), 100);

      expect(scheduler.size()).toBe(1);
    });

    test('默认 delay 为 0', () => {
      const fn = jest.fn();

      scheduler.delay(fn);

      // 首次 tick：记录 startTime=0, gameTime-startTime=0 >= delay(0) → 执行
      scheduler.tick(0);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('delay 未到时任务不执行', () => {
      const fn = jest.fn();

      scheduler.delay(fn, 100);

      // 首次 tick(50)：记录 startTime=50, 经过了 0ms < 100ms → 不执行
      scheduler.tick(50);

      expect(fn).not.toHaveBeenCalled();
      expect(scheduler.size()).toBe(1);
    });

    test('delay 到达时任务执行（需要两次 tick）', () => {
      const fn = jest.fn();

      scheduler.delay(fn, 100);

      // 首次 tick(0)：记录 startTime=0
      scheduler.tick(0);
      expect(fn).not.toHaveBeenCalled();

      // 第二次 tick(100)：gameTime-startTime = 100 >= delay(100) → 执行
      scheduler.tick(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('delay 超过时任务执行', () => {
      const fn = jest.fn();

      scheduler.delay(fn, 100);

      // 首次 tick(0)：记录 startTime=0
      scheduler.tick(0);

      // 第二次 tick(150)：gameTime-startTime = 150 >= 100 → 执行
      scheduler.tick(150);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('任务执行后被移除', () => {
      const fn = jest.fn();

      scheduler.delay(fn, 100);

      scheduler.tick(0); // 记录 startTime=0
      scheduler.tick(100); // 执行并移除

      expect(scheduler.size()).toBe(0);
    });

    test('多个 delay 任务按时间触发', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      const fn3 = jest.fn();

      scheduler.delay(fn1, 100);
      scheduler.delay(fn2, 200);
      scheduler.delay(fn3, 300);

      // 首次 tick(0)：记录所有 startTime=0
      scheduler.tick(0);

      // tick(100)：fn1: 100 >= 100 → 执行
      //            fn2: 100 < 200 → 跳过
      //            fn3: 100 < 300 → 跳过
      scheduler.tick(100);

      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).not.toHaveBeenCalled();
      expect(fn3).not.toHaveBeenCalled();

      // tick(200)：fn2: 200 >= 200 → 执行
      scheduler.tick(200);

      expect(fn2).toHaveBeenCalledTimes(1);
      expect(fn3).not.toHaveBeenCalled();

      // tick(300)：fn3: 300 >= 300 → 执行
      scheduler.tick(300);

      expect(fn3).toHaveBeenCalledTimes(1);
    });

    test('传递参数给回调函数', () => {
      const fn = jest.fn();
      const value = 'test';

      scheduler.delay(() => fn(value), 100);

      scheduler.tick(0);
      scheduler.tick(100);

      expect(fn).toHaveBeenCalledWith('test');
    });
  });

  // ==================== interval ====================

  describe('interval', () => {
    test('返回唯一的任务 id', () => {
      const id = scheduler.interval(jest.fn(), 25);

      expect(id).toBeGreaterThan(0);
    });

    test('注册任务后 size 增加', () => {
      scheduler.interval(jest.fn(), 25);

      expect(scheduler.size()).toBe(1);
    });

    test('首次 tick 不执行（注册 startTime 和 nextTime）', () => {
      const fn = jest.fn();

      scheduler.interval(fn, 25);
      scheduler.tick(100);

      // startTime=100, nextTime=125, gameTime=100 < 125 → 不执行
      expect(fn).not.toHaveBeenCalled();
    });

    test('第二次 tick 且 gameTime >= nextTime 时执行', () => {
      const fn = jest.fn();

      scheduler.interval(fn, 25);

      scheduler.tick(100); // startTime=100, nextTime=125
      scheduler.tick(125); // gameTime=125 >= nextTime=125 → 执行

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('gameTime < nextTime 时不执行', () => {
      const fn = jest.fn();

      scheduler.interval(fn, 25);

      scheduler.tick(100); // startTime=100, nextTime=125
      scheduler.tick(110); // gameTime=110 < nextTime=125 → 不执行

      expect(fn).not.toHaveBeenCalled();
    });

    test('每次执行后更新 nextTime', () => {
      const fn = jest.fn();

      scheduler.interval(fn, 25);

      scheduler.tick(100); // startTime=100, nextTime=125
      scheduler.tick(125); // fn 执行, nextTime=150
      scheduler.tick(150); // fn 执行, nextTime=175
      scheduler.tick(175); // fn 执行, nextTime=200

      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('interval 任务不会被自动移除', () => {
      const fn = jest.fn();

      scheduler.interval(fn, 25);

      scheduler.tick(100);
      scheduler.tick(125);

      expect(scheduler.size()).toBe(1);
    });

    test('多个 interval 独立运行', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();

      scheduler.interval(fn1, 10);
      scheduler.interval(fn2, 20);

      scheduler.tick(100);
      scheduler.tick(110); // fn1: nextTime=110, 触发; fn2: nextTime=120, 未到

      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(0);

      scheduler.tick(120); // fn1: nextTime=120, 触发; fn2: nextTime=120, 触发

      expect(fn1).toHaveBeenCalledTimes(2);
      expect(fn2).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== cancel ====================

  describe('cancel', () => {
    test('取消 delay 任务后不再执行', () => {
      const fn = jest.fn();

      const id = scheduler.delay(fn, 100);

      scheduler.cancel(id);
      scheduler.tick(0);
      scheduler.tick(100);

      expect(fn).not.toHaveBeenCalled();
    });

    test('取消 interval 任务后不再执行', () => {
      const fn = jest.fn();

      const id = scheduler.interval(fn, 25);

      scheduler.tick(100);
      scheduler.tick(125);

      expect(fn).toHaveBeenCalledTimes(1);

      scheduler.cancel(id);

      scheduler.tick(150);
      scheduler.tick(175);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('取消不存在的 id 不报错', () => {
      expect(() => scheduler.cancel(999)).not.toThrow();
    });

    test('lazy cleanup 在 tick 中触发', () => {
      const fn = jest.fn();
      const id = scheduler.delay(fn, 100);

      expect(scheduler.size()).toBe(1);

      scheduler.cancel(id);

      // cancel 后 size 仍为 1（lazy）
      expect(scheduler.size()).toBe(1);

      // tick 触发 lazy cleanup
      scheduler.tick(0);
      scheduler.tick(200);

      expect(scheduler.size()).toBe(0);
    });
  });

  // ==================== sequence ====================

  describe('sequence', () => {
    test('返回所有任务的 id 数组', () => {
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

    test('任务按顺序执行', () => {
      const results = [];

      scheduler.sequence([
        { fn: () => results.push('a') },
        { fn: () => results.push('b') },
        { fn: () => results.push('c') },
      ]);

      // 所有 delay 默认为 0, t=0
      // 3 个 delay 任务，首次 tick 记录 startTime，第二次 tick 执行
      scheduler.tick(0);
      scheduler.tick(0); // gameTime-startTime=0 >= delay(0) → 执行

      expect(results).toEqual(['a', 'b', 'c']);
    });

    test('支持 delay 参数控制任务间隔', () => {
      const results = [];

      scheduler.sequence([
        { fn: () => results.push('first') },
        { fn: () => results.push('second'), delay: 100 },
        { fn: () => results.push('third'), delay: 200 },
      ]);

      // 任务0: delay=0, t=0  → startTime 在首次 tick 记录
      // 任务1: delay=100, t=100
      // 任务2: delay=200, t=300

      // 首次 tick：记录所有 startTime
      scheduler.tick(0);

      // tick(0)：任务0 执行；任务1 经过0ms < 100ms；任务2 经过0ms < 300ms
      scheduler.tick(0);

      expect(results).toEqual(['first']);

      // tick(100)：任务1 经过100ms >= 100ms → 执行
      //            任务2 经过100ms < 300ms → 跳过
      scheduler.tick(100);

      expect(results).toEqual(['first', 'second']);

      // tick(300)：任务2 经过300ms >= 300ms → 执行
      scheduler.tick(300);

      expect(results).toEqual(['first', 'second', 'third']);
    });

    test('sequence 延迟累加', () => {
      const results = [];

      scheduler.sequence([
        { fn: () => results.push(1), delay: 50 },
        { fn: () => results.push(2), delay: 50 },
        { fn: () => results.push(3), delay: 50 },
      ]);

      // 任务0: t=0+50=50,   delay=50
      // 任务1: t=50+50=100,  delay=100
      // 任务2: t=100+50=150, delay=150

      // 首次 tick：记录所有 startTime
      scheduler.tick(0);

      // tick(50)：任务0 经过50ms >= 50ms → 执行
      //           任务1 经过50ms < 100ms → 跳过
      //           任务2 经过50ms < 150ms → 跳过
      scheduler.tick(50);

      expect(results).toEqual([1]);

      // tick(100)：任务1 经过100ms >= 100ms → 执行
      scheduler.tick(100);

      expect(results).toEqual([1, 2]);

      // tick(150)：任务2 经过150ms >= 150ms → 执行
      scheduler.tick(150);

      expect(results).toEqual([1, 2, 3]);
    });

    test('任务执行完自动清理', () => {
      scheduler.sequence([{ fn: jest.fn() }, { fn: jest.fn() }]);

      scheduler.tick(0);
      scheduler.tick(0);

      expect(scheduler.size()).toBe(0);
    });

    test('可通过 cancel 取消整个 sequence', () => {
      const results = [];

      const ids = scheduler.sequence([
        { fn: () => results.push(1) },
        { fn: () => results.push(2), delay: 100 },
        { fn: () => results.push(3), delay: 100 },
      ]);

      scheduler.tick(0);
      scheduler.tick(0);

      expect(results).toEqual([1]);

      // 取消剩余任务
      ids.slice(1).forEach((id) => scheduler.cancel(id));

      scheduler.tick(300);

      expect(results).toEqual([1]);
    });
  });

  // ==================== clear ====================

  describe('clear', () => {
    test('清空所有任务', () => {
      scheduler.delay(jest.fn(), 100);
      scheduler.interval(jest.fn(), 25);
      scheduler.sequence([{ fn: jest.fn() }]);

      expect(scheduler.size()).toBeGreaterThan(0);

      scheduler.clear();

      expect(scheduler.size()).toBe(0);
    });

    test('清空后 dirty 重置为 false', () => {
      const id = scheduler.delay(jest.fn(), 100);

      scheduler.cancel(id);
      scheduler.clear();

      const id2 = scheduler.delay(jest.fn(), 100);

      scheduler.cancel(id2);
      scheduler.tick(0);
      scheduler.tick(100);

      expect(scheduler.size()).toBe(0);
    });
  });

  // ==================== tick ====================

  describe('tick', () => {
    test('无任务时 tick 不报错', () => {
      expect(() => scheduler.tick(100)).not.toThrow();
    });

    test('默认 gameTime 为 performance.now()', () => {
      const fn = jest.fn();

      scheduler.delay(fn, 0);
      scheduler.tick(); // 首次：记录 startTime
      scheduler.tick(); // 第二次：执行

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('delay 任务的 startTime 在首次 tick 时记录', () => {
      const fn = jest.fn();

      scheduler.delay(fn, 100);

      // 首次 tick(50)：记录 startTime=50
      scheduler.tick(50);
      expect(fn).not.toHaveBeenCalled();

      // 第二次 tick(150)：gameTime-startTime=100 >= 100 → 执行
      scheduler.tick(150);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('tick 后 cancelled 任务被 lazy cleanup', () => {
      const id1 = scheduler.delay(jest.fn(), 100);
      const id2 = scheduler.delay(jest.fn(), 200);

      scheduler.cancel(id1);

      expect(scheduler.size()).toBe(2);

      // tick 触发 lazy cleanup
      scheduler.tick(0);
      scheduler.tick(100);

      expect(scheduler.size()).toBe(1); // id1 被清理，id2 还在
    });

    test('空任务集时 tick 直接返回', () => {
      scheduler.tick(100);
      scheduler.tick(200);

      expect(scheduler.size()).toBe(0);
    });
  });

  // ==================== size ====================

  describe('size', () => {
    test('初始 size 为 0', () => {
      expect(scheduler.size()).toBe(0);
    });

    test('添加任务后 size 增加', () => {
      scheduler.delay(jest.fn(), 100);
      scheduler.interval(jest.fn(), 25);

      expect(scheduler.size()).toBe(2);
    });

    test('任务执行后 size 减少', () => {
      scheduler.delay(jest.fn(), 100);

      scheduler.tick(0);
      scheduler.tick(100);

      expect(scheduler.size()).toBe(0);
    });
  });

  // ==================== 边界情况 ====================

  describe('边界情况', () => {
    test('delay 为负数的任务在第二次 tick 立即执行', () => {
      const fn = jest.fn();

      scheduler.delay(fn, -100);

      scheduler.tick(0);

      // gameTime-startTime=0 >= -100 → 执行
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('interval 为 0 时每次 tick 都执行', () => {
      const fn = jest.fn();

      scheduler.interval(fn, 0);

      // 首次 tick：startTime=100, nextTime=100, gameTime=100 >= 100 → 执行
      scheduler.tick(100);

      // interval=0 时首次 tick 就会执行
      expect(fn).toHaveBeenCalledTimes(1);

      // 第二次 tick：gameTime=100 >= nextTime=100 → 执行
      scheduler.tick(100);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('大量任务都能正确执行', () => {
      const fns = Array.from({ length: 100 }, () => jest.fn());

      fns.forEach((fn) => scheduler.delay(fn, 50));

      // 首次 tick：记录所有 startTime
      scheduler.tick(0);
      // 第二次 tick：全部执行
      scheduler.tick(50);

      fns.forEach((fn) => {
        expect(fn).toHaveBeenCalledTimes(1);
      });

      expect(scheduler.size()).toBe(0);
    });

    test('同一 id 重复 cancel 不报错', () => {
      const id = scheduler.delay(jest.fn(), 100);

      scheduler.cancel(id);
      expect(() => scheduler.cancel(id)).not.toThrow();
    });
  });
});
