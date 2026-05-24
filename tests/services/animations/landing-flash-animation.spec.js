import LandingFlashAnimation from '@/lib/services/animations/landing-flash-animation';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/events/event-catalog.js', () => ({
  UIEvents: (uuid) => ({
    RENDER_LANDING_FLASH: `ui:${uuid}:render:landing:flash`,
  }),
}));

const createAnimation = (options = {}) => {
  const scheduler = options.Scheduler || new Scheduler();
  const anim = new LandingFlashAnimation({
    Game: { id: 'test-uuid' },
    Scheduler: scheduler,
    piece: options.piece || {
      shape: [
        [1, 1],
        [1, 1],
      ],
      cx: 4,
      cy: 18,
    },
  });
  return { anim, scheduler };
};

describe('LandingFlashAnimation', () => {
  describe('初始化', () => {
    it('layer = 150', () => {
      const { anim } = createAnimation();
      expect(anim.layer).toBe(150);
    });

    it('blocking = false', () => {
      const { anim } = createAnimation();
      expect(anim.blocking).toBe(false);
    });

    it('name = landing-flash', () => {
      const { anim } = createAnimation();
      expect(anim.name).toBe('landing-flash');
    });

    it('_finished 初始为 false', () => {
      const { anim } = createAnimation();
      expect(anim._finished).toBe(false);
    });

    it('收集落地格子坐标（2×2 方块）', () => {
      const { anim } = createAnimation({
        piece: {
          shape: [
            [1, 1],
            [1, 1],
          ],
          cx: 4,
          cy: 18,
        },
      });
      expect(anim.state.cells).toEqual([
        { x: 4, y: 18 },
        { x: 5, y: 18 },
        { x: 4, y: 19 },
        { x: 5, y: 19 },
      ]);
    });

    it('只收集实心格子（shape 中为 0 的跳过）', () => {
      const { anim } = createAnimation({
        piece: {
          shape: [
            [0, 1, 0],
            [1, 1, 1],
          ],
          cx: 3,
          cy: 5,
        },
      });
      expect(anim.state.cells).toEqual([
        { x: 4, y: 5 },
        { x: 3, y: 6 },
        { x: 4, y: 6 },
        { x: 5, y: 6 },
      ]);
    });

    it('注册 150ms 结束定时器', () => {
      const scheduler = new Scheduler();
      const spy = jest.spyOn(scheduler, 'delay');

      createAnimation({ Scheduler: scheduler });

      expect(spy).toHaveBeenCalledWith(expect.any(Function), 150);
    });

    it('150ms 后 _finished = true', () => {
      const scheduler = new Scheduler();
      const spy = jest.spyOn(scheduler, 'delay');
      const { anim } = createAnimation({ Scheduler: scheduler });
      const endFn = spy.mock.calls[0][0];

      endFn();
      expect(anim._finished).toBe(true);
    });
  });

  describe('dispose', () => {
    it('取消结束定时器', () => {
      const scheduler = new Scheduler();
      const spy = jest.spyOn(scheduler, 'cancel');
      const { anim } = createAnimation({ Scheduler: scheduler });

      anim.dispose();

      expect(spy).toHaveBeenCalledWith(anim._endId);
    });
  });

  describe('render', () => {
    it('emit RENDER_LANDING_FLASH 带 cells', () => {
      const { anim } = createAnimation({
        piece: { shape: [[1]], cx: 5, cy: 10 },
      });
      const spy = jest.spyOn(anim, 'emit');

      anim.render();

      expect(spy).toHaveBeenCalledWith('ui:test-uuid:render:landing:flash', {
        state: { cells: [{ x: 5, y: 10 }] },
      });
    });
  });
});
