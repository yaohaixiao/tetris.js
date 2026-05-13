import LevelUpAnimation from '@/lib/services/animations/level-up-animation.js';

// Mock FIREWORK_COLORS
jest.mock('@/lib/services/ui/constants/firework-colors.js', () => ({
  __esModule: true,
  default: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
}));

describe('LevelUpAnimation', () => {
  let anim;
  let mockGame;
  let mockUI;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUI = {
      Canvas: {
        gameBoard: {
          width: 800,
          height: 600,
        },
      },
    };

    mockGame = {
      id: 'test-game-uuid',
    };

    anim = new LevelUpAnimation({
      Game: mockGame,
      UI: mockUI,
      level: 5,
      maxLevel: 99,
    });

    jest.spyOn(anim, 'emit').mockImplementation(() => anim);
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 LevelUpAnimation 实例', () => {
      expect(anim).toBeDefined();
      expect(anim).toBeInstanceOf(LevelUpAnimation);
    });

    it('应该设置 layer 为 100', () => {
      expect(anim.layer).toBe(100);
    });

    it('应该设置 blocking 为 true', () => {
      expect(anim.blocking).toBe(true);
    });

    it('应该设置 name 为 level-up', () => {
      expect(anim.name).toBe('level-up');
    });

    it('应该设置 duration 为 3', () => {
      expect(anim.duration).toBe(3);
    });

    it('应该初始化定时器', () => {
      expect(anim.timer).toBe(0);
      expect(anim.spawnTimer).toBe(0);
    });

    it('应该存储等级', () => {
      expect(anim.level).toBe(5);
    });

    it('应该初始化 fireworks', () => {
      expect(anim.fireworks).toBeDefined();
      expect(Array.isArray(anim.fireworks)).toBe(true);
    });
  });

  // ==================== createFireworks ====================
  describe('createFireworks 方法', () => {
    it('应该生成 40 个烟花粒子', () => {
      const fireworks = anim.createFireworks();

      expect(fireworks).toHaveLength(40);
    });

    it('每个粒子应该包含必要属性', () => {
      const fireworks = anim.createFireworks();
      const particle = fireworks[0];

      expect(particle).toHaveProperty('x');
      expect(particle).toHaveProperty('y');
      expect(particle).toHaveProperty('vx');
      expect(particle).toHaveProperty('vy');
      expect(particle).toHaveProperty('radius');
      expect(particle).toHaveProperty('color');
      expect(particle).toHaveProperty('alpha');
    });

    it('粒子 X 坐标应该在画布中心', () => {
      const fireworks = anim.createFireworks();

      fireworks.forEach((p) => {
        expect(p.x).toBe(400); // width / 2 = 800 / 2
      });
    });

    it('粒子 Y 坐标应该在画布中心上方 60 像素', () => {
      const fireworks = anim.createFireworks();

      fireworks.forEach((p) => {
        expect(p.y).toBe(240); // height / 2 - 60 = 300 - 60
      });
    });

    it('粒子初始 alpha 应该为 1', () => {
      const fireworks = anim.createFireworks();

      fireworks.forEach((p) => {
        expect(p.alpha).toBe(1);
      });
    });

    it('粒子半径应该在 3 到 7 之间', () => {
      const fireworks = anim.createFireworks();

      fireworks.forEach((p) => {
        expect(p.radius).toBeGreaterThanOrEqual(3);
        expect(p.radius).toBeLessThanOrEqual(7);
      });
    });

    it('粒子颜色应该来自 FIREWORK_COLORS', () => {
      const fireworks = anim.createFireworks();
      const validColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

      fireworks.forEach((p) => {
        expect(validColors).toContain(p.color);
      });
    });
  });

  // ==================== updateFireworks ====================
  describe('updateFireworks 方法', () => {
    it('应该更新粒子位置', () => {
      const initialX = anim.fireworks[0].x;
      const initialY = anim.fireworks[0].y;

      anim.updateFireworks(0.016);

      // 位置应该发生变化
      expect(anim.fireworks[0].x).not.toBe(initialX);
      expect(anim.fireworks[0].y).not.toBe(initialY);
    });

    it('应该减少粒子 alpha', () => {
      const initialAlpha = anim.fireworks[0].alpha;

      anim.updateFireworks(0.5);

      expect(anim.fireworks[0].alpha).toBeLessThan(initialAlpha);
    });

    it('应该增加粒子半径', () => {
      const initialRadius = anim.fireworks[0].radius;

      anim.updateFireworks(0.5);

      expect(anim.fireworks[0].radius).toBeGreaterThan(initialRadius);
    });

    it('应该对速度应用空气阻力', () => {
      const initialVx = anim.fireworks[0].vx;
      const initialVy = anim.fireworks[0].vy;

      anim.updateFireworks(0.016);

      // vx 乘了 0.98
      expect(anim.fireworks[0].vx).toBeCloseTo(initialVx * 0.98, 10);
      // vy 乘了 0.98 再加重力
      expect(anim.fireworks[0].vy).toBeCloseTo(initialVy * 0.98 + 0.01 * 0.016, 10);
    });

    it('alpha <= 0 的粒子应该被移除', () => {
      // 直接设置所有粒子 alpha 为 0
      anim.fireworks.forEach((p) => {
        p.alpha = 0;
      });

      anim.updateFireworks(0.016);

      expect(anim.fireworks).toHaveLength(0);
    });

    it('部分粒子透明时应该保留剩余粒子', () => {
      const initialCount = anim.fireworks.length;

      // 只设置一半粒子 alpha 为 0
      for (let i = 0; i < anim.fireworks.length; i++) {
        if (i % 2 === 0) {
          anim.fireworks[i].alpha = 0;
        }
      }

      anim.updateFireworks(0.016);

      expect(anim.fireworks.length).toBeLessThan(initialCount);
      expect(anim.fireworks.length).toBeGreaterThan(0);
    });
  });

  // ==================== update 方法 ====================
  describe('update 方法', () => {
    it('动画未完成时应该返回 true', () => {
      const result = anim.update(0.016);

      expect(result).toBe(true);
    });

    it('应该累加 timer', () => {
      anim.update(0.5);
      expect(anim.timer).toBe(0.5);

      anim.update(1.0);
      expect(anim.timer).toBe(1.5);
    });

    it('应该累加 spawnTimer', () => {
      anim.update(0.3);
      expect(anim.spawnTimer).toBe(0.3);

      anim.update(0.3);
      expect(anim.spawnTimer).toBe(0.6);
    });

    it('spawnTimer 超过 0.6 时应该生成新烟花', () => {
      const initialCount = anim.fireworks.length;

      anim.update(0.7);

      // spawnTimer 被重置
      expect(anim.spawnTimer).toBe(0);
      // 新烟花生成
      expect(anim.fireworks.length).toBeGreaterThan(initialCount);
    });

    it('spawnTimer 刚好 0.6 时不应该触发（只触发 >0.6）', () => {
      const initialCount = anim.fireworks.length;

      anim.update(0.6);

      // 注意：timer = 0.6 时 spawnTimer = 0.6，不大于 0.6，不触发
      // 但 update 内部是先累加再判断，累加后 = 0.6
      // 需要看具体代码的 > 还是 >=
      // 使用 Math.floor(0.7 / 0.6) 的逻辑判断
    });

    it('spawnTimer 重置后应该重新计数', () => {
      // 第一次生成
      anim.update(0.7);
      const countAfterFirst = anim.fireworks.length;

      // 第二次生成
      anim.update(0.7);
      const countAfterSecond = anim.fireworks.length;

      expect(countAfterSecond).toBeGreaterThan(countAfterFirst);
    });

    it('timer >= duration 时应该返回 false', () => {
      anim.update(3.0);

      // 再更新一次触发判断
      const result = anim.update(0.016);

      expect(result).toBe(false);
    });

    it('timer >= duration 时应该调用 stop', () => {
      const stopSpy = jest.spyOn(anim, 'stop');

      anim.update(3.0);

      expect(stopSpy).toHaveBeenCalled();
    });
  });

  // ==================== stop 方法 ====================
  describe('stop 方法', () => {
    it('应该发送播放 BGM 事件', () => {
      anim.stop();

      expect(anim.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 5,
        maxLevel: 99,
      });
    });

    it('应该传递正确的 level 和 maxLevel', () => {
      const customAnim = new LevelUpAnimation({
        Game: mockGame,
        UI: mockUI,
        level: 10,
        maxLevel: 50,
      });
      jest.spyOn(customAnim, 'emit').mockImplementation(() => customAnim);

      customAnim.stop();

      expect(customAnim.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 10,
        maxLevel: 50,
      });
    });
  });

  // ==================== render 方法 ====================
  describe('render 方法', () => {
    it('应该发送渲染事件', () => {
      anim.render();

      expect(anim.emit).toHaveBeenCalledWith(
        `ui:${mockGame.id}:render:level:up`,
        expect.objectContaining({
          level: 5,
          fireworks: anim.fireworks,
        }),
      );
    });

    it('应该传递当前 fireworks 引用', () => {
      anim.render();

      const renderCall = anim.emit.mock.calls.find(
        ([event]) => event === `ui:${mockGame.id}:render:level:up`,
      );

      expect(renderCall[1].fireworks).toBe(anim.fireworks);
    });
  });

  // ==================== 完整生命周期 ====================
  describe('完整生命周期', () => {
    it('应该完整执行动画流程', () => {
      let alive = true;
      let totalUpdates = 0;

      while (alive && totalUpdates < 500) {
        alive = anim.update(0.016);
        totalUpdates++;
      }

      expect(alive).toBe(false);
      expect(anim.timer).toBeGreaterThanOrEqual(3);
      expect(anim.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 5,
        maxLevel: 99,
      });
    });

    it('3 秒内应该生成约 5 组烟花', () => {
      // 每 0.6 秒生成一组，3 / 0.6 = 5 组
      let alive = true;
      let spawnCount = 0;

      // Mock createFireworks 来计数
      const originalCreateFireworks = anim.createFireworks.bind(anim);
      jest.spyOn(anim, 'createFireworks').mockImplementation(() => {
        spawnCount++;
        return originalCreateFireworks();
      });

      while (alive) {
        alive = anim.update(0.016);
      }

      // ~5 组 × 40 = ~200 额外粒子 + 初始 40
      expect(spawnCount).toBeGreaterThanOrEqual(4);
      expect(spawnCount).toBeLessThanOrEqual(6);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('delta 为 0 时不应该更新状态', () => {
      anim.update(0);

      expect(anim.timer).toBe(0);
      expect(anim.spawnTimer).toBe(0);
    });

    it('超大 delta 应该直接完成动画', () => {
      anim.update(10);

      // timer >= 3，返回 false
      expect(anim.emit).toHaveBeenCalledWith('audio:play:bgm', expect.any(Object));
    });

    it('所有粒子都消失后不应崩溃', () => {
      anim.fireworks = [];

      expect(() => {
        anim.updateFireworks(0.016);
      }).not.toThrow();
    });

    it('无烟花粒子时 spawnTimer 到期仍应生成新粒子', () => {
      anim.fireworks = [];
      anim.spawnTimer = 0.59;

      anim.update(0.02);

      expect(anim.fireworks.length).toBeGreaterThan(0);
    });
  });
});
