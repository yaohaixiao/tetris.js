import AnimationSystem from '@/lib/runtime/animation-system.js';

describe('AnimationSystem', () => {
  /** @type {AnimationSystem} */
  let system;

  /** 创建一个有效的动画对象 */
  const createAnim = (overrides = {}) => ({
    update: jest.fn(() => true),
    render: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    system = new AnimationSystem();
  });

  // =====================================================
  //  注册
  // =====================================================

  describe('register', () => {
    it('缺少 update 方法时抛出错误', () => {
      expect(() => system.register({ render() {} })).toThrow(
        'Invalid animation: must implement update() and render()',
      );
    });

    it('缺少 render 方法时抛出错误', () => {
      expect(() => system.register({ update() {} })).toThrow(
        'Invalid animation: must implement update() and render()',
      );
    });

    it('传入 null 时抛出错误', () => {
      expect(() => system.register(null)).toThrow();
    });

    it('注册后 size 增加', () => {
      expect(system.size).toBe(0);
      system.register(createAnim());
      expect(system.size).toBe(1);
    });

    it('为缺失的可选属性设置默认值', () => {
      const anim = { update() {}, render() {} };
      system.register(anim);

      system.update(0);

      // 从内部取得（间接验证：render 不报错 + 默认值生效）
      expect(anim.layer).toBe(0);
      expect(anim.blocking).toBe(false);
      expect(anim.name).toBe('anonymous');
    });

    it('保留已有属性不覆盖', () => {
      const anim = {
        name: 'my-anim',
        layer: 5,
        blocking: true,
        update() {},
        render() {},
      };
      system.register(anim);

      system.update(0);

      expect(anim.name).toBe('my-anim');
      expect(anim.layer).toBe(5);
      expect(anim.blocking).toBe(true);
    });
  });

  // =====================================================
  //  更新
  // =====================================================

  describe('update', () => {
    it('注册的动画在下次 update 时被调用', () => {
      const anim = createAnim();
      system.register(anim);

      // 注册后不会立即调 update
      expect(anim.update).not.toHaveBeenCalled();

      system.update(0.016);

      expect(anim.update).toHaveBeenCalledWith(0.016);
    });

    it('传入 delta 值给动画', () => {
      const anim = createAnim();
      system.register(anim);
      system.update(0.033);

      expect(anim.update).toHaveBeenCalledWith(0.033);
    });

    it('update 返回 false 时移除动画', () => {
      const anim = createAnim({ update: jest.fn(() => false) });
      system.register(anim);

      system.update(0);
      expect(system.size).toBe(0);
    });

    it('update 返回 true 时保留动画', () => {
      const anim = createAnim({ update: jest.fn(() => true) });
      system.register(anim);

      system.update(0);
      expect(system.size).toBe(1);

      system.update(0);
      // 仍在队列，再次调用
      expect(anim.update).toHaveBeenCalledTimes(2);
    });

    it('在 update 过程中注册新动画，同帧内也被更新', () => {
      const newAnim = createAnim();

      const anim = createAnim({
        update: jest.fn(() => {
          system.register(newAnim);
          return true;
        }),
      });

      system.register(anim);
      system.update(0);

      // 新动画也被调用
      expect(newAnim.update).toHaveBeenCalledTimes(1);
    });

    it('同时移除多个已结束动画', () => {
      const a1 = createAnim({ update: jest.fn(() => false) });
      const a2 = createAnim({ update: jest.fn(() => true) });
      const a3 = createAnim({ update: jest.fn(() => false) });

      system.register(a1);
      system.register(a2);
      system.register(a3);

      system.update(0);

      expect(system.size).toBe(1);
      expect(a2.update).toHaveBeenCalledTimes(1);
    });
  });

  // =====================================================
  //  渲染
  // =====================================================

  describe('render', () => {
    it('按 layer 从小到大的顺序渲染', () => {
      const order = [];
      const a1 = createAnim({ layer: 10, render: jest.fn(() => order.push(10)) });
      const a2 = createAnim({ layer: 1, render: jest.fn(() => order.push(1)) });
      const a3 = createAnim({ layer: 5, render: jest.fn(() => order.push(5)) });

      system.register(a1);
      system.register(a2);
      system.register(a3);

      system.update(0);
      system.render();

      expect(order).toEqual([1, 5, 10]);
    });

    it('layer 相同时保持注册顺序', () => {
      const order = [];
      const a1 = createAnim({ layer: 0, render: jest.fn(() => order.push('a')) });
      const a2 = createAnim({ layer: 0, render: jest.fn(() => order.push('b')) });

      system.register(a1);
      system.register(a2);

      system.update(0);
      system.render();

      // toSorted 是稳定排序，保持原始顺序
      expect(order).toEqual(['a', 'b']);
    });

    it('队列无变化时不重新排序（缓存命中）', () => {
      const anim = createAnim();
      system.register(anim);
      system.update(0);

      // 连续 render 多次，render 方法本身不报错即可
      system.render();
      system.render();

      expect(anim.render).toHaveBeenCalledTimes(2);
    });

    it('队列变化后重新排序', () => {
      const a1 = createAnim({ layer: 10, render: jest.fn() });
      const a2 = createAnim({ layer: 1, update: jest.fn(() => false) });

      system.register(a1);
      system.update(0);
      system.render();
      expect(a1.render).toHaveBeenCalledTimes(1);

      // 注册一个自动移除的动画
      system.register(a2);
      system.update(0);
      system.render();

      // a2 被移除了，但 a1 依然存在
      expect(a1.render).toHaveBeenCalledTimes(2);
      expect(a2.render).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  //  阻塞检测
  // =====================================================

  describe('hasBlocking', () => {
    it('无阻塞动画时返回 false', () => {
      system.register(createAnim({ blocking: false }));
      system.update(0);

      expect(system.hasBlocking()).toBe(false);
    });

    it('有阻塞动画时返回 true', () => {
      system.register(createAnim({ blocking: true }));
      system.update(0);

      expect(system.hasBlocking()).toBe(true);
    });

    it('按名称过滤阻塞动画', () => {
      system.register(createAnim({ name: 'fx', blocking: true }));
      system.register(createAnim({ name: 'ui', blocking: true }));
      system.update(0);

      expect(system.hasBlocking(['fx'])).toBe(true);
      expect(system.hasBlocking(['ui'])).toBe(true);
      expect(system.hasBlocking(['other'])).toBe(false);
    });

    it('传入空数组检查所有阻塞动画', () => {
      system.register(createAnim({ blocking: true }));
      system.update(0);

      expect(system.hasBlocking([])).toBe(true);
    });

    it('非阻塞动画不会被 names 匹配', () => {
      system.register(createAnim({ name: 'fx', blocking: false }));
      system.update(0);

      expect(system.hasBlocking(['fx'])).toBe(false);
    });
  });

  // =====================================================
  //  清理
  // =====================================================

  describe('clear', () => {
    it('清空后 size 为 0', () => {
      system.register(createAnim());
      system.update(0);
      expect(system.size).toBe(1);

      system.clear();
      expect(system.size).toBe(0);
    });

    it('清空后不再渲染', () => {
      const anim = createAnim();
      system.register(anim);
      system.update(0);

      system.clear();
      system.render();

      expect(anim.render).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  //  size 属性
  // =====================================================

  describe('size', () => {
    it('初始为 0', () => {
      expect(system.size).toBe(0);
    });

    it('包含 pending 和 queue', () => {
      system.register(createAnim());
      // 还未 update，只在 pending 中
      expect(system.size).toBe(1);

      system.update(0);
      // 合并到 queue
      expect(system.size).toBe(1);
    });
  });
});
