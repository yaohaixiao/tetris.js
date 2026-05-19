import LevelUpAnimation from '@/lib/services/animations/level-up-animation';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/services/ui/constants/firework-colors', () => [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
]);

describe('LevelUpAnimation', () => {
  let scheduler;
  let mockGame;
  let mockUI;
  let animation;

  beforeEach(() => {
    jest.clearAllMocks();

    scheduler = new Scheduler();

    mockUI = {
      Canvas: {
        gameBoard: {
          width: 400,
          height: 600,
        },
      },
    };

    mockGame = {
      id: 'test-uuid-003',
    };

    animation = new LevelUpAnimation({
      Scheduler: scheduler,
      Game: mockGame,
      UI: mockUI,
      level: 5,
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

    test('name 为 level-up', () => {
      expect(animation.name).toBe('level-up');
    });

    test('duration 为 3 秒', () => {
      expect(animation.duration).toBe(3);
    });

    test('level 为传入的值', () => {
      expect(animation.level).toBe(5);
    });

    test('active 初始为 true', () => {
      expect(animation.active).toBe(true);
    });

    test('timer 和 spawnTimer 初始为 0', () => {
      expect(animation.timer).toBe(0);
      expect(animation.spawnTimer).toBe(0);
    });

    test('注册 spawn interval（600ms）和 end delay（3000ms）', () => {
      expect(scheduler.size()).toBeGreaterThanOrEqual(2);
    });

    test('初始创建了一组 fireworks', () => {
      expect(animation.fireworks.length).toBe(40);
    });
  });

  // ==================== createFireworks ====================

  describe('createFireworks', () => {
    test('创建 40 个粒子', () => {
      const particles = animation.createFireworks();

      expect(particles).toHaveLength(40);
    });

    test('粒子在画布中心上方', () => {
      const particles = animation.createFireworks();

      particles.forEach((p) => {
        expect(p.x).toBe(200); // width/2 = 400/2
        expect(p.y).toBe(240); // height/2 - 60 = 300 - 60
      });
    });

    test('每个粒子有必需的属性', () => {
      const particles = animation.createFireworks();
      const p = particles[0];

      expect(p).toHaveProperty('x', 200);
      expect(p).toHaveProperty('y', 240);
      expect(p).toHaveProperty('vx');
      expect(p).toHaveProperty('vy');
      expect(p).toHaveProperty('radius');
      expect(p).toHaveProperty('color');
      expect(p).toHaveProperty('alpha', 1);
    });

    test('粒子速度为 5 到 20', () => {
      const particles = animation.createFireworks();

      particles.forEach((p) => {
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        expect(speed).toBeGreaterThanOrEqual(4.9); // 浮点精度
        expect(speed).toBeLessThanOrEqual(20.1);
      });
    });
  });

  // ==================== updateFireworks ====================

  describe('updateFireworks', () => {
    test('粒子位置更新', () => {
      const initialX = animation.fireworks[0].x;
      const initialY = animation.fireworks[0].y;

      animation.updateFireworks(0.016);

      // 位置应有变化
      expect(animation.fireworks[0].x).not.toBe(initialX);
      expect(animation.fireworks[0].y).not.toBe(initialY);
    });

    test('粒子速度衰减（乘以 0.98）', () => {
      const p = animation.fireworks[0];
      const initialVx = p.vx;
      const initialVy = p.vy;

      animation.updateFireworks(0.016);

      // 速度衰减后小于原速度
      expect(p.vx).not.toBe(initialVx);
      expect(p.vy).not.toBe(initialVy);
    });

    test('粒子透明度衰减', () => {
      const initialAlpha = animation.fireworks[0].alpha;

      animation.updateFireworks(1);

      expect(animation.fireworks[0].alpha).toBeLessThan(initialAlpha);
    });

    test('过滤掉 alpha <= 0 的粒子', () => {
      animation.fireworks[0].alpha = -0.1;

      animation.updateFireworks(0.016);

      // 第一个粒子被过滤
      expect(animation.fireworks.length).toBeLessThan(40);
    });

    test('粒子半径增大', () => {
      const initialRadius = animation.fireworks[0].radius;

      animation.updateFireworks(0.016);

      expect(animation.fireworks[0].radius).toBeGreaterThan(initialRadius);
    });
  });

  // ==================== update ====================

  describe('update', () => {
    test('active 为 true 时返回 true', () => {
      expect(animation.update(0.016)).toBe(true);
    });

    test('active 为 false 时返回 false', () => {
      animation.active = false;

      expect(animation.update(0.016)).toBe(false);
    });

    test('调用 updateFireworks', () => {
      const spyUpdateFireworks = jest.spyOn(animation, 'updateFireworks');

      animation.update(0.016);

      expect(spyUpdateFireworks).toHaveBeenCalledWith(0.016);
    });
  });

  // ==================== Scheduler 任务 ====================

  describe('spawn interval（每 600ms 生成烟花）', () => {
    test('600ms 后生成新一组烟花', () => {
      const beforeCount = animation.fireworks.length;

      scheduler.tick(0);
      scheduler.tick(600);

      expect(animation.fireworks.length).toBe(beforeCount + 40);
    });

    test('多次触发持续生成', () => {
      scheduler.tick(0);

      scheduler.tick(600);
      expect(animation.fireworks.length).toBe(80);

      scheduler.tick(1200);
      expect(animation.fireworks.length).toBe(120);
    });
  });

  describe('end delay（3 秒后结束）', () => {
    test('3 秒后调用 stop', () => {
      const spyStop = jest.spyOn(animation, 'stop');

      // delay 需要两次 tick
      scheduler.tick(0); // 记录 startTime
      scheduler.tick(3000); // 3000ms >= 3000ms → 执行

      expect(spyStop).toHaveBeenCalled();
    });
  });

  // ==================== stop ====================

  describe('stop', () => {
    test('设置 active 为 false', () => {
      animation.stop();

      expect(animation.active).toBe(false);
    });

    test('取消 spawn interval 和 end delay', () => {
      const spyCancel = jest.spyOn(scheduler, 'cancel');

      animation.stop();

      expect(spyCancel).toHaveBeenCalledTimes(2);
    });

    test('发射 audio:resume:bgm 事件', () => {
      const spyEmit = jest.spyOn(animation, 'emit');

      animation.stop();

      expect(spyEmit).toHaveBeenCalledWith('audio:resume:bgm', { level: 5 });
    });
  });

  // ==================== render ====================

  describe('render', () => {
    test('发射 render:level:up 事件', () => {
      const spyEmit = jest.spyOn(animation, 'emit');

      animation.render();

      expect(spyEmit).toHaveBeenCalledWith('ui:test-uuid-003:render:level:up', {
        level: 5,
        fireworks: animation.fireworks,
      });
    });
  });
});
