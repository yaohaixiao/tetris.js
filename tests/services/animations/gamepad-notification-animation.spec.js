/**
 * @file GamepadNotificationAnimation 单元测试
 */

import GamepadNotificationAnimation from '@/lib/services/animations/gamepad-notification-animation.js';
import { UIEvents } from '@/lib/events/event-catalog.js';

jest.mock('@/lib/core', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
    this.emit = jest.fn();
  });
});

jest.mock('@/lib/events/event-catalog.js', () => ({
  UIEvents: jest.fn(() => ({
    RENDER_GAMEPAD_NOTIFICATION: 'ui:test:render:gamepad:notification',
  })),
  AudioEvents: jest.fn(() => ({
    PLAY_SOUND: 'audio:play:sound',
  })),
}));

describe('GamepadNotificationAnimation', () => {
  let anim;
  let mockGame;
  let mockScheduler;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = { id: 'test-uuid' };

    // Scheduler.sequence 不立即执行回调，保存供测试逐个手动触发
    mockScheduler = {
      sequence: jest.fn((tasks) => {
        const ids = [];
        tasks.forEach((task) => {
          mockScheduler._pendingCallbacks.push(task.fn);
          ids.push(mockScheduler._nextId++);
        });
        return ids;
      }),
      cancel: jest.fn(),
      _pendingCallbacks: [],
      _nextId: 1,
    };

    anim = new GamepadNotificationAnimation({
      Game: mockGame,
      Scheduler: mockScheduler,
      connected: true,
    });
  });

  /**
   * 执行 Scheduler 队列中的下一个待处理回调。
   * 每次只执行一个，模拟真实的时间推进。
   */
  const flushOneStep = () => {
    const fn = mockScheduler._pendingCallbacks.shift();
    if (fn) fn();
  };

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    test('应该正确创建实例', () => {
      expect(anim).toBeDefined();
      expect(anim).toBeInstanceOf(GamepadNotificationAnimation);
    });

    test('应该自动调用 initialize', () => {
      expect(mockScheduler.sequence).toHaveBeenCalled();
    });

    test('应该通过 Base 自动挂载 connected', () => {
      expect(anim.connected).toBe(true);
    });
  });

  // ==================== initialize ====================
  describe('initialize', () => {
    test('应该设置正确的动画属性', () => {
      expect(anim.layer).toBe(160);
      expect(anim.blocking).toBe(true);
      expect(anim.name).toBe('gamepad-notification');
      expect(anim._finished).toBe(false);
    });

    test('应该初始化闪烁计数为 0', () => {
      expect(anim._flashes).toBe(0);
    });

    test('应该初始化可见状态为 true', () => {
      expect(anim._visible).toBe(true);
    });

    test('应该设置最大闪烁次数为 6', () => {
      expect(anim._maxFlashes).toBe(6);
    });

    test('应该启动 6 次闪烁序列（每次 200ms）', () => {
      expect(mockScheduler.sequence).toHaveBeenCalledWith([
        { fn: expect.any(Function), delay: 200 },
        { fn: expect.any(Function), delay: 200 },
        { fn: expect.any(Function), delay: 200 },
        { fn: expect.any(Function), delay: 200 },
        { fn: expect.any(Function), delay: 200 },
        { fn: expect.any(Function), delay: 200 },
      ]);
    });

    test('应该播放 GAMEPAD_NOTIFY 音效', () => {
      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'GAMEPAD_NOTIFY',
      });
    });
  });

  // ==================== 闪烁逻辑 ====================
  describe('闪烁逻辑', () => {
    test('每次 toggle 应该切换 visible 状态', () => {
      expect(anim._visible).toBe(true);
      flushOneStep(); // 第 1 次
      expect(anim._visible).toBe(false);
      flushOneStep(); // 第 2 次
      expect(anim._visible).toBe(true);
    });

    test('每次 toggle 应该递增 flashes 计数', () => {
      expect(anim._flashes).toBe(0);
      flushOneStep();
      expect(anim._flashes).toBe(1);
      flushOneStep();
      expect(anim._flashes).toBe(2);
    });

    test('6 次闪烁后应该标记 _finished 为 true', () => {
      flushOneStep(); // 1
      flushOneStep(); // 2
      flushOneStep(); // 3
      flushOneStep(); // 4
      flushOneStep(); // 5
      expect(anim._finished).toBe(false);
      flushOneStep(); // 6
      expect(anim._finished).toBe(true);
    });

    test('第 6 次闪烁后 _visible 为 true', () => {
      for (let i = 0; i < 6; i++) {
        flushOneStep();
      }
      expect(anim._visible).toBe(true);
    });
  });

  // ==================== render ====================
  describe('render', () => {
    test('可见帧应该发送 RENDER_GAMEPAD_NOTIFICATION 事件', () => {
      anim._visible = true;
      anim.emit.mockClear();
      anim.render();

      expect(anim.emit).toHaveBeenCalledWith(
        'ui:test:render:gamepad:notification',
        { connected: true },
      );
    });

    test('不可见帧不应该发送事件', () => {
      anim._visible = false;
      anim.emit.mockClear();
      anim.render();

      expect(anim.emit).not.toHaveBeenCalled();
    });

    test('应该使用正确的 Game id 获取事件', () => {
      anim._visible = true;
      anim.render();

      expect(UIEvents).toHaveBeenCalledWith('test-uuid');
    });

    test('connected 为 false 时应该传递正确的参数', () => {
      const animDisconnected = new GamepadNotificationAnimation({
        Game: mockGame,
        Scheduler: mockScheduler,
        connected: false,
      });

      animDisconnected._visible = true;
      animDisconnected.emit.mockClear();
      animDisconnected.render();

      expect(animDisconnected.emit).toHaveBeenCalledWith(
        'ui:test:render:gamepad:notification',
        { connected: false },
      );
    });
  });

  // ==================== dispose ====================
  describe('dispose', () => {
    test('应该取消所有 Scheduler 任务', () => {
      anim.dispose();

      expect(mockScheduler.cancel).toHaveBeenCalledTimes(6);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(1);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(2);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(3);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(4);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(5);
      expect(mockScheduler.cancel).toHaveBeenCalledWith(6);
    });
  });

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('完整生命周期', () => {
      expect(anim._visible).toBe(true);
      expect(anim._flashes).toBe(0);
      expect(anim._finished).toBe(false);

      // 执行全部 6 次闪烁
      for (let i = 0; i < 6; i++) {
        flushOneStep();
      }

      expect(anim._flashes).toBe(6);
      expect(anim._finished).toBe(true);

      anim.dispose();
      expect(mockScheduler.cancel).toHaveBeenCalledTimes(6);
    });

    test('render 在闪烁过程中的行为', () => {
      // flash 1: visible=true → 发送事件
      anim._visible = true;
      anim.emit.mockClear();
      anim.render();
      expect(anim.emit).toHaveBeenCalledWith(
        'ui:test:render:gamepad:notification',
        { connected: true },
      );

      // toggle → visible=false → 不发送
      flushOneStep();
      anim.emit.mockClear();
      anim.render();
      expect(anim.emit).not.toHaveBeenCalled();

      // toggle → visible=true → 发送
      flushOneStep();
      anim.emit.mockClear();
      anim.render();
      expect(anim.emit).toHaveBeenCalledWith(
        'ui:test:render:gamepad:notification',
        { connected: true },
      );
    });

    test('动画与音效同步触发', () => {
      // 音效已在 initialize 中触发
      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'GAMEPAD_NOTIFY',
      });

      // 第 1 次闪烁：切换 visible → false
      flushOneStep();
      expect(anim._visible).toBe(false);

      // 第 2 次闪烁：切换 visible → true
      flushOneStep();
      expect(anim._visible).toBe(true);
      expect(anim._flashes).toBe(2);
    });

    test('connected 不同值的动画互不影响', () => {
      const animConnected = new GamepadNotificationAnimation({
        Game: mockGame,
        Scheduler: mockScheduler,
        connected: true,
      });

      const animDisconnected = new GamepadNotificationAnimation({
        Game: mockGame,
        Scheduler: mockScheduler,
        connected: false,
      });

      animConnected._visible = true;
      animDisconnected._visible = true;

      animConnected.emit.mockClear();
      animDisconnected.emit.mockClear();

      animConnected.render();
      animDisconnected.render();

      expect(animConnected.emit).toHaveBeenCalledWith(
        'ui:test:render:gamepad:notification',
        { connected: true },
      );
      expect(animDisconnected.emit).toHaveBeenCalledWith(
        'ui:test:render:gamepad:notification',
        { connected: false },
      );
    });
  });
});
