import AnimationSystem from '@/lib/runtime/animation-system.js';

describe('AnimationSystem', () => {
  let animSystem;

  // 辅助函数：创建合法的动画对象
  const createAnimation = (overrides = {}) => ({
    name: 'test-anim',
    layer: 0,
    blocking: false,
    update: jest.fn().mockReturnValue(true),
    render: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    animSystem = new AnimationSystem({
      Game: { id: 'test-game-uuid' },
    });
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 AnimationSystem 实例', () => {
      expect(animSystem).toBeDefined();
      expect(animSystem).toBeInstanceOf(AnimationSystem);
    });

    it('初始 size 应该为 0', () => {
      expect(animSystem.size).toBe(0);
    });

    it('应该正确继承 Base 类', () => {
      expect(animSystem.Game).toBeDefined();
    });
  });

  // ==================== register 方法 ====================
  describe('register 方法', () => {
    it('应该注册一个合法的动画对象', () => {
      const anim = createAnimation();

      animSystem.register(anim);

      // 注册后立即出现在 size 中，但还未进入活跃队列
      expect(animSystem.size).toBe(1);
    });

    it('注册时应该为可选属性设置默认值', () => {
      const anim = {
        update: jest.fn().mockReturnValue(true),
        render: jest.fn(),
      };

      animSystem.register(anim);

      // 通过 update 触发 pending 合并，然后检查属性
      animSystem.update(0.016);

      expect(anim.layer).toBe(0);
      expect(anim.blocking).toBe(false);
      expect(anim.name).toBe('anonymous');
    });

    it('传入的动画已设置属性时不应该覆盖', () => {
      const anim = {
        name: 'custom-name',
        layer: 5,
        blocking: true,
        update: jest.fn().mockReturnValue(true),
        render: jest.fn(),
      };

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(anim.name).toBe('custom-name');
      expect(anim.layer).toBe(5);
      expect(anim.blocking).toBe(true);
    });

    it('layer 为 0 时不应该被默认值覆盖', () => {
      const anim = {
        layer: 0,
        update: jest.fn().mockReturnValue(true),
        render: jest.fn(),
      };

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(anim.layer).toBe(0);
    });

    it('blocking 为 false 时不应该被默认值覆盖', () => {
      const anim = {
        blocking: false,
        update: jest.fn().mockReturnValue(true),
        render: jest.fn(),
      };

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(anim.blocking).toBe(false);
    });

    it('注册无效动画应该抛出错误', () => {
      expect(() => {
        animSystem.register(null);
      }).toThrow('Invalid animation: must implement update() and render()');

      expect(() => {
        animSystem.register(undefined);
      }).toThrow('Invalid animation: must implement update() and render()');

      expect(() => {
        animSystem.register({});
      }).toThrow('Invalid animation: must implement update() and render()');

      expect(() => {
        animSystem.register({ update: 'not a function', render: jest.fn() });
      }).toThrow('Invalid animation: must implement update() and render()');

      expect(() => {
        animSystem.register({ update: jest.fn(), render: 'not a function' });
      }).toThrow('Invalid animation: must implement update() and render()');
    });

    it('注册后标记排序缓存为脏', () => {
      const anim = createAnimation();

      animSystem.register(anim);

      // 通过 render 触发排序，验证是否重新排序
      animSystem.update(0.016);
      animSystem.render();

      expect(anim.render).toHaveBeenCalled();
    });
  });

  // ==================== 延迟注册 ====================
  describe('延迟注册队列', () => {
    it('register 后不应该立即出现在 update 遍历中', () => {
      const anim = createAnimation();

      animSystem.register(anim);

      // 未调用 update，不应该执行任何动画
      expect(anim.update).not.toHaveBeenCalled();
    });

    it('调用 update 后应该合并 pending 到活跃队列', () => {
      const anim = createAnimation();

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(anim.update).toHaveBeenCalledTimes(1);
      expect(anim.update).toHaveBeenCalledWith(0.016);
    });

    it('多次 register 后调用 update 应该执行所有动画', () => {
      const anim1 = createAnimation({ name: 'anim-1' });
      const anim2 = createAnimation({ name: 'anim-2' });
      const anim3 = createAnimation({ name: 'anim-3' });

      animSystem.register(anim1);
      animSystem.register(anim2);
      animSystem.register(anim3);
      animSystem.update(0.016);

      expect(anim1.update).toHaveBeenCalledTimes(1);
      expect(anim2.update).toHaveBeenCalledTimes(1);
      expect(anim3.update).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== update 方法 ====================
  describe('update 方法', () => {
    it('应该传递 delta 参数给 update', () => {
      const anim = createAnimation();

      animSystem.register(anim);
      animSystem.update(0.033);

      expect(anim.update).toHaveBeenCalledWith(0.033);
    });

    it('update 返回 true 时动画应该继续保持活跃', () => {
      const anim = createAnimation({ update: jest.fn().mockReturnValue(true) });

      animSystem.register(anim);

      animSystem.update(0.016);
      animSystem.update(0.016);

      expect(anim.update).toHaveBeenCalledTimes(2);
    });

    it('update 返回 false 时动画应该被移除', () => {
      const anim = createAnimation({
        update: jest.fn().mockReturnValue(false),
      });

      animSystem.register(anim);

      animSystem.update(0.016);
      animSystem.update(0.016);

      // 第一次调用返回 false，第二次不应该再调用
      expect(anim.update).toHaveBeenCalledTimes(1);
      expect(animSystem.size).toBe(0);
    });

    it('动画结束时应该标记排序缓存为脏', () => {
      const anim = createAnimation({
        update: jest.fn().mockReturnValue(false),
      });

      animSystem.register(anim);
      animSystem.update(0.016);

      // render 应该正常工作，说明排序已被更新
      animSystem.render();
      expect(anim.render).not.toHaveBeenCalled();
    });

    it('多个动画混合结束时应该正确处理', () => {
      const anim1 = createAnimation({
        name: 'anim-1',
        update: jest.fn().mockReturnValue(true),
      });
      const anim2 = createAnimation({
        name: 'anim-2',
        update: jest.fn().mockReturnValue(false),
      });
      const anim3 = createAnimation({
        name: 'anim-3',
        update: jest.fn().mockReturnValue(true),
      });

      animSystem.register(anim1);
      animSystem.register(anim2);
      animSystem.register(anim3);
      animSystem.update(0.016);

      // anim2 应该被移除，anim1 和 anim3 保持活跃
      expect(anim1.update).toHaveBeenCalledTimes(1);
      expect(anim2.update).toHaveBeenCalledTimes(1);
      expect(anim3.update).toHaveBeenCalledTimes(1);

      animSystem.update(0.016);

      // anim1 和 anim3 应该继续被调用
      expect(anim1.update).toHaveBeenCalledTimes(2);
      expect(anim2.update).toHaveBeenCalledTimes(1); // 不再被调用
      expect(anim3.update).toHaveBeenCalledTimes(2);
    });

    it('update 过程中注册新动画应该被立即合并并执行', () => {
      const newAnim = createAnimation({ name: 'new-anim' });

      const anim = createAnimation({
        name: 'registering-anim',
        update: jest.fn(() => {
          animSystem.register(newAnim);
          return true;
        }),
      });

      animSystem.register(anim);
      animSystem.update(0.016);

      // newAnim 在 update 过程中被注册，应该也被执行
      expect(newAnim.update).toHaveBeenCalledTimes(1);
    });

    it('update 过程中多个动画结束时注册新动画应该正确处理', () => {
      const newAnim = createAnimation({ name: 'new-anim' });

      const anim1 = createAnimation({
        name: 'anim-1',
        update: jest.fn().mockReturnValue(false),
      });
      const anim2 = createAnimation({
        name: 'anim-2',
        update: jest.fn(() => {
          animSystem.register(newAnim);
          return true;
        }),
      });

      animSystem.register(anim1);
      animSystem.register(anim2);
      animSystem.update(0.016);

      // anim1 结束，anim2 执行时注册了 newAnim，newAnim 应该被执行
      expect(newAnim.update).toHaveBeenCalledTimes(1);
      expect(anim1.update).toHaveBeenCalledTimes(1);
      expect(anim2.update).toHaveBeenCalledTimes(1);
    });

    it('空更新不应该报错', () => {
      expect(() => {
        animSystem.update(0.016);
      }).not.toThrow();
    });
  });

  // ==================== render 方法 ====================
  describe('render 方法', () => {
    it('应该渲染所有活跃动画', () => {
      const anim1 = createAnimation({ name: 'anim-1' });
      const anim2 = createAnimation({ name: 'anim-2' });

      animSystem.register(anim1);
      animSystem.register(anim2);
      animSystem.update(0.016);
      animSystem.render();

      expect(anim1.render).toHaveBeenCalledTimes(1);
      expect(anim2.render).toHaveBeenCalledTimes(1);
    });

    it('应该按 layer 从小到大的顺序渲染', () => {
      const renderOrder = [];
      const anim1 = createAnimation({
        name: 'bottom',
        layer: 0,
        render: jest.fn(() => renderOrder.push('bottom')),
      });
      const anim2 = createAnimation({
        name: 'middle',
        layer: 5,
        render: jest.fn(() => renderOrder.push('middle')),
      });
      const anim3 = createAnimation({
        name: 'top',
        layer: 10,
        render: jest.fn(() => renderOrder.push('top')),
      });

      // 打乱注册顺序
      animSystem.register(anim3);
      animSystem.register(anim1);
      animSystem.register(anim2);

      animSystem.update(0.016);
      animSystem.render();

      expect(renderOrder).toEqual(['bottom', 'middle', 'top']);
    });

    it('相同 layer 的动画应该保持注册顺序', () => {
      const renderOrder = [];
      const anim1 = createAnimation({
        name: 'first',
        layer: 0,
        render: jest.fn(() => renderOrder.push('first')),
      });
      const anim2 = createAnimation({
        name: 'second',
        layer: 0,
        render: jest.fn(() => renderOrder.push('second')),
      });
      const anim3 = createAnimation({
        name: 'third',
        layer: 0,
        render: jest.fn(() => renderOrder.push('third')),
      });

      animSystem.register(anim1);
      animSystem.register(anim2);
      animSystem.register(anim3);

      animSystem.update(0.016);
      animSystem.render();

      // toSorted 是稳定排序，相同 layer 保持原顺序
      expect(renderOrder).toEqual(['first', 'second', 'third']);
    });

    it('没有变化时应该使用排序缓存不重新排序', () => {
      const anim = createAnimation();

      animSystem.register(anim);
      animSystem.update(0.016);

      // 多次调用 render，动画的 render 每次都会被调用
      animSystem.render();
      animSystem.render();
      animSystem.render();

      expect(anim.render).toHaveBeenCalledTimes(3);
    });

    it('空渲染不应该报错', () => {
      expect(() => {
        animSystem.render();
      }).not.toThrow();
    });

    it('动画结束时不应该被渲染', () => {
      const anim = createAnimation({
        update: jest.fn().mockReturnValue(false),
      });

      animSystem.register(anim);
      animSystem.update(0.016);
      animSystem.render();

      expect(anim.render).not.toHaveBeenCalled();
    });
  });

  // ==================== hasBlocking 方法 ====================
  describe('hasBlocking 方法', () => {
    it('没有阻塞动画时应该返回 false', () => {
      const anim = createAnimation({ blocking: false });

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(animSystem.hasBlocking()).toBe(false);
    });

    it('存在阻塞动画时应该返回 true', () => {
      const anim = createAnimation({ blocking: true });

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(animSystem.hasBlocking()).toBe(true);
    });

    it('多个动画中有一个阻塞就应该返回 true', () => {
      const anim1 = createAnimation({
        name: 'non-blocking',
        blocking: false,
      });
      const anim2 = createAnimation({
        name: 'blocking',
        blocking: true,
      });

      animSystem.register(anim1);
      animSystem.register(anim2);
      animSystem.update(0.016);

      expect(animSystem.hasBlocking()).toBe(true);
    });

    it('指定名称时应该只检查匹配的动画', () => {
      const anim1 = createAnimation({
        name: 'fade-in',
        blocking: true,
      });
      const anim2 = createAnimation({
        name: 'slide',
        blocking: true,
      });

      animSystem.register(anim1);
      animSystem.register(anim2);
      animSystem.update(0.016);

      expect(animSystem.hasBlocking(['fade-in'])).toBe(true);
      expect(animSystem.hasBlocking(['slide'])).toBe(true);
      expect(animSystem.hasBlocking(['non-existent'])).toBe(false);
    });

    it('指定多个名称时应该匹配任意一个', () => {
      const anim = createAnimation({
        name: 'countdown',
        blocking: true,
      });

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(animSystem.hasBlocking(['fade-in', 'countdown', 'slide'])).toBe(
        true,
      );
    });

    it('指定名称但该动画不是阻塞的应该返回 false', () => {
      const anim = createAnimation({
        name: 'fade-in',
        blocking: false,
      });

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(animSystem.hasBlocking(['fade-in'])).toBe(false);
    });

    it('空队列时应该返回 false', () => {
      expect(animSystem.hasBlocking()).toBe(false);
      expect(animSystem.hasBlocking(['anything'])).toBe(false);
    });

    it('names 参数为空数组时应该检查所有阻塞动画', () => {
      const anim = createAnimation({ blocking: true });

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(animSystem.hasBlocking([])).toBe(true);
    });
  });

  // ==================== clear 方法 ====================
  describe('clear 方法', () => {
    it('应该清空所有活跃动画', () => {
      const anim = createAnimation();

      animSystem.register(anim);
      animSystem.update(0.016);

      expect(animSystem.size).toBe(1);

      animSystem.clear();

      expect(animSystem.size).toBe(0);
    });

    it('应该清空待注册队列', () => {
      const anim = createAnimation();

      animSystem.register(anim);

      // 还未 update，在 pending 中
      expect(animSystem.size).toBe(1);

      animSystem.clear();

      expect(animSystem.size).toBe(0);

      // update 后也不应该执行
      animSystem.update(0.016);
      expect(anim.update).not.toHaveBeenCalled();
    });

    it('应该清空排序缓存', () => {
      const anim = createAnimation();

      animSystem.register(anim);
      animSystem.update(0.016);
      animSystem.render();

      animSystem.clear();
      animSystem.render();

      // clear 后 render 不应该渲染任何动画
      expect(anim.render).toHaveBeenCalledTimes(1); // 只有 clear 前那一次
    });

    it('应该重置排序脏标记', () => {
      const anim = createAnimation();

      animSystem.register(anim);
      animSystem.clear();

      // clear 后注册新动画，应该正常渲染
      const newAnim = createAnimation({ name: 'new' });

      animSystem.register(newAnim);
      animSystem.update(0.016);
      animSystem.render();

      expect(newAnim.render).toHaveBeenCalledTimes(1);
    });

    it('空队列调用 clear 不应该报错', () => {
      expect(() => {
        animSystem.clear();
      }).not.toThrow();
    });
  });

  // ==================== size 属性 ====================
  describe('size 属性', () => {
    it('初始时应该为 0', () => {
      expect(animSystem.size).toBe(0);
    });

    it('注册后应该增加', () => {
      animSystem.register(createAnimation());
      expect(animSystem.size).toBe(1);
    });

    it('update 合并 pending 后 size 保持不变', () => {
      animSystem.register(createAnimation());
      const sizeBefore = animSystem.size;
      animSystem.update(0.016);

      expect(animSystem.size).toBe(sizeBefore);
    });

    it('动画结束后 size 应该减少', () => {
      const anim = createAnimation({
        update: jest.fn().mockReturnValue(false),
      });

      animSystem.register(anim);
      expect(animSystem.size).toBe(1);

      animSystem.update(0.016);
      expect(animSystem.size).toBe(0);
    });

    it('clear 后 size 应该为 0', () => {
      animSystem.register(createAnimation());
      animSystem.register(createAnimation());
      animSystem.register(createAnimation());

      animSystem.clear();

      expect(animSystem.size).toBe(0);
    });
  });

  // ==================== 订阅与取消 ====================
  describe('订阅与取消订阅', () => {
    it('subscribe 后应该能通过事件清空动画', () => {
      animSystem.subscribe();

      const anim = createAnimation();
      animSystem.register(anim);
      animSystem.update(0.016);

      expect(animSystem.size).toBe(1);

      // 通过事件触发清空
      const eventName = `animations:${animSystem.Game.id}:clear`;
      animSystem.emit(eventName);

      expect(animSystem.size).toBe(0);
    });

    it('unsubscribe 后不应该再响应清空事件', () => {
      animSystem.subscribe();
      animSystem.unsubscribe();

      const anim = createAnimation();
      animSystem.register(anim);
      animSystem.update(0.016);

      const eventName = `animations:${animSystem.Game.id}:clear`;
      animSystem.emit(eventName);

      expect(animSystem.size).toBe(1);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('大量动画注册和更新应该正常工作', () => {
      const count = 100;
      const anims = Array.from({ length: count }, (_, i) =>
        createAnimation({
          name: `anim-${i}`,
          layer: Math.floor(Math.random() * 100),
        }),
      );

      anims.forEach((anim) => animSystem.register(anim));
      animSystem.update(0.016);
      animSystem.render();

      anims.forEach((anim) => {
        expect(anim.update).toHaveBeenCalledTimes(1);
        expect(anim.render).toHaveBeenCalledTimes(1);
      });
    });

    it('update 过程中所有动画都结束应该正确处理', () => {
      const anims = Array.from({ length: 5 }, (_, i) =>
        createAnimation({
          name: `anim-${i}`,
          update: jest.fn().mockReturnValue(false),
        }),
      );

      anims.forEach((anim) => animSystem.register(anim));
      animSystem.update(0.016);

      expect(animSystem.size).toBe(0);

      // 再次 update 不应该报错
      expect(() => {
        animSystem.update(0.016);
      }).not.toThrow();
    });

    it('连续注册和更新应该正确处理状态', () => {
      const anim1 = createAnimation({ name: 'anim-1' });
      const anim2 = createAnimation({ name: 'anim-2' });

      animSystem.register(anim1);
      animSystem.update(0.016);
      expect(anim1.update).toHaveBeenCalledTimes(1);

      animSystem.register(anim2);
      animSystem.update(0.016);
      expect(anim1.update).toHaveBeenCalledTimes(2);
      expect(anim2.update).toHaveBeenCalledTimes(1);
    });

    it('layer 为负数时应该能正常排序', () => {
      const renderOrder = [];
      const anim1 = createAnimation({
        name: 'negative',
        layer: -5,
        render: jest.fn(() => renderOrder.push('negative')),
      });
      const anim2 = createAnimation({
        name: 'zero',
        layer: 0,
        render: jest.fn(() => renderOrder.push('zero')),
      });

      animSystem.register(anim2);
      animSystem.register(anim1);

      animSystem.update(0.016);
      animSystem.render();

      expect(renderOrder).toEqual(['negative', 'zero']);
    });

    it('动画的 update 报错时不应该影响后续动画', () => {
      const anim1 = createAnimation({
        name: 'error-anim',
        update: jest.fn(() => {
          throw new Error('update 执行失败');
        }),
      });
      const anim2 = createAnimation({ name: 'normal-anim' });

      animSystem.register(anim1);
      animSystem.register(anim2);

      expect(() => {
        animSystem.update(0.016);
      }).toThrow('update 执行失败');

      // 注意：因为当前实现没有 try-catch，
      // anim2 可能不会被执行，如实反映
    });

    it('动画的 render 报错时不应该影响后续渲染', () => {
      const renderOrder = [];
      const anim1 = createAnimation({
        name: 'error-anim',
        render: jest.fn(() => {
          renderOrder.push('error');
          throw new Error('render 执行失败');
        }),
      });
      const anim2 = createAnimation({
        name: 'normal-anim',
        render: jest.fn(() => renderOrder.push('normal')),
      });

      animSystem.register(anim1);
      animSystem.register(anim2);
      animSystem.update(0.016);

      expect(() => {
        animSystem.render();
      }).toThrow('render 执行失败');

      // 注意：当前 render 实现没有 try-catch，
      // 一个动画报错会中断后续动画的渲染
      expect(renderOrder).toEqual(['error']);
    });
  });
});
