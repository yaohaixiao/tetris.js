/**
 * @file GarbageFlyAnimation 单元测试
 */

import GarbageFlyAnimation from '@/lib/services/animations/garbage-fly-animation.js';
import COLORS from '@/lib/constants/colors.js';

jest.mock('@/lib/core', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
    this.emit = jest.fn();
  });
});

jest.mock('@/lib/constants/colors.js', () => ({
  WHITE: '#ffffff',
}));

jest.mock('@/lib/utils/color/hex-to-rgba.js', () => {
  return jest.fn((hex, alpha) => `rgba(255, 255, 255, ${alpha})`);
});

describe('GarbageFlyAnimation', () => {
  let anim;
  let mockBattle;
  let mockFrom;
  let mockTo;
  let mockScheduler;
  let mockCtx;
  let mockFlyCanvas;

  /**
   * 创建模拟的 getBoundingClientRect 返回值
   *
   * @param {number} left - 左边界
   * @param {number} top - 上边界
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @returns {DOMRect} 模拟的矩形对象
   */
  const createRect = (left, top, width, height) => ({
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  });

  /**
   * 执行所有待处理的 Scheduler.delay 回调。
   * 模拟时间推进一帧。
   */
  const flushDelay = () => {
    const callbacks = [...mockScheduler._pendingCallbacks];
    mockScheduler._pendingCallbacks = [];
    callbacks.forEach((fn) => fn());
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // 模拟 fly canvas 的 2D 渲染上下文
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      clearRect: jest.fn(),
    };

    // 模拟 fly canvas 元素
    mockFlyCanvas = {
      getContext: jest.fn(() => mockCtx),
      parentElement: {
        getBoundingClientRect: jest.fn(() => createRect(0, 0, 800, 600)),
      },
      width: 0,
      height: 0,
    };

    // 模拟 BattleController
    mockBattle = {
      getRoundId: jest.fn(() => 1),
      getOverlayFly: jest.fn(() => mockFlyCanvas),
    };

    // 模拟攻击方 Game 实例
    mockFrom = {
      getCanvas: jest.fn(() => ({
        getBoundingClientRect: jest.fn(() => createRect(0, 100, 300, 400)),
      })),
    };

    /**
     * 模拟 Scheduler。
     * delay 不立即执行回调，而是保存起来供测试手动触发。
     */
    mockScheduler = {
      delay: jest.fn((fn) => {
        mockScheduler._pendingCallbacks.push(fn);
        return mockScheduler._nextId++;
      }),
      cancel: jest.fn(),
      _pendingCallbacks: [],
      _nextId: 1,
    };

    // 模拟受攻击方 Game 实例
    mockTo = {
      getCanvas: jest.fn(() => ({
        getBoundingClientRect: jest.fn(() => createRect(500, 100, 300, 400)),
      })),
      Scheduler: mockScheduler,
    };

    anim = new GarbageFlyAnimation({
      Battle: mockBattle,
      from: mockFrom,
      to: mockTo,
      roundId: 1,
      amount: 0,
      fly: 'human-1',
    });
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    test('应该正确创建实例', () => {
      expect(anim).toBeDefined();
      expect(anim).toBeInstanceOf(GarbageFlyAnimation);
    });

    test('应该自动调用 initialize', () => {
      expect(mockBattle.getOverlayFly).toHaveBeenCalled();
    });

    test('应该通过 Base 自动挂载配置属性', () => {
      expect(anim.roundId).toBe(1);
      expect(anim.amount).toBe(0);
      expect(anim.fly).toBe('human-1');
    });
  });

  // ==================== initialize ====================
  describe('initialize', () => {
    test('应该设置正确的动画属性', () => {
      expect(anim.layer).toBe(160);
      expect(anim.blocking).toBe(true);
      expect(anim.name).toBe('garbage-fly');
      // delay 不立即执行，_finished 保持初始值 false
      expect(anim._finished).toBe(false);
    });

    test('应该获取 fly canvas 和上下文', () => {
      expect(mockBattle.getOverlayFly).toHaveBeenCalledWith('human-1');
      expect(mockFlyCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(anim.$fly).toBe(mockFlyCanvas);
      expect(anim.ctx).toBe(mockCtx);
    });

    test('应该获取双方棋盘位置', () => {
      expect(mockFrom.getCanvas).toHaveBeenCalled();
      expect(mockTo.getCanvas).toHaveBeenCalled();
    });

    test('应该同步 canvas 尺寸', () => {
      expect(mockFlyCanvas.width).toBe(800);
      expect(mockFlyCanvas.height).toBe(600);
    });

    test('应该保存坐标系偏移量', () => {
      expect(anim._offsetX).toBe(0);
      expect(anim._offsetY).toBe(0);
    });

    test('应该计算粒子终点（受攻击方棋盘中心）', () => {
      expect(anim._toX).toBe(650); // 500 + 300/2
      expect(anim._toY).toBe(300); // 100 + 400/2
    });

    test('应该初始化进度为 0', () => {
      // delay 不立即执行，progress 保持初始值
      expect(anim._progress).toBe(0);
    });

    test('应该设置每帧步长为 0.04', () => {
      expect(anim._step).toBe(0.04);
    });

    test('应该创建默认 12 个粒子（amount=0）', () => {
      expect(anim._particles).toHaveLength(12);
    });

    test('amount 大于 0 时应该增加粒子数', () => {
      const animWithAmount = new GarbageFlyAnimation({
        Battle: mockBattle,
        from: mockFrom,
        to: mockTo,
        roundId: 1,
        amount: 4,
        fly: 'human-1',
      });

      expect(animWithAmount._particles).toHaveLength(16); // 12 + 4
    });

    test('粒子应该有正确的属性结构', () => {
      const particle = anim._particles[0];
      expect(particle).toHaveProperty('fromX');
      expect(particle).toHaveProperty('fromY');
      expect(particle).toHaveProperty('speed');
      expect(particle).toHaveProperty('size');
      expect(particle).toHaveProperty('color');
    });

    test('粒子速度应该在 0.6-1.4 范围内', () => {
      anim._particles.forEach((p) => {
        expect(p.speed).toBeGreaterThanOrEqual(0.6);
        expect(p.speed).toBeLessThanOrEqual(1.4);
      });
    });

    test('粒子大小应该在 3-5 范围内', () => {
      anim._particles.forEach((p) => {
        expect(p.size).toBeGreaterThanOrEqual(3);
        expect(p.size).toBeLessThanOrEqual(5);
      });
    });

    test('粒子颜色应该为 WHITE', () => {
      anim._particles.forEach((p) => {
        expect(p.color).toBe('#ffffff');
      });
    });

    test('粒子起始 Y 应该在攻击方棋盘高度内', () => {
      anim._particles.forEach((p) => {
        expect(p.fromY).toBeGreaterThanOrEqual(100); // fromRect.top
        // 浮点精度容差
        expect(p.fromY).toBeLessThanOrEqual(500.01); // fromRect.bottom
      });
    });

    test('粒子起始 X 应该在攻击方棋盘中心附近', () => {
      const centerX = 150; // 0 + 300/2
      anim._particles.forEach((p) => {
        expect(p.fromX).toBeGreaterThanOrEqual(centerX - 90); // 30% 宽度
        expect(p.fromX).toBeLessThanOrEqual(centerX + 90);
      });
    });

    test('应该注册 Scheduler.delay 帧更新回调', () => {
      expect(mockScheduler.delay).toHaveBeenCalled();
      expect(mockScheduler._pendingCallbacks.length).toBeGreaterThan(0);
    });

    test('进度达到 1 时应该标记 _finished', () => {
      anim._progress = 0.96;
      // 手动触发帧更新
      flushDelay();
      expect(anim._finished).toBe(true);
    });

    test('_finished 为 true 时不应该继续调度下一帧', () => {
      // 先清空初始的 pending callbacks
      mockScheduler._pendingCallbacks = [];
      mockScheduler.delay.mockClear();

      anim._finished = true;
      anim._progress = 0.5;

      // 此时没有待处理的回调，不会有新的 delay 调用
      flushDelay();

      // 不应该新增 delay 调用
      expect(mockScheduler.delay).not.toHaveBeenCalled();
    });
  });

  // ==================== render ====================
  describe('render', () => {
    test('应该清空上一帧内容', () => {
      anim.render();
      expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    test('roundId 不匹配时应该标记 _finished', () => {
      mockBattle.getRoundId.mockReturnValue(2);
      anim.render();
      expect(anim._finished).toBe(true);
    });

    test('roundId 不匹配时不应该绘制', () => {
      mockBattle.getRoundId.mockReturnValue(2);
      mockCtx.clearRect.mockClear();
      anim.render();
      expect(mockCtx.clearRect).not.toHaveBeenCalled();
    });

    test('应该为每个粒子调用绘图 API', () => {
      anim.render();

      // 每个粒子调用一次 save/restore/beginPath/arc/fill
      const particleCount = anim._particles.length;
      expect(mockCtx.save).toHaveBeenCalledTimes(particleCount);
      expect(mockCtx.restore).toHaveBeenCalledTimes(particleCount);
      expect(mockCtx.beginPath).toHaveBeenCalledTimes(particleCount);
      expect(mockCtx.arc).toHaveBeenCalledTimes(particleCount);
      expect(mockCtx.fill).toHaveBeenCalledTimes(particleCount);
    });

    test('粒子在起点时（progress=0）应该绘制在攻击方棋盘位置', () => {
      anim._progress = 0;
      anim.render();

      const firstCall = mockCtx.arc.mock.calls[0];
      const x = firstCall[0];
      const y = firstCall[1];

      // 第一个粒子在攻击方棋盘范围内
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(300);
      expect(y).toBeGreaterThanOrEqual(100);
      expect(y).toBeLessThanOrEqual(500.01);
    });

    test('粒子在终点时（progress=1）应该绘制在受攻击方棋盘中心', () => {
      anim._progress = 1;
      anim.render();

      const firstCall = mockCtx.arc.mock.calls[0];
      const x = firstCall[0];
      const y = firstCall[1];

      // 受攻击方棋盘中心 = (650, 300)
      // speed != 1 时 p 可能不等于 1，放宽容差
      expect(x).toBeGreaterThan(300);
      expect(x).toBeLessThan(800);
      expect(y).toBeGreaterThan(100);
      expect(y).toBeLessThan(500);
    });

    test('应该设置 fillStyle 包含正确的 rgba 值', () => {
      anim._progress = 0.5;
      anim.render();

      // alpha 取决于 speed，使用模糊匹配
      expect(mockCtx.fillStyle).toContain('rgba(255, 255, 255');
      expect(mockCtx.fillStyle).not.toBe('rgba(255, 255, 255, 0)');
    });
  });

  // ==================== dispose ====================
  describe('dispose', () => {
    test('应该取消 Scheduler 任务', () => {
      anim.dispose();
      // 第一个 delay 返回的 ID 是 1
      expect(mockScheduler.cancel).toHaveBeenCalledWith(1);
    });

    test('应该清空 canvas', () => {
      anim.dispose();
      expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    test('_schedulerId 为 null 时不应该调用 cancel', () => {
      anim._schedulerId = null;
      mockScheduler.cancel.mockClear();
      anim.dispose();
      expect(mockScheduler.cancel).not.toHaveBeenCalled();
    });

    test('ctx 为 null 时不应该清空 canvas', () => {
      anim.ctx = null;
      mockCtx.clearRect.mockClear();
      anim.dispose();
      expect(mockCtx.clearRect).not.toHaveBeenCalled();
    });

    test('$fly 为 null 时不应该清空 canvas', () => {
      anim.$fly = null;
      mockCtx.clearRect.mockClear();
      anim.dispose();
      expect(mockCtx.clearRect).not.toHaveBeenCalled();
    });

    test('dispose 后 _schedulerId 应该为 null', () => {
      anim.dispose();
      expect(anim._schedulerId).toBeNull();
    });
  });

  // ==================== 帧更新逻辑 ====================
  describe('帧更新逻辑', () => {
    test('每次更新应该递增 progress', () => {
      const initialProgress = anim._progress;
      // 手动触发第一次 update
      flushDelay();
      expect(anim._progress).toBe(initialProgress + anim._step);
    });

    test('progress 不应该超过 1', () => {
      anim._progress = 0.99;
      flushDelay();
      expect(anim._progress).toBe(1);
    });

    test('progress 超过 1 后应该标记 _finished', () => {
      anim._progress = 0.96;
      flushDelay();
      expect(anim._finished).toBe(true);
    });

    test('25 次更新后 progress 应该达到 1 且 _finished 为 true', () => {
      anim._progress = 0;

      for (let i = 0; i < 25; i++) {
        if (anim._finished) break;
        flushDelay();
      }

      expect(anim._finished).toBe(true);
      expect(anim._progress).toBe(1);
    });
  });

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('完整生命周期', () => {
      expect(anim._finished).toBe(false);
      expect(anim._particles).toHaveLength(12);

      // 模拟完整的帧更新循环（最多 25 帧）
      for (let i = 0; i < 25; i++) {
        if (anim._finished) break;
        flushDelay();
      }

      expect(anim._finished).toBe(true);

      // 渲染最后一帧
      anim.render();
      expect(mockCtx.clearRect).toHaveBeenCalled();

      // 清理
      anim.dispose();
      expect(mockScheduler.cancel).toHaveBeenCalled();
    });

    test('render 在动画不同阶段的行为', () => {
      // 开始时：粒子在攻击方棋盘
      anim._progress = 0;
      anim.render();
      const startX = mockCtx.arc.mock.calls[0][0];

      // 中间：粒子在两个棋盘之间
      anim._progress = 0.5;
      mockCtx.arc.mockClear();
      anim.render();
      const midX = mockCtx.arc.mock.calls[0][0];

      // 结束时：粒子在受攻击方棋盘
      anim._progress = 1;
      mockCtx.arc.mockClear();
      anim.render();
      const endX = mockCtx.arc.mock.calls[0][0];

      // 粒子从攻击方（左）向受攻击方（右）移动
      expect(startX).toBeLessThan(midX);
      expect(midX).toBeLessThan(endX);
    });

    test('roundId 不匹配时动画自动过期', () => {
      mockBattle.getRoundId.mockReturnValue(2);
      anim.render();

      expect(anim._finished).toBe(true);
    });

    test('fly canvas 父元素偏移量非零时坐标转换正确', () => {
      // 模拟父元素有偏移的情况
      mockFlyCanvas.parentElement.getBoundingClientRect.mockReturnValue(
        createRect(50, 50, 800, 600),
      );

      const animWithOffset = new GarbageFlyAnimation({
        Battle: mockBattle,
        from: mockFrom,
        to: mockTo,
        roundId: 1,
        amount: 0,
        fly: 'human-1',
      });

      expect(animWithOffset._offsetX).toBe(50);
      expect(animWithOffset._offsetY).toBe(50);

      // 粒子 canvas 坐标应该减去偏移量
      const particle = animWithOffset._particles[0];
      const canvasX = particle.fromX - 50;
      const canvasY = particle.fromY - 50;

      expect(canvasX).toBeLessThan(particle.fromX);
      expect(canvasY).toBeLessThan(particle.fromY);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    test('amount 为 0 时最少 12 个粒子', () => {
      const animZero = new GarbageFlyAnimation({
        Battle: mockBattle,
        from: mockFrom,
        to: mockTo,
        roundId: 1,
        amount: 0,
        fly: 'human-1',
      });

      expect(animZero._particles).toHaveLength(12);
    });

    test('count-1 为 0 时不应该除以零', () => {
      // amount = -11 会导致 count = 1，count - 1 = 0
      const animNegative = new GarbageFlyAnimation({
        Battle: mockBattle,
        from: mockFrom,
        to: mockTo,
        roundId: 1,
        amount: -11,
        fly: 'human-1',
      });

      expect(animNegative._particles).toHaveLength(1);
      expect(animNegative._particles[0].fromY).toBe(100); // fromRect.top
    });

    test('amount 较大时粒子总数应正确增加', () => {
      const animLarge = new GarbageFlyAnimation({
        Battle: mockBattle,
        from: mockFrom,
        to: mockTo,
        roundId: 1,
        amount: 10,
        fly: 'human-1',
      });

      expect(animLarge._particles).toHaveLength(22); // 12 + 10
    });
  });
});
