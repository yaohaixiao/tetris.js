import CountdownAnimation from '@/lib/services/animations/countdown-animation.js';

describe('CountdownAnimation', () => {
  let mockGame;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGame = { id: 'test-game-uuid' };
  });

  function createAnim() {
    const emitMock = jest.fn();
    const origEmit = CountdownAnimation.prototype.emit;
    CountdownAnimation.prototype.emit = emitMock;

    const anim = new CountdownAnimation({ Game: mockGame });

    CountdownAnimation.prototype.emit = origEmit;
    anim.emit = emitMock;

    return anim;
  }

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 CountdownAnimation 实例', () => {
      const anim = createAnim();
      expect(anim).toBeDefined();
      expect(anim).toBeInstanceOf(CountdownAnimation);
    });

    it('应该设置 layer 为 100', () => {
      const anim = createAnim();
      expect(anim.layer).toBe(100);
    });

    it('应该设置 blocking 为 true', () => {
      const anim = createAnim();
      expect(anim.blocking).toBe(true);
    });

    it('应该设置 name 为 countdown', () => {
      const anim = createAnim();
      expect(anim.name).toBe('countdown');
    });

    it('应该初始化 state', () => {
      const anim = createAnim();
      expect(anim.state).toEqual({
        show: true,
        number: 3,
        scale: 4,
        count: 0,
        acc: 0,
      });
    });

    it('应该播放倒计时音效', () => {
      const anim = createAnim();
      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'COUNTDOWN',
      });
    });
  });

  // ==================== update 方法 - 累加器节奏控制 ====================
  describe('update 方法 - 累加器节奏控制', () => {
    it('acc 小于 0.01 时不应该更新状态', () => {
      const anim = createAnim();
      const initialState = { ...anim.state };

      anim.update(0.005);

      expect(anim.state.count).toBe(initialState.count);
      expect(anim.state.scale).toBe(initialState.scale);
      expect(anim.state.number).toBe(initialState.number);
    });

    it('acc 小于 0.01 时应该返回 true', () => {
      const anim = createAnim();
      const result = anim.update(0.005);
      expect(result).toBe(true);
    });

    it('累计 acc 超过 0.01 时应该触发更新', () => {
      const anim = createAnim();

      anim.update(0.005);
      expect(anim.state.count).toBe(0);

      anim.update(0.006);
      expect(anim.state.count).toBe(1);
      expect(anim.state.acc).toBe(0);
    });

    it('delta 刚好 0.01 时应该触发更新', () => {
      const anim = createAnim();
      anim.update(0.01);
      expect(anim.state.count).toBe(1);
      expect(anim.state.acc).toBe(0);
    });

    it('delta 大于 0.01 时应该触发更新并重置 acc', () => {
      const anim = createAnim();
      anim.update(0.05);
      expect(anim.state.count).toBe(1);
      expect(anim.state.acc).toBe(0);
    });
  });

  // ==================== update 方法 - 缩放动画 ====================
  describe('update 方法 - 缩放动画', () => {
    it('每次更新 scale 应该减小 0.4', () => {
      const anim = createAnim();

      anim.update(0.01);
      expect(anim.state.scale).toBe(3.6);

      anim.update(0.01);
      expect(anim.state.scale).toBe(3.2);
    });

    it('scale 不应该小于 1', () => {
      const anim = createAnim();
      for (let i = 0; i < 15; i++) {
        anim.update(0.01);
      }
      expect(anim.state.scale).toBe(1);
    });
  });

  // ==================== update 方法 - 数字切换 ====================
  describe('update 方法 - 数字切换', () => {
    it('count 达到 50 时数字应该减 1', () => {
      const anim = createAnim();
      for (let i = 0; i < 50; i++) {
        anim.update(0.01);
      }
      expect(anim.state.number).toBe(2);
    });

    it('数字切换时 count 应该重置为 0', () => {
      const anim = createAnim();
      for (let i = 0; i < 50; i++) {
        anim.update(0.01);
      }
      expect(anim.state.count).toBe(0);
    });

    it('数字切换时 scale 应该重置为 4', () => {
      const anim = createAnim();
      for (let i = 0; i < 50; i++) {
        anim.update(0.01);
      }
      expect(anim.state.scale).toBe(4);
    });

    it('数字从 3 → 2 → 1 依次递减', () => {
      const anim = createAnim();
      expect(anim.state.number).toBe(3);

      for (let i = 0; i < 50; i++) anim.update(0.01);
      expect(anim.state.number).toBe(2);

      for (let i = 0; i < 50; i++) anim.update(0.01);
      expect(anim.state.number).toBe(1);
    });

    it('数字切换时应该播放倒计时音效（number >= 1）', () => {
      const anim = createAnim();
      anim.emit.mockClear();

      for (let i = 0; i < 50; i++) anim.update(0.01);
      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'COUNTDOWN',
      });

      anim.emit.mockClear();
      for (let i = 0; i < 50; i++) anim.update(0.01);
      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'COUNTDOWN',
      });
    });
  });

  // ==================== update 方法 - 动画结束 ====================
  describe('update 方法 - 动画结束', () => {
    it('number 变为 0 时应该返回 false', () => {
      const anim = createAnim();
      for (let i = 0; i < 100; i++) anim.update(0.01);
      for (let i = 0; i < 50; i++) anim.update(0.01);

      const result = anim.update(0.01);
      expect(result).toBe(false);
      expect(anim.state.number).toBe(0);
    });

    it('number 变为 0 时应该调用 stop', () => {
      const anim = createAnim();
      const stopSpy = jest.spyOn(anim, 'stop');

      for (let i = 0; i < 100; i++) anim.update(0.01);
      for (let i = 0; i < 50; i++) anim.update(0.01);

      expect(stopSpy).toHaveBeenCalled();
    });

    it('number 变为 0 时不应该再播放音效', () => {
      const anim = createAnim();
      anim.emit.mockClear();
      anim.state.number = 1;

      for (let i = 0; i < 50; i++) anim.update(0.01);

      const soundCalls = anim.emit.mock.calls.filter(
        ([event]) => event === 'audio:play:sound',
      );
      expect(soundCalls).toHaveLength(0);
    });
  });

  // ==================== stop 方法 ====================
  describe('stop 方法', () => {
    it('应该发送 game:begin 事件', () => {
      const anim = createAnim();
      anim.stop();
      expect(anim.emit).toHaveBeenCalledWith(`game:${mockGame.id}:begin`);
    });
  });

  // ==================== render 方法 ====================
  describe('render 方法', () => {
    it('应该发送渲染事件并携带 state', () => {
      const anim = createAnim();
      anim.render();
      expect(anim.emit).toHaveBeenCalledWith(
        `ui:${mockGame.id}:render:countdown`,
        { state: anim.state },
      );
    });

    it('应该传递当前 state 引用', () => {
      const anim = createAnim();
      anim.render();

      const renderCall = anim.emit.mock.calls.find(
        ([event]) => event === `ui:${mockGame.id}:render:countdown`,
      );
      expect(renderCall[1].state).toBe(anim.state);
    });
  });

  // ==================== 完整生命周期 ====================
  describe('完整生命周期', () => {
    it('应该完整执行 3 → 2 → 1 → begin 的流程', () => {
      const anim = createAnim();
      expect(anim.state.number).toBe(3);

      let alive = true;
      let totalFrames = 0;

      while (alive && totalFrames < 300) {
        alive = anim.update(0.016);
        totalFrames++;
      }

      expect(alive).toBe(false);
      expect(anim.state.number).toBe(0);
      expect(anim.emit).toHaveBeenCalledWith(`game:${mockGame.id}:begin`);
    });

    it('总帧数应该在 150 帧左右', () => {
      const anim = createAnim();
      let alive = true;
      let count = 0;

      while (alive && count < 300) {
        alive = anim.update(0.01);
        count++;
      }

      expect(count).toBe(150);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('delta 为 0 时不应该更新状态', () => {
      const anim = createAnim();
      const initialState = { ...anim.state };
      anim.update(0);
      expect(anim.state.count).toBe(initialState.count);
      expect(anim.state.scale).toBe(initialState.scale);
      expect(anim.state.number).toBe(initialState.number);
    });

    it('delta 为负数时不应该触发更新', () => {
      const anim = createAnim();
      anim.update(-0.1);
      expect(anim.state.count).toBe(0);
    });

    it('超大 delta 应该只触发一次更新', () => {
      const anim = createAnim();
      anim.update(100);
      expect(anim.state.count).toBe(1);
      expect(anim.state.acc).toBe(0);
    });

    it('长时间运行不应该报错', () => {
      const anim = createAnim();
      expect(() => {
        for (let i = 0; i < 500; i++) {
          anim.update(0.016);
        }
      }).not.toThrow();
    });
  });
});
