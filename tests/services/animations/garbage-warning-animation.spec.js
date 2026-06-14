/**
 * @file GarbageWarningAnimation 单元测试
 */

import GarbageWarningAnimation from '@/lib/services/animations/garbage-warning-animation.js';
import { UIEvents } from '@/lib/events/event-catalog.js';

jest.mock('@/lib/core', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
    this.emit = jest.fn();
  });
});

jest.mock('@/lib/events/event-catalog.js', () => ({
  UIEvents: jest.fn(() => ({
    RENDER_GARBAGE_WARNING: 'ui:test:render:garbage:warning',
  })),
}));

describe('GarbageWarningAnimation', () => {
  let anim;
  let mockGame;
  let mockScheduler;
  let mockBattle;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = { id: 'test-uuid' };
    mockScheduler = {
      sequence: jest.fn(() => [1, 2, 3, 4, 5]),
      cancel: jest.fn(),
    };
    mockBattle = {
      getRoundId: jest.fn(() => 1),
    };

    anim = new GarbageWarningAnimation({
      Game: mockGame,
      Scheduler: mockScheduler,
      roundId: 1,
      Battle: mockBattle,
    });
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    test('应该正确创建实例', () => {
      expect(anim).toBeDefined();
      expect(anim).toBeInstanceOf(GarbageWarningAnimation);
    });

    test('应该自动调用 initialize', () => {
      expect(mockScheduler.sequence).toHaveBeenCalled();
    });
  });

  // ==================== initialize ====================
  describe('initialize', () => {
    test('应该设置正确的动画属性', () => {
      expect(anim.layer).toBe(150);
      expect(anim.blocking).toBe(true);
      expect(anim.name).toBe('garbage-warning');
      expect(anim._finished).toBe(false);
    });

    test('应该初始化闪烁计数为 0', () => {
      expect(anim._flashes).toBe(0);
    });

    test('应该初始化可见状态为 true', () => {
      expect(anim._visible).toBe(true);
    });

    test('应该设置最大闪烁次数为 5', () => {
      expect(anim._maxFlashes).toBe(5);
    });

    test('应该启动 5 次闪烁序列（每次 120ms）', () => {
      expect(mockScheduler.sequence).toHaveBeenCalledWith([
        { fn: expect.any(Function), delay: 120 },
        { fn: expect.any(Function), delay: 120 },
        { fn: expect.any(Function), delay: 120 },
        { fn: expect.any(Function), delay: 120 },
        { fn: expect.any(Function), delay: 120 },
      ]);
    });
  });

  // ==================== 闪烁逻辑 ====================
  describe('闪烁逻辑', () => {
    test('每次 toggle 应该切换 visible 状态', () => {
      const tasks = mockScheduler.sequence.mock.calls[0][0];

      expect(anim._visible).toBe(true);
      tasks[0].fn();
      expect(anim._visible).toBe(false);
      tasks[1].fn();
      expect(anim._visible).toBe(true);
    });

    test('每次 toggle 应该递增 flashes 计数', () => {
      const tasks = mockScheduler.sequence.mock.calls[0][0];

      expect(anim._flashes).toBe(0);
      tasks[0].fn();
      expect(anim._flashes).toBe(1);
      tasks[1].fn();
      expect(anim._flashes).toBe(2);
    });

    test('5 次闪烁后应该标记 _finished 为 true', () => {
      const tasks = mockScheduler.sequence.mock.calls[0][0];

      tasks[0].fn();
      tasks[1].fn();
      tasks[2].fn();
      tasks[3].fn();
      expect(anim._finished).toBe(false);
      tasks[4].fn();
      expect(anim._finished).toBe(true);
    });

    test('第 5 次闪烁后 _visible 为 true', () => {
      const tasks = mockScheduler.sequence.mock.calls[0][0];

      tasks[4].fn();
      expect(anim._visible).toBe(false);
      expect(anim._finished).toBe(false);
    });
  });

  // ==================== render ====================
  describe('render', () => {
    test('可见帧应该发送 RENDER_GARBAGE_WARNING 事件', () => {
      anim._visible = true;
      anim.render();

      expect(anim.emit).toHaveBeenCalledWith('ui:test:render:garbage:warning');
    });

    test('不可见帧不应该发送事件', () => {
      anim._visible = false;
      anim.render();

      expect(anim.emit).not.toHaveBeenCalled();
    });

    test('应该使用正确的 Game id 获取事件', () => {
      anim._visible = true;
      anim.render();

      expect(UIEvents).toHaveBeenCalledWith('test-uuid');
    });

    test('roundId 不匹配时应该标记 _finished 并跳过渲染', () => {
      mockBattle.getRoundId.mockReturnValue(2); // 与 anim.roundId=1 不匹配
      anim._visible = true;
      anim.render();

      expect(anim._finished).toBe(true);
      expect(anim.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== dispose ====================
  describe('dispose', () => {
    test('应该取消所有 Scheduler 任务', () => {
      anim.dispose();

      expect(mockScheduler.cancel).toHaveBeenCalledTimes(5);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(1);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(2);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(3);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(4);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(5);
    });
  });

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('完整生命周期', () => {
      const tasks = mockScheduler.sequence.mock.calls[0][0];

      expect(anim._visible).toBe(true);
      expect(anim._flashes).toBe(0);
      expect(anim._finished).toBe(false);

      tasks.forEach((task) => task.fn());

      expect(anim._flashes).toBe(5);
      expect(anim._finished).toBe(true);

      anim.dispose();
      expect(mockScheduler.cancel).toHaveBeenCalledTimes(5);
    });

    test('render 在闪烁过程中的行为', () => {
      const tasks = mockScheduler.sequence.mock.calls[0][0];

      // flash 1: visible=true → 发送事件
      anim._visible = true;
      anim.emit.mockClear();
      anim.render();
      expect(anim.emit).toHaveBeenCalled();

      // toggle → visible=false → 不发送
      tasks[0].fn();
      anim.emit.mockClear();
      anim.render();
      expect(anim.emit).not.toHaveBeenCalled();

      // toggle → visible=true → 发送
      tasks[1].fn();
      anim.emit.mockClear();
      anim.render();
      expect(anim.emit).toHaveBeenCalled();
    });

    test('roundId 不匹配时动画自动过期', () => {
      mockBattle.getRoundId.mockReturnValue(2);
      anim.render();

      expect(anim._finished).toBe(true);
    });
  });
});
