import PausedAnimation from '@/lib/services/animations/paused-animation';
import Scheduler from '@/lib/engine/scheduler';

describe('PausedAnimation', () => {
  let scheduler;
  let animation;

  beforeEach(() => {
    jest.clearAllMocks();

    scheduler = new Scheduler();

    animation = new PausedAnimation({
      Scheduler: scheduler,
    });
  });

  // ==================== 初始化 ====================

  describe('初始化', () => {
    test('layer 为 500', () => {
      expect(animation.layer).toBe(500);
    });

    test('blocking 为 true', () => {
      expect(animation.blocking).toBe(true);
    });

    test('name 为 paused', () => {
      expect(animation.name).toBe('paused');
    });

    test('timer 初始为 0', () => {
      expect(animation.timer).toBe(0);
    });

    test('active 初始为 true', () => {
      expect(animation.active).toBe(true);
    });

    test('注册了 interval 任务', () => {
      expect(scheduler.size()).toBeGreaterThan(0);
    });
  });

  // ==================== update ====================

  describe('update', () => {
    test('active 为 false 时返回 false', () => {
      animation.active = false;

      expect(animation.update(0.016)).toBe(false);
    });

    test('active 为 true 时返回 true', () => {
      expect(animation.update(0.016)).toBe(true);
    });

    test('累加 timer', () => {
      animation.update(0.5);
      expect(animation.timer).toBe(0.5);

      animation.update(0.3);
      expect(animation.timer).toBe(0.8);
    });

    test('timer >= 1 时播放 SECOND_TICK 并重置 timer', () => {
      const spyEmit = jest.spyOn(animation, 'emit');

      animation.timer = 0.9;
      animation.update(0.2); // timer = 1.1 → >= 1

      expect(spyEmit).toHaveBeenCalledWith('audio:resume:sound', { sound: 'SECOND_TICK' });
      // timer 重置为 0
      expect(animation.timer).toBe(0);
    });

    test('timer 超过 1 时重置为 0 而不是减去 1', () => {
      const spyEmit = jest.spyOn(animation, 'emit');

      animation.timer = 0.8;
      animation.update(0.5); // timer = 1.3

      expect(spyEmit).toHaveBeenCalledWith('audio:resume:sound', { sound: 'SECOND_TICK' });
      expect(animation.timer).toBe(0);
    });
  });

  // ==================== interval 回调 ====================

  describe('每秒滴答 interval', () => {
    test('每秒触发 SECOND_TICK 音效', () => {
      const spyEmit = jest.spyOn(animation, 'emit');

      // 首次 tick：注册 startTime
      scheduler.tick(0);
      // 1 秒后触发
      scheduler.tick(1000);

      expect(spyEmit).toHaveBeenCalledWith('audio:resume:sound', { sound: 'SECOND_TICK' });
    });

    test('active 为 false 时不注册 interval', () => {
      scheduler.clear();

      const anim = new PausedAnimation({ Scheduler: scheduler });
      anim.active = false;

      // _tick() 在构造函数中已调用，但 active 在构造后才设 false
      // 所以需要在构造前 mock
      // 实际场景：stop() 设置 active=false 并 cancel interval
      anim.stop();

      const spyEmit = jest.spyOn(anim, 'emit');

      scheduler.tick(0);
      scheduler.tick(1000);

      expect(spyEmit).not.toHaveBeenCalled();
    });
  });

  // ==================== resume ====================

  describe('resume', () => {
    test('设置 active 为 true', () => {
      animation.active = false;

      animation.resume();

      expect(animation.active).toBe(true);
    });
  });

  // ==================== stop ====================

  describe('stop', () => {
    test('设置 active 为 false', () => {
      animation.stop();

      expect(animation.active).toBe(false);
    });

    test('取消 interval 任务', () => {
      const spyCancel = jest.spyOn(scheduler, 'cancel');

      animation.stop();

      expect(spyCancel).toHaveBeenCalled();
    });
  });

  // ==================== render ====================

  describe('render', () => {
    test('设置 active 为 true', () => {
      animation.active = false;

      animation.render();

      expect(animation.active).toBe(true);
    });
  });
});
