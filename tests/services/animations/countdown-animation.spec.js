import CountdownAnimation from '@/lib/services/animations/countdown-animation';
import Scheduler from '@/lib/engine/scheduler';

describe('CountdownAnimation', () => {
  let scheduler;
  let mockGame;
  let animation;

  beforeEach(() => {
    jest.clearAllMocks();

    scheduler = new Scheduler();

    mockGame = {
      id: 'test-uuid-001',
    };

    animation = new CountdownAnimation({
      Scheduler: scheduler,
      Game: mockGame,
    });
  });

  // ==================== 初始化 ====================

  describe('初始化', () => {
    test('layer 为 100', () => {
      expect(animation.layer).toBe(100);
    });

    test('blocking 为 true', () => {
      expect(animation.blocking).toBe(true);
    });

    test('name 为 countdown', () => {
      expect(animation.name).toBe('countdown');
    });

    test('初始 state：number=3, scale=4, count=0, acc=0, show=true', () => {
      expect(animation.state).toEqual({
        show: true,
        number: 3,
        scale: 4,
        count: 0,
        acc: 0,
      });
    });

    test('注册了 interval 任务', () => {
      expect(scheduler.size()).toBeGreaterThan(0);
    });

    test('构造时播放 COUNTDOWN 音效', () => {
      const spyEmit = jest.spyOn(CountdownAnimation.prototype, 'emit');

      const anim = new CountdownAnimation({
        Scheduler: new Scheduler(),
        Game: mockGame,
      });

      expect(spyEmit).toHaveBeenCalledWith('audio:resume:sound', {
        sound: 'COUNTDOWN',
      });

      spyEmit.mockRestore();
      anim.stop();
    });
  });

  // ==================== update ====================

  describe('update', () => {
    test('scale 随时间衰减但不超过 1', () => {
      animation.update(0.05);
      expect(animation.state.scale).toBe(2);

      animation.update(0.1);
      expect(animation.state.scale).toBe(1);
    });

    test('number > 0 时返回 true', () => {
      animation.state.number = 3;
      expect(animation.update(0.016)).toBe(true);
    });

    test('number <= 0 时返回 false', () => {
      animation.state.number = 0;
      expect(animation.update(0.016)).toBe(false);
    });
  });

  // ==================== 倒计时逻辑 ====================

  describe('倒计时 interval 回调', () => {
    test('首次 tick 后第二次 tick 触发回调：number 减 1，scale 重置为 4', () => {
      scheduler.tick(0);
      scheduler.tick(1000);

      expect(animation.state.number).toBe(2);
      expect(animation.state.scale).toBe(4);
    });

    test('number 减到 1 时仍然播放音效', () => {
      const spyEmit = jest.spyOn(animation, 'emit');
      animation.state.number = 2;

      scheduler.tick(0);
      scheduler.tick(1000);

      expect(animation.state.number).toBe(1);
      expect(spyEmit).toHaveBeenCalledWith('audio:resume:sound', {
        sound: 'COUNTDOWN',
      });
    });

    test('number 减到 0 时调用 stop', () => {
      const spyStop = jest.spyOn(animation, 'stop');
      animation.state.number = 1;

      scheduler.tick(0);
      scheduler.tick(1000);

      expect(animation.state.number).toBe(0);
      expect(spyStop).toHaveBeenCalled();
    });
  });

  // ==================== stop ====================

  describe('stop', () => {
    test('取消 scheduler 中的 interval 任务', () => {
      const beforeSize = scheduler.size();

      animation.stop();

      scheduler.tick(2000);
      expect(scheduler.size()).toBeLessThan(beforeSize);
    });

    test('发射 game:begin 事件', () => {
      const spyEmit = jest.spyOn(animation, 'emit');

      animation.stop();

      expect(spyEmit).toHaveBeenCalledWith('game:test-uuid-001:begin');
    });
  });

  // ==================== render ====================

  describe('render', () => {
    test('发射 render:countdown 事件并传递 state', () => {
      const spyEmit = jest.spyOn(animation, 'emit');

      animation.state.number = 2;
      animation.state.scale = 1.5;

      animation.render();

      expect(spyEmit).toHaveBeenCalledWith(
        'ui:test-uuid-001:render:countdown',
        { state: animation.state },
      );
    });
  });
});
