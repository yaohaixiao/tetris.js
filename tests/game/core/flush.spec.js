/** @file Game.flush 单元测试 */

import flush from '@/lib/game/core/flush.js';
import tick from '@/lib/game/logic/tick.js';

jest.mock('@/lib/game/logic/tick.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('flush', () => {
  // ==================== 辅助函数 ====================

  const makeRuntime = (overrides = {}) => ({
    UI: {
      tickHud: jest.fn(),
      render: jest.fn(),
    },
    Replay: {
      playing: false,
      syncPlayElapsed: jest.fn(),
      update: jest.fn(),
    },
    Gamepad: { update: jest.fn() },
    Keyboard: { update: jest.fn() },
    Animations: {
      hasBlocking: jest.fn(() => false),
      flush: jest.fn(),
      render: jest.fn(),
    },
    CommandQueue: { flush: jest.fn() },
    getSpeed: jest.fn(() => 1000),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== 基础调用验证 ====================

  describe('基础调用验证', () => {
    test('应该调用 Animations.hasBlocking 检查阻塞状态', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      flush(runtime, 1000, 1000, accumulators);

      expect(runtime.Animations.hasBlocking).toHaveBeenCalled();
    });

    test('应该调用 Replay.syncPlayElapsed 同步回放时钟', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();
      runtime.Animations.hasBlocking.mockReturnValue(true);

      flush(runtime, 2000, 1500, accumulators);

      expect(runtime.Replay.syncPlayElapsed).toHaveBeenCalledWith({
        timestamp: 1500,
        isBlocked: true,
      });
    });

    test('应该调用 Replay.update 更新回放系统', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();
      runtime.getSpeed.mockReturnValue(500);

      flush(runtime, 3000, 2500, accumulators);

      expect(runtime.Replay.update).toHaveBeenCalledWith({
        speed: 500,
        timestamp: 2500,
      });
    });

    test('应该调用 Gamepad.update 更新手柄输入', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      flush(runtime, 1000, 1000, accumulators);

      expect(runtime.Gamepad.update).toHaveBeenCalledWith(1000);
    });

    test('应该调用 Keyboard.update 更新键盘输入', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      flush(runtime, 1000, 1000, accumulators);

      expect(runtime.Keyboard.update).toHaveBeenCalled();
    });

    test('应该调用 CommandQueue.flush 执行命令队列', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      flush(runtime, 1000, 1000, accumulators);

      expect(runtime.CommandQueue.flush).toHaveBeenCalled();
    });

    test('应该调用 Animations.flush 清理动画队列', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      flush(runtime, 1000, 1000, accumulators);

      expect(runtime.Animations.flush).toHaveBeenCalled();
    });

    test('应该调用 UI.tickHud 更新 HUD 动画', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      flush(runtime, 1000, 1000, accumulators);

      expect(runtime.UI.tickHud).toHaveBeenCalled();
    });

    test('应该调用 UI.render 渲染游戏画面', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      flush(runtime, 1000, 1000, accumulators);

      expect(runtime.UI.render).toHaveBeenCalled();
    });

    test('应该调用 Animations.render 渲染动画特效', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      flush(runtime, 1000, 1000, accumulators);

      expect(runtime.Animations.render).toHaveBeenCalled();
    });
  });

  // ==================== 可选设备容错 ====================

  describe('可选设备容错', () => {
    test('缺少 Gamepad 时不应报错', () => {
      const runtime = makeRuntime();
      delete runtime.Gamepad;
      const accumulators = new Map();

      expect(() => flush(runtime, 1000, 1000, accumulators)).not.toThrow();
    });

    test('缺少 Keyboard 时不应报错', () => {
      const runtime = makeRuntime();
      delete runtime.Keyboard;
      const accumulators = new Map();

      expect(() => flush(runtime, 1000, 1000, accumulators)).not.toThrow();
    });

    test('同时缺少 Gamepad 和 Keyboard 时不应报错', () => {
      const runtime = makeRuntime();
      delete runtime.Gamepad;
      delete runtime.Keyboard;
      const accumulators = new Map();

      expect(() => flush(runtime, 1000, 1000, accumulators)).not.toThrow();
    });
  });

  // ==================== 游戏逻辑更新条件 ====================

  describe('游戏逻辑更新条件', () => {
    test('超过速度间隔时应该调用 tick', () => {
      const runtime = makeRuntime();
      runtime.getSpeed.mockReturnValue(100);
      const accumulators = new Map();
      accumulators.set(runtime, 1000);

      flush(runtime, 1200, 1200, accumulators);

      expect(tick).toHaveBeenCalledWith(runtime, false);
      expect(accumulators.get(runtime)).toBe(1200);
    });

    test('未超过速度间隔时不应该调用 tick', () => {
      const runtime = makeRuntime();
      runtime.getSpeed.mockReturnValue(1000);
      const accumulators = new Map();
      accumulators.set(runtime, 1000);

      flush(runtime, 1500, 1500, accumulators);

      expect(tick).not.toHaveBeenCalled();
    });

    test('accumulator 不存在时使用 timestamp 作为默认值', () => {
      const runtime = makeRuntime();
      runtime.getSpeed.mockReturnValue(200);
      const accumulators = new Map();
      // 不预先设置 accumulator，get 返回 undefined

      flush(runtime, 1000, 1000, accumulators);

      // accumulator = undefined || 1000 = 1000，stepDelta = 0，不大于 200，不调用 tick
      // 但 !accumulator 为 false（1000 是真值），也不满足条件
      // 所以 tick 不会被调用
      expect(tick).not.toHaveBeenCalled();
    });

    test('回放中不应该执行 tick', () => {
      const runtime = makeRuntime();
      runtime.Replay.playing = true;
      runtime.getSpeed.mockReturnValue(100);
      const accumulators = new Map();
      accumulators.set(runtime, 1000);

      flush(runtime, 1200, 1200, accumulators);

      expect(tick).not.toHaveBeenCalled();
    });

    test('阻塞动画期间 tick 应该传入 isBlocked=true', () => {
      const runtime = makeRuntime();
      runtime.Animations.hasBlocking.mockReturnValue(true);
      runtime.getSpeed.mockReturnValue(100);
      const accumulators = new Map();
      accumulators.set(runtime, 1000);

      flush(runtime, 1200, 1200, accumulators);

      expect(tick).toHaveBeenCalledWith(runtime, true);
    });

    test('stepDelta 大于 speed 时应该执行 tick', () => {
      const runtime = makeRuntime();
      runtime.getSpeed.mockReturnValue(200);
      const accumulators = new Map();
      accumulators.set(runtime, 1000);

      flush(runtime, 1201, 1201, accumulators);

      expect(tick).toHaveBeenCalledWith(runtime, false);
      expect(accumulators.get(runtime)).toBe(1201);
    });

    test('stepDelta 等于 speed 时不应执行 tick（严格大于）', () => {
      const runtime = makeRuntime();
      runtime.getSpeed.mockReturnValue(200);
      const accumulators = new Map();
      accumulators.set(runtime, 1000);

      flush(runtime, 1200, 1200, accumulators);

      expect(tick).not.toHaveBeenCalled();
    });
  });

  // ==================== 执行顺序 ====================

  describe('执行顺序', () => {
    test('步骤应该按正确顺序执行', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();
      const callOrder = [];

      runtime.Animations.hasBlocking.mockImplementation(() => {
        callOrder.push('hasBlocking');
        return false;
      });
      runtime.Replay.syncPlayElapsed.mockImplementation(() =>
        callOrder.push('syncPlayElapsed'),
      );
      runtime.Replay.update.mockImplementation(() =>
        callOrder.push('replayUpdate'),
      );
      runtime.Gamepad.update.mockImplementation(() =>
        callOrder.push('gamepadUpdate'),
      );
      runtime.Keyboard.update.mockImplementation(() =>
        callOrder.push('keyboardUpdate'),
      );
      runtime.CommandQueue.flush.mockImplementation(() =>
        callOrder.push('commandQueue'),
      );
      runtime.Animations.flush.mockImplementation(() =>
        callOrder.push('animationsFlush'),
      );
      runtime.UI.tickHud.mockImplementation(() => callOrder.push('tickHud'));
      runtime.UI.render.mockImplementation(() => callOrder.push('render'));
      runtime.Animations.render.mockImplementation(() =>
        callOrder.push('animationsRender'),
      );

      flush(runtime, 1000, 1000, accumulators);

      expect(callOrder.indexOf('hasBlocking')).toBeLessThan(
        callOrder.indexOf('syncPlayElapsed'),
      );
      expect(callOrder.indexOf('commandQueue')).toBeLessThan(
        callOrder.indexOf('animationsFlush'),
      );
      expect(callOrder.indexOf('animationsFlush')).toBeLessThan(
        callOrder.indexOf('tickHud'),
      );
      expect(callOrder.indexOf('tickHud')).toBeLessThan(
        callOrder.indexOf('render'),
      );
      expect(callOrder.indexOf('render')).toBeLessThan(
        callOrder.indexOf('animationsRender'),
      );
    });
  });

  // ==================== 累积器独立性 ====================

  describe('累积器独立性', () => {
    test('多个 runtime 应该使用各自的累积器', () => {
      const rt1 = makeRuntime();
      const rt2 = makeRuntime();
      rt1.getSpeed.mockReturnValue(100);
      rt2.getSpeed.mockReturnValue(1000);
      const accumulators = new Map();
      accumulators.set(rt1, 1000);
      accumulators.set(rt2, 1000);

      flush(rt1, 1200, 1200, accumulators);

      expect(tick).toHaveBeenCalledWith(rt1, false);
      expect(accumulators.get(rt1)).toBe(1200);
      expect(accumulators.get(rt2)).toBe(1000);
    });

    test('每个 runtime 的累积器互不影响', () => {
      const rt1 = makeRuntime();
      const rt2 = makeRuntime();
      rt1.getSpeed.mockReturnValue(100);
      rt2.getSpeed.mockReturnValue(100);
      const accumulators = new Map();
      accumulators.set(rt1, 1000);
      accumulators.set(rt2, 1000);

      flush(rt1, 1200, 1200, accumulators);

      // rt1 更新了，rt2 不变
      expect(accumulators.get(rt1)).toBe(1200);
      expect(accumulators.get(rt2)).toBe(1000);

      flush(rt2, 1200, 1200, accumulators);

      // rt2 也更新了
      expect(accumulators.get(rt2)).toBe(1200);
    });
  });

  // ==================== 边界情况 ====================

  describe('边界情况', () => {
    test('极短时间间隔（1ms）不应执行 tick', () => {
      const runtime = makeRuntime();
      runtime.getSpeed.mockReturnValue(1000);
      const accumulators = new Map();
      accumulators.set(runtime, 1000);

      flush(runtime, 1001, 1001, accumulators);

      expect(tick).not.toHaveBeenCalled();
    });

    test('极长时间间隔应执行 tick', () => {
      const runtime = makeRuntime();
      runtime.getSpeed.mockReturnValue(1000);
      const accumulators = new Map();
      accumulators.set(runtime, 1000);

      flush(runtime, 3601000, 3601000, accumulators);

      expect(tick).toHaveBeenCalledWith(runtime, false);
    });

    test('timestamp 为 0 时不应报错', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      expect(() => flush(runtime, 0, 0, accumulators)).not.toThrow();
    });

    test('accumulators 为空 Map 时不应报错', () => {
      const runtime = makeRuntime();
      const accumulators = new Map();

      expect(() => flush(runtime, 1000, 1000, accumulators)).not.toThrow();
    });
  });
});
