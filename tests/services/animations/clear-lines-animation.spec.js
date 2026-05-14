import ClearLinesAnimation from '@/lib/services/animations/clear-lines-animation.js';
import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';

jest.mock('@/lib/game/actions/apply-clear-lines.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('ClearLinesAnimation', () => {
  let mockGame;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGame = { id: 'test-game-uuid' };

    applyClearLines.mockReturnValue({
      level: 5,
      levelUp: false,
      stateHandler: { score: 1000, lines: 10, level: 5 },
    });
  });

  function createAnim(options = {}) {
    const emitMock = jest.fn();
    const origEmit = ClearLinesAnimation.prototype.emit;
    ClearLinesAnimation.prototype.emit = emitMock;

    const anim = new ClearLinesAnimation({
      Game: mockGame,
      lines: [5, 8, 10, 15],
      ...options,
    });

    ClearLinesAnimation.prototype.emit = origEmit;
    anim.emit = emitMock;

    return anim;
  }

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 ClearLinesAnimation 实例', () => {
      const anim = createAnim();
      expect(anim).toBeDefined();
      expect(anim).toBeInstanceOf(ClearLinesAnimation);
    });

    it('应该设置 layer 为 200', () => {
      const anim = createAnim();
      expect(anim.layer).toBe(200);
    });

    it('应该设置 blocking 为 true', () => {
      const anim = createAnim();
      expect(anim.blocking).toBe(true);
    });

    it('应该设置 name 为 clear-lines', () => {
      const anim = createAnim();
      expect(anim.name).toBe('clear-lines');
    });

    it('应该根据传入的行号初始化 lines 数组', () => {
      const anim = createAnim();
      expect(anim.lines).toHaveLength(4);
      expect(anim.lines[0]).toEqual({ y: 5, alpha: 1, timer: 0 });
      expect(anim.lines[1]).toEqual({ y: 8, alpha: 1, timer: 0 });
      expect(anim.lines[2]).toEqual({ y: 10, alpha: 1, timer: 0 });
      expect(anim.lines[3]).toEqual({ y: 15, alpha: 1, timer: 0 });
    });

    it('所有行的初始 alpha 应该为 1', () => {
      const anim = createAnim();
      anim.lines.forEach((line) => {
        expect(line.alpha).toBe(1);
      });
    });

    it('所有行的初始 timer 应该为 0', () => {
      const anim = createAnim();
      anim.lines.forEach((line) => {
        expect(line.timer).toBe(0);
      });
    });

    it('应该播放消除音效', () => {
      const anim = createAnim();
      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'CLEAR',
        lines: 3,
      });
    });

    it('消除 1 行时 lines 应为 0', () => {
      const anim = createAnim({ lines: [10] });
      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'CLEAR',
        lines: 0,
      });
    });

    it('消除 2 行时 lines 应为 1', () => {
      const anim = createAnim({ lines: [3, 7] });
      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'CLEAR',
        lines: 1,
      });
    });
  });

  // ==================== update 方法 ====================
  describe('update 方法', () => {
    it('动画未完成时应该返回 true', () => {
      const anim = createAnim();
      const result = anim.update(0.1);
      expect(result).toBe(true);
    });

    it('所有行都超过 0.72 秒时应该返回 false', () => {
      const anim = createAnim();
      const result = anim.update(0.8);
      expect(result).toBe(false);
    });

    it('应该在偶数 phase 时设置 alpha 为 1', () => {
      const anim = createAnim();
      anim.update(0.05);
      expect(anim.lines[0].alpha).toBe(1);
    });

    it('应该在奇数 phase 时设置 alpha 为 0', () => {
      const anim = createAnim();
      // 第一次 update: timer=0→phase=0→alpha=1, timer+=0.13=0.13
      anim.update(0.13);
      // 第二次 update: timer=0.13→phase=floor(0.13/0.12)=1→alpha=0, timer+=0.01=0.14
      anim.update(0.01);
      expect(anim.lines[0].alpha).toBe(0);
    });

    it('phase 2 时 alpha 应该为 1', () => {
      const anim = createAnim();
      anim.update(0.25);
      anim.update(0.01);
      expect(anim.lines[0].alpha).toBe(1);
    });

    it('phase 3 时 alpha 应该为 0', () => {
      const anim = createAnim();
      anim.update(0.37);
      anim.update(0.01);
      expect(anim.lines[0].alpha).toBe(0);
    });

    it('phase 5 时 alpha 应该为 0', () => {
      const anim = createAnim();
      anim.update(0.61);
      anim.update(0.01);
      expect(anim.lines[0].alpha).toBe(0);
    });

    it('应该在每帧后累加 timer', () => {
      const anim = createAnim();
      anim.update(0.16);
      expect(anim.lines[0].timer).toBe(0.16);

      anim.update(0.16);
      expect(anim.lines[0].timer).toBe(0.32);
    });

    it('多行时只要有任一行未完成就应该返回 true', () => {
      const anim = createAnim();
      anim.lines[0].timer = 0.8;
      anim.lines[1].timer = 0.8;
      anim.lines[2].timer = 0.8;
      anim.lines[3].timer = 0.5;

      const result = anim.update(0.1);
      expect(result).toBe(true);
    });

    it('所有行完成时应该调用 stop', () => {
      const anim = createAnim();
      const stopSpy = jest.spyOn(anim, 'stop');
      anim.update(0.8);
      expect(stopSpy).toHaveBeenCalled();
    });

    it('传入 0 时 timer 不变但 alpha 应该正确设置', () => {
      const anim = createAnim();
      anim.update(0);
      expect(anim.lines[0].timer).toBe(0);
      expect(anim.lines[0].alpha).toBe(1);
    });
  });

  // ==================== stop 方法 ====================
  describe('stop 方法', () => {
    it('应该调用 applyClearLines', () => {
      const anim = createAnim();
      anim.stop();
      expect(applyClearLines).toHaveBeenCalledWith(mockGame);
    });

    it('应该发送 clear:lines 事件', () => {
      const anim = createAnim();
      anim.stop();
      expect(anim.emit).toHaveBeenCalledWith(
        `replay:${mockGame.id}:stop:clear:lines`,
        { isLevelUp: false, level: 5 },
      );
    });

    it('升级时应该发送 isLevelUp = true', () => {
      applyClearLines.mockReturnValue({
        level: 6,
        levelUp: true,
        stateHandler: { score: 2000, lines: 20, level: 6 },
      });

      const anim = createAnim();
      anim.stop();
      expect(anim.emit).toHaveBeenCalledWith(
        `replay:${mockGame.id}:stop:clear:lines`,
        { isLevelUp: true, level: 6 },
      );
    });

    it('应该发送更新状态事件', () => {
      const anim = createAnim();
      anim.stop();
      expect(anim.emit).toHaveBeenCalledWith(
        `game:${mockGame.id}:update:state`,
        { stateHandler: { score: 1000, lines: 10, level: 5 } },
      );
    });

    it('应该发送保存最高分事件', () => {
      const anim = createAnim();
      anim.stop();
      expect(anim.emit).toHaveBeenCalledWith(
        `game:${mockGame.id}:save:high:score`,
      );
    });

    it('应该发送 HUD 更新事件', () => {
      const anim = createAnim();
      anim.stop();
      expect(anim.emit).toHaveBeenCalledWith(`game:${mockGame.id}:update:hud`);
    });
  });

  // ==================== render 方法 ====================
  describe('render 方法', () => {
    it('应该发送渲染事件并携带 lines 数据', () => {
      const anim = createAnim();
      anim.update(0.12);
      anim.render();
      expect(anim.emit).toHaveBeenCalledWith(`ui:${mockGame.id}:render:clear`, {
        state: { lines: anim.lines },
      });
    });

    it('应该传递当前 lines 引用', () => {
      const anim = createAnim();
      anim.render();
      const renderCall = anim.emit.mock.calls.find(
        ([event]) => event === `ui:${mockGame.id}:render:clear`,
      );
      expect(renderCall[1].state.lines).toBe(anim.lines);
    });
  });

  // ==================== 完整生命周期 ====================
  describe('完整生命周期', () => {
    it('应该完整执行创建 → 更新 → 结束的流程', () => {
      const anim = createAnim();
      expect(anim.lines[0].alpha).toBe(1);
      expect(anim.lines[0].timer).toBe(0);

      let alive = true;
      let iterations = 0;

      while (alive && iterations < 100) {
        alive = anim.update(0.016);
        iterations++;
      }

      expect(alive).toBe(false);
      expect(iterations).toBeGreaterThan(0);
      expect(applyClearLines).toHaveBeenCalled();
    });

    it('总动画时长应该约为 0.72 秒', () => {
      const anim = createAnim();
      const frames = Math.ceil(0.72 / 0.016);

      for (let i = 0; i < frames; i++) {
        anim.update(0.016);
      }

      const result = anim.update(0.016);
      expect(result).toBe(false);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('没有消除行时不应该报错', () => {
      const anim = createAnim({ lines: [] });
      const result = anim.update(0.016);
      expect(result).toBe(false);
    });

    it('恰好 0.72 秒时应该完成', () => {
      const anim = createAnim();
      const result = anim.update(0.72);
      expect(result).toBe(false);
    });

    it('delta 很大时应该一次完成', () => {
      const anim = createAnim();
      const result = anim.update(10);
      expect(result).toBe(false);
    });

    it('delta 为负数时不应该推进 timer', () => {
      const anim = createAnim();
      anim.update(0.1);
      const timerBefore = anim.lines[0].timer;
      anim.update(-0.05);
      expect(anim.lines[0].timer).toBeLessThan(timerBefore);
    });
  });
});
