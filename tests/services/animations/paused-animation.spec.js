import PausedAnimation from '@/lib/services/animations/paused-animation.js';

describe('PausedAnimation', () => {
  let anim;

  beforeEach(() => {
    jest.clearAllMocks();

    anim = new PausedAnimation();
    jest.spyOn(anim, 'emit').mockImplementation(() => anim);
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 PausedAnimation 实例', () => {
      expect(anim).toBeDefined();
      expect(anim).toBeInstanceOf(PausedAnimation);
    });

    it('应该设置 layer 为 500', () => {
      expect(anim.layer).toBe(500);
    });

    it('应该设置 blocking 为 true', () => {
      expect(anim.blocking).toBe(true);
    });

    it('应该设置 name 为 paused', () => {
      expect(anim.name).toBe('paused');
    });

    it('应该初始化 timer 为 0', () => {
      expect(anim.timer).toBe(0);
    });

    it('应该初始化 active 为 true', () => {
      expect(anim.active).toBe(true);
    });
  });

  // ==================== update 方法 ====================
  describe('update 方法', () => {
    it('active 为 true 时应该返回 true', () => {
      const result = anim.update(0.016);

      expect(result).toBe(true);
    });

    it('active 为 false 时应该返回 false', () => {
      anim.active = false;

      const result = anim.update(0.016);

      expect(result).toBe(false);
    });

    it('应该累加 timer', () => {
      anim.update(0.3);
      expect(anim.timer).toBe(0.3);

      anim.update(0.5);
      expect(anim.timer).toBe(0.8);
    });

    it('timer 达到 1 秒时应该播放滴答音效', () => {
      anim.update(0.6);
      anim.update(0.5);

      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'SECOND_TICK',
      });
    });

    it('播放音效后 timer 应该重置为 0', () => {
      anim.update(1.0);

      expect(anim.timer).toBe(0);
    });

    it('应该每秒播放一次音效', () => {
      // 第一秒
      anim.update(1.0);
      anim.emit.mockClear();

      // 第二秒
      anim.update(1.0);

      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'SECOND_TICK',
      });
    });

    it('timer 刚好 1 时应该触发', () => {
      anim.update(1.0);

      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'SECOND_TICK',
      });
      expect(anim.timer).toBe(0);
    });

    it('timer 大于 1 时应该触发', () => {
      anim.update(1.5);

      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'SECOND_TICK',
      });
      expect(anim.timer).toBe(0);
    });

    it('active 为 false 时不应该累加 timer 和播放音效', () => {
      anim.active = false;
      anim.timer = 0.9;

      anim.update(0.5);

      // timer 不变，不播放音效
      expect(anim.timer).toBe(0.9);
      expect(anim.emit).not.toHaveBeenCalled();
    });

    it('连续多次触发音效时 timer 应该正确重置', () => {
      // 触发 3 次音效
      for (let i = 0; i < 3; i++) {
        anim.update(1.0);
      }

      expect(anim.timer).toBe(0);
    });
  });

  // ==================== stop 方法 ====================
  describe('stop 方法', () => {
    it('应该将 active 设置为 false', () => {
      anim.active = true;

      anim.stop();

      expect(anim.active).toBe(false);
    });

    it('stop 后 update 应该返回 false', () => {
      anim.stop();

      const result = anim.update(0.016);

      expect(result).toBe(false);
    });

    it('stop 不应该发送事件', () => {
      anim.emit.mockClear();

      anim.stop();

      expect(anim.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== render 方法 ====================
  describe('render 方法', () => {
    it('应该将 active 设置为 true', () => {
      anim.active = false;

      anim.render();

      expect(anim.active).toBe(true);
    });

    it('active 已经为 true 时 render 不受影响', () => {
      anim.active = true;

      anim.render();

      expect(anim.active).toBe(true);
    });

    it('render 后 update 应该恢复返回 true', () => {
      anim.stop();
      expect(anim.update(0.016)).toBe(false);

      anim.render();
      expect(anim.update(0.016)).toBe(true);
    });
  });

  // ==================== 完整生命周期 ====================
  describe('完整生命周期', () => {
    it('应该支持 pause → resume → pause 的流程', () => {
      // 暂停中
      let alive = anim.update(0.016);
      expect(alive).toBe(true);
      expect(anim.active).toBe(true);

      // 恢复
      anim.stop();
      alive = anim.update(0.016);
      expect(alive).toBe(false);
      expect(anim.active).toBe(false);

      // 再次暂停（render 重置 active）
      anim.render();
      alive = anim.update(0.016);
      expect(alive).toBe(true);
      expect(anim.active).toBe(true);
    });

    it('长时间暂停应该持续播放滴答声', () => {
      let tickCount = 0;

      anim.emit.mockImplementation((event, payload) => {
        if (event === 'audio:play:sound' && payload.sound === 'SECOND_TICK') {
          tickCount++;
        }
        return anim;
      });

      // 模拟 5 秒暂停
      for (let i = 0; i < 5; i++) {
        anim.update(1.0);
      }

      expect(tickCount).toBe(5);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('delta 为 0 时 timer 不变', () => {
      anim.update(0);

      expect(anim.timer).toBe(0);
      expect(anim.emit).not.toHaveBeenCalled();
    });

    it('delta 为负数时 timer 会减少', () => {
      anim.update(0.5);
      expect(anim.timer).toBe(0.5);

      anim.update(-0.3);
      expect(anim.timer).toBe(0.2);
    });

    it('超大 delta 时只触发一次音效', () => {
      anim.emit.mockClear();

      anim.update(100);

      // timer 重置为 0，只触发一次
      expect(anim.timer).toBe(0);
      expect(anim.emit).toHaveBeenCalledTimes(1);
    });

    it('从 closeTo(1) 累加应触发音效', () => {
      anim.update(0.999);
      expect(anim.emit).not.toHaveBeenCalled();

      anim.update(0.002);
      expect(anim.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'SECOND_TICK',
      });
      expect(anim.timer).toBe(0);
    });
  });
});
