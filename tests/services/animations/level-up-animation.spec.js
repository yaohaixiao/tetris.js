import LevelUpAnimation from '@/lib/services/animations/level-up-animation';
import EventBus from '@/lib/core/event-bus';
import FIREWORK_COLORS from '@/lib/services/ui/constants/firework-colors';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/services/ui/constants/firework-colors.js', () => [
  '#ff0000',
  '#00ff00',
  '#0000ff',
]);

describe('LevelUpAnimation', () => {
  const mockCanvas = { width: 400, height: 600 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    Math.random.mockRestore();
  });

  // ========== 构造函数 ==========
  describe('constructor', () => {
    test('保存 level 和 canvas', () => {
      const anim = new LevelUpAnimation(mockCanvas, 5);

      expect(anim.level).toBe(5);
      expect(anim.canvas).toBe(mockCanvas);
    });

    test('初始化 fireworks 数组（40 个粒子）', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);

      expect(anim.fireworks).toHaveLength(40);
    });

    test('粒子位置基于 canvas 宽高', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const p = anim.fireworks[0];

      expect(p.x).toBe(200);
      expect(p.y).toBe(240);
    });

    test('设置默认属性', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);

      expect(anim.layer).toBe(100);
      expect(anim.blocking).toBe(true);
      expect(anim.name).toBe('level-up');
      expect(anim.duration).toBe(3);
      expect(anim.timer).toBe(0);
      expect(anim.spawnTimer).toBe(0);
    });
  });

  // ========== createFireworks ==========
  describe('createFireworks', () => {
    test('生成 40 个粒子', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      anim.fireworks = [];
      const particles = anim.createFireworks();
      expect(particles).toHaveLength(40);
    });

    test('每个粒子的 alpha 为 1', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      for (const p of anim.fireworks) {
        expect(p.alpha).toBe(1);
      }
    });

    test('粒子颜色来自 FIREWORK_COLORS', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      for (const p of anim.fireworks) {
        expect(FIREWORK_COLORS).toContain(p.color);
      }
    });

    test('粒子颜色是字符串', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      for (const p of anim.fireworks) {
        expect(typeof p.color).toBe('string');
        expect(p.color).toBeTruthy();
      }
    });

    test('Math.random 固定时粒子颜色可预测', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const firstColor = anim.fireworks[0].color;
      // Math.random = 0.5，index = floor(0.5 * 3) = 1 → '#00ff00'
      expect(firstColor).toBe('#00ff00');
      for (const p of anim.fireworks) {
        expect(p.color).toBe(firstColor);
      }
    });

    test('每个粒子有速度分量', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      for (const p of anim.fireworks) {
        expect(typeof p.vx).toBe('number');
        expect(typeof p.vy).toBe('number');
      }
    });
  });

  // ========== updateFireworks ==========
  describe('updateFireworks', () => {
    test('速度衰减', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const first = anim.fireworks[0];
      const origVx = first.vx;
      const origVy = first.vy;

      anim.updateFireworks(1);

      expect(anim.fireworks[0].vx).toBeCloseTo(origVx * 0.98);
      expect(anim.fireworks[0].vy).toBeCloseTo(origVy * 0.98 + 0.01);
    });

    test('位置更新', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const first = { ...anim.fireworks[0] };

      anim.updateFireworks(1);

      expect(anim.fireworks[0].x).not.toBe(first.x);
      expect(anim.fireworks[0].y).not.toBe(first.y);
    });

    test('alpha 衰减', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);

      anim.updateFireworks(1);
      expect(anim.fireworks[0].alpha).toBeLessThan(1);
    });

    test('半径增大', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const origRadius = anim.fireworks[0].radius;

      anim.updateFireworks(1);
      expect(anim.fireworks[0].radius).toBeGreaterThan(origRadius);
    });

    test('alpha <= 0 的粒子被过滤', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);

      for (const p of anim.fireworks) {
        p.alpha = 0;
      }

      anim.updateFireworks(0);
      expect(anim.fireworks).toHaveLength(0);
    });
  });

  // ========== update ==========
  describe('update', () => {
    test('timer 累加', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      anim.update(0.5);
      expect(anim.timer).toBeCloseTo(0.5);
    });

    test('spawnTimer 累加', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      anim.update(0.5);
      expect(anim.spawnTimer).toBeCloseTo(0.5);
    });

    test('每 0.6 秒生成新烟花', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const initialCount = anim.fireworks.length;

      anim.update(0.61);

      expect(anim.fireworks.length).toBeGreaterThan(initialCount);
      expect(anim.spawnTimer).toBe(0);
    });

    test('未达 0.6 秒不生成新烟花', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const initialCount = anim.fireworks.length;

      anim.update(0.5);
      expect(anim.fireworks.length).toBe(initialCount);
    });

    test('动画未结束时返回 true', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const result = anim.update(1);
      expect(result).toBe(true);
    });

    test('动画达到 duration 时返回 false', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const result = anim.update(3);
      expect(result).toBe(false);
    });

    test('动画结束时调用 stop', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      jest.spyOn(anim, 'stop');
      anim.update(3);
      expect(anim.stop).toHaveBeenCalledTimes(1);
    });

    test('多次生成烟花后粒子数量正确增长', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);

      anim.update(0.61);
      anim.update(0.61);
      anim.update(0.61);

      expect(anim.fireworks.length).toBeGreaterThan(40);
    });
  });

  // ========== stop ==========
  describe('stop', () => {
    test('发射 audio:play:bgm 事件', () => {
      const anim = new LevelUpAnimation(mockCanvas, 5);
      anim.stop();

      expect(EventBus.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 5,
      });
    });
  });

  // ========== render ==========
  describe('render', () => {
    test('发射 ui:render:level:up 事件', () => {
      const anim = new LevelUpAnimation(mockCanvas, 3);
      anim.render();

      expect(EventBus.emit).toHaveBeenCalledWith('ui:render:level:up', {
        level: 3,
        fireworks: expect.any(Array),
      });
    });

    test('传递的 fireworks 是当前粒子数组', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      anim.render();

      const call = EventBus.emit.mock.calls.find(
        (c) => c[0] === 'ui:render:level:up'
      );
      expect(call[1].fireworks).toBe(anim.fireworks);
    });
  });

  // ========== 完整生命周期 ==========
  describe('完整生命周期', () => {
    test('构造 → update 多次 → 自动 stop → 返回 false', () => {
      const anim = new LevelUpAnimation(mockCanvas, 2);

      let alive = true;
      let totalTime = 0;
      while (alive) {
        alive = anim.update(0.1);
        totalTime += 0.1;
      }

      expect(totalTime).toBeGreaterThanOrEqual(3);
      expect(EventBus.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 2,
      });
    });

    test('整个过程中 spawnTimer 周期性触发烟花生成', () => {
      const anim = new LevelUpAnimation(mockCanvas, 1);
      const initialCount = anim.fireworks.length;

      for (let i = 0; i < 21; i++) {
        anim.update(0.1);
      }

      expect(anim.fireworks.length).not.toBe(initialCount);
      expect(anim.spawnTimer).toBeLessThanOrEqual(0.6);
    });
  });
});
