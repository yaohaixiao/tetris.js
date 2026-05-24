// tests/services/animations/clear-score-animation.spec.js

import ClearScoreAnimation from '@/lib/services/animations/clear-score-animation';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/events/event-catalog.js', () => ({
  UIEvents: (uuid) => ({
    RENDER_CLEAR_SCORE: `ui:${uuid}:render:clear:score`,
  }),
}));

const createAnimation = (options = {}) => {
  const scheduler = options.Scheduler || new Scheduler();
  const anim = new ClearScoreAnimation({
    Game: { id: 'test-uuid' },
    Scheduler: scheduler,
    scoreData: options.scoreData || { score: 800, lines: [18, 19] },
  });
  return { anim, scheduler };
};

describe('ClearScoreAnimation', () => {
  describe('初始化', () => {
    it('layer = 300', () => {
      const { anim } = createAnimation();
      expect(anim.layer).toBe(300);
    });

    it('blocking = false', () => {
      const { anim } = createAnimation();
      expect(anim.blocking).toBe(false);
    });

    it('name = clear-score', () => {
      const { anim } = createAnimation();
      expect(anim.name).toBe('clear-score');
    });

    it('_finished 初始为 false', () => {
      const { anim } = createAnimation();
      expect(anim._finished).toBe(false);
    });

    it('state 初始化正确', () => {
      const { anim } = createAnimation();
      expect(anim.state).toEqual({
        score: 800,
        y: 19,
        alpha: 1,
        offsetY: 0,
      });
    });

    it('y 取 lines 最后一个元素', () => {
      const { anim } = createAnimation({
        scoreData: { score: 300, lines: [15, 16, 17] },
      });
      expect(anim.state.y).toBe(17);
    });

    it('注册 interval 每 16ms 更新', () => {
      const scheduler = new Scheduler();
      const intervalSpy = jest.spyOn(scheduler, 'interval');

      createAnimation({ Scheduler: scheduler });

      expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 16);
    });
  });

  describe('_update', () => {
    it('alpha 递减', () => {
      const { anim } = createAnimation();
      const before = anim.state.alpha;

      anim._update();

      expect(anim.state.alpha).toBeLessThan(before);
    });

    it('offsetY 递增', () => {
      const { anim } = createAnimation();
      const before = anim.state.offsetY;

      anim._update();

      expect(anim.state.offsetY).toBeGreaterThan(before);
    });

    it('alpha <= 0 时 _finished = true', () => {
      const { anim } = createAnimation();
      anim.state.alpha = 0.01;

      anim._update();

      expect(anim._finished).toBe(true);
    });

    it('alpha > 0 时 _finished 仍为 false', () => {
      const { anim } = createAnimation();
      anim.state.alpha = 0.5;

      anim._update();

      expect(anim._finished).toBe(false);
    });
  });

  describe('dispose', () => {
    it('取消 interval 任务', () => {
      const scheduler = new Scheduler();
      const cancelSpy = jest.spyOn(scheduler, 'cancel');
      const { anim } = createAnimation({ Scheduler: scheduler });

      anim.dispose();

      expect(cancelSpy).toHaveBeenCalledWith(anim._updateId);
    });
  });

  describe('render', () => {
    it('emit RENDER_CLEAR_SCORE 带 state', () => {
      const { anim } = createAnimation();
      const emitSpy = jest.spyOn(anim, 'emit');

      anim.render();

      expect(emitSpy).toHaveBeenCalledWith('ui:test-uuid:render:clear:score', {
        state: { score: 800, y: 19, alpha: 1, offsetY: 0 },
      });
    });

    it('alpha 变化后 render 反映最新状态', () => {
      const { anim } = createAnimation();
      const emitSpy = jest.spyOn(anim, 'emit');
      anim.state.alpha = 0.5;
      anim.state.offsetY = 2;

      anim.render();

      expect(emitSpy).toHaveBeenCalledWith('ui:test-uuid:render:clear:score', {
        state: { score: 800, y: 19, alpha: 0.5, offsetY: 2 },
      });
    });
  });
});
