import createAnimationSystem from '@/lib/runtime/animation-runtime';

describe('AnimationSystem', () => {
  let system;

  beforeEach(() => {
    system = createAnimationSystem();
  });

  // ========== register ==========
  describe('register', () => {
    test('注册有效动画', () => {
      const anim = {
        update: jest.fn(() => true),
        render: jest.fn(),
      };

      expect(() => system.register(anim)).not.toThrow();
    });

    test('缺少 update 或 render 方法时抛出错误', () => {
      expect(() => system.register(null)).toThrow('Invalid animation');
      expect(() => system.register({})).toThrow('Invalid animation');
      expect(() => system.register({ update: jest.fn() })).toThrow(
        'Invalid animation',
      );
      expect(() => system.register({ render: jest.fn() })).toThrow(
        'Invalid animation',
      );
    });

    test('为新动画添加默认属性', () => {
      const anim = {
        update: jest.fn(() => true),
        render: jest.fn(),
      };

      system.register(anim);
      system.update(0);

      expect(anim.layer).toBe(0);
      expect(anim.blocking).toBe(false);
      expect(anim.name).toBe('anonymous');
    });

    test('保留已有的自定义属性', () => {
      const anim = {
        name: 'my-anim',
        layer: 50,
        blocking: true,
        update: jest.fn(() => true),
        render: jest.fn(),
      };

      system.register(anim);
      system.update(0);

      expect(anim.name).toBe('my-anim');
      expect(anim.layer).toBe(50);
      expect(anim.blocking).toBe(true);
    });
  });

  // ========== update ==========
  describe('update', () => {
    test('调用每个动画的 update 方法', () => {
      const anim1 = { update: jest.fn(() => true), render: jest.fn() };
      const anim2 = { update: jest.fn(() => true), render: jest.fn() };

      system.register(anim1);
      system.register(anim2);
      system.update(0.016);

      expect(anim1.update).toHaveBeenCalledWith(0.016);
      expect(anim2.update).toHaveBeenCalledWith(0.016);
    });

    test('返回 false 的动画被自动移除', () => {
      const anim = { update: jest.fn(() => false), render: jest.fn() };

      system.register(anim);
      system.update(0);

      expect(system.size).toBe(0);
    });

    test('返回 true 的动画保留', () => {
      const anim = { update: jest.fn(() => true), render: jest.fn() };

      system.register(anim);
      system.update(0);

      expect(system.size).toBe(1);
    });

    test('混合存活和死亡的动画', () => {
      const alive = { update: jest.fn(() => true), render: jest.fn() };
      const dead = { update: jest.fn(() => false), render: jest.fn() };

      system.register(alive);
      system.register(dead);
      system.update(0);

      expect(system.size).toBe(1);
    });

    test('update 过程中新注册的动画被合并到下一帧', () => {
      const anim1 = {
        update: jest.fn(() => {
          system.register({ update: jest.fn(() => true), render: jest.fn() });
          return true;
        }),
        render: jest.fn(),
      };

      system.register(anim1);
      system.update(0);

      // 第二帧才会包含新注册的动画
      expect(system.size).toBe(2);
    });

    test('同一帧内多次 update 正确推进', () => {
      const anim = { update: jest.fn(() => true), render: jest.fn() };

      system.register(anim);
      system.update(0.1);
      system.update(0.2);

      expect(anim.update).toHaveBeenCalledTimes(2);
      expect(anim.update).toHaveBeenNthCalledWith(2, 0.2);
    });
  });

  // ========== render ==========
  describe('render', () => {
    test('调用每个动画的 render 方法', () => {
      const anim1 = { update: () => true, render: jest.fn() };
      const anim2 = { update: () => true, render: jest.fn() };

      system.register(anim1);
      system.register(anim2);
      system.update(0);
      system.render();

      expect(anim1.render).toHaveBeenCalledTimes(1);
      expect(anim2.render).toHaveBeenCalledTimes(1);
    });

    test('按 layer 从小到大排序渲染', () => {
      const order = [];

      const anim1 = {
        update: () => true,
        render: () => order.push(1),
        layer: 100,
      };
      const anim2 = {
        update: () => true,
        render: () => order.push(2),
        layer: 10,
      };
      const anim3 = {
        update: () => true,
        render: () => order.push(3),
        layer: 50,
      };

      system.register(anim1);
      system.register(anim2);
      system.register(anim3);
      system.update(0);
      system.render();

      expect(order).toEqual([2, 3, 1]); // layer 10 → 50 → 100
    });

    test('已清除的动画不在渲染', () => {
      const anim = { update: () => true, render: jest.fn() };

      system.register(anim);
      system.update(0);
      system.clear();
      system.render();

      expect(anim.render).not.toHaveBeenCalled();
    });

    test('渲染缓存：未变脏时不重新排序', () => {
      const anim = {
        update: jest.fn(() => true),
        render: jest.fn(),
        layer: 10,
      };

      system.register(anim);
      system.update(0);
      system.render();
      system.render(); // 第二次渲染不重新排序

      // 验证 render 被调了 2 次
      expect(anim.render).toHaveBeenCalledTimes(2);
    });
  });

  // ========== hasBlocking ==========
  describe('hasBlocking', () => {
    test('无阻塞动画时返回 false', () => {
      const anim = {
        update: () => true,
        render: () => {},
        blocking: false,
      };

      system.register(anim);
      system.update(0);

      expect(system.hasBlocking()).toBe(false);
    });

    test('有阻塞动画时返回 true', () => {
      const anim = {
        update: () => true,
        render: () => {},
        blocking: true,
      };

      system.register(anim);
      system.update(0);

      expect(system.hasBlocking()).toBe(true);
    });

    test('按名称过滤阻塞动画', () => {
      const anim1 = {
        name: 'countdown',
        update: () => true,
        render: () => {},
        blocking: true,
      };
      const anim2 = {
        name: 'level-up',
        update: () => true,
        render: () => {},
        blocking: true,
      };

      system.register(anim1);
      system.register(anim2);
      system.update(0);

      expect(system.hasBlocking(['countdown'])).toBe(true);
      expect(system.hasBlocking(['level-up'])).toBe(true);
      expect(system.hasBlocking(['explosion'])).toBe(false);
    });

    test('空数组视为检查所有阻塞动画', () => {
      const anim = {
        update: () => true,
        render: () => {},
        blocking: true,
      };

      system.register(anim);
      system.update(0);

      expect(system.hasBlocking([])).toBe(true);
      expect(system.hasBlocking()).toBe(true);
    });

    test('阻塞动画结束后不再阻塞', () => {
      const anim = {
        update: () => false,
        render: () => {},
        blocking: true,
      };

      system.register(anim);
      system.update(0);

      expect(system.hasBlocking()).toBe(false);
    });
  });

  // ========== clear ==========
  describe('clear', () => {
    test('清空所有动画', () => {
      system.register({ update: () => true, render: () => {} });
      system.register({ update: () => true, render: () => {} });
      system.update(0);

      expect(system.size).toBe(2);

      system.clear();
      expect(system.size).toBe(0);
    });

    test('清空后渲染不调任何动画', () => {
      const anim = { update: () => true, render: jest.fn() };

      system.register(anim);
      system.update(0);
      system.clear();
      system.render();

      expect(anim.render).not.toHaveBeenCalled();
    });

    test('清空后可以重新注册和使用', () => {
      const anim1 = { update: () => true, render: jest.fn() };

      system.register(anim1);
      system.update(0);
      system.clear();

      const anim2 = { update: () => true, render: jest.fn() };
      system.register(anim2);
      system.update(0);
      system.render();

      expect(anim2.render).toHaveBeenCalled();
    });
  });

  // ========== size ==========
  describe('size', () => {
    test('初始为 0', () => {
      expect(system.size).toBe(0);
    });

    test('注册后 size 包含 pending 中的动画', () => {
      system.register({ update: () => true, render: () => {} });
      expect(system.size).toBe(1);
    });

    test('update 后 size 正确反映活跃动画', () => {
      system.register({ update: () => true, render: () => {} });
      system.register({ update: () => false, render: () => {} });

      expect(system.size).toBe(2);
      system.update(0);
      expect(system.size).toBe(1);
    });
  });

  // ========== 完整场景 ==========
  describe('完整场景', () => {
    test('注册 → update → render → 清除', () => {
      const anim = {
        name: 'test',
        layer: 5,
        blocking: true,
        update: jest.fn(() => true),
        render: jest.fn(),
      };

      system.register(anim);
      expect(system.size).toBe(1);

      system.update(0.016);
      expect(anim.update).toHaveBeenCalledWith(0.016);

      system.render();
      expect(anim.render).toHaveBeenCalled();

      expect(system.hasBlocking(['test'])).toBe(true);

      system.clear();
      expect(system.size).toBe(0);
    });
  });
});
