import ClearLinesAnimation from '@/lib/services/animations/clear-lines-animation';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/game/actions/apply-clear-lines', () =>
  jest.fn(() => ({
    level: 6,
    levelUp: true,
    clearScore: 800,
    cleared: 1,
    stateHandler: jest.fn(),
  })),
);

jest.mock('@/lib/events/event-catalog.js', () => ({
  AudioEvents: () => ({ PLAY_SOUND: 'audio:play:sound' }),
  GameEvents: (uuid) => ({
    START_CLEAR_SCORE: `game:${uuid}:start:clear:score`,
    UPDATE_STATE: `game:${uuid}:update:state`,
    SAVE_HIGH_SCORE: `game:${uuid}:save:high:score`,
    UPDATE_HUD: `game:${uuid}:update:hud`,
  }),
  ReplayEvents: (uuid) => ({
    STOP_CLEAR_LINES: `replay:${uuid}:stop:clear:lines`,
  }),
  UIEvents: (uuid) => ({
    RENDER_CLEAR_LINES: `ui:${uuid}:render:clear:lines`,
  }),
}));

const createAnimation = (options = {}) => {
  const scheduler = options.Scheduler || new Scheduler();
  const anim = new ClearLinesAnimation({
    Game: {
      id: 'test-uuid',
      Store: {
        getState: jest.fn(() => ({
          lines: 0,
          level: 5,
          score: 0,
          baseLines: 0,
          board: [],
        })),
      },
      Elements: { Main: { rows: 20, cols: 10 } },
    },
    Scheduler: scheduler,
    lines: [3],
  });
  return { anim, scheduler };
};

describe('ClearLinesAnimation', () => {
  describe('构造函数 & initialize', () => {
    it('应该调用 applyClearLines 两次（initialize 和 dispose 各一次）', () => {
      const applyClearLines = require('@/lib/game/actions/apply-clear-lines');
      const { anim } = createAnimation();
      expect(applyClearLines).toHaveBeenCalledTimes(1);
      anim.dispose();
      expect(applyClearLines).toHaveBeenCalledTimes(2);
    });

    it('应该注册 6 个 sequence 任务（1 个分数 + 5 个闪烁）', () => {
      const scheduler = new Scheduler();
      const spy = jest.spyOn(scheduler, 'sequence');

      createAnimation({ Scheduler: scheduler });

      const arg = spy.mock.calls[0][0];
      expect(arg).toHaveLength(6);
      expect(typeof arg[0].fn).toBe('function');
      for (let i = 1; i < 6; i++) {
        expect(typeof arg[i].fn).toBe('function');
      }
    });

    it('应该将 7 个任务 ID 记录到 _schedulerIds（6 sequence + 1 end）', () => {
      const { anim } = createAnimation();
      expect(anim._schedulerIds).toHaveLength(7);
    });
  });

  describe('闪烁（toggle 从 sequence[1] 开始）', () => {
    it('5 次 toggle 后最终 alpha 为 0', () => {
      const scheduler = new Scheduler();
      const spy = jest.spyOn(scheduler, 'sequence');
      const { anim } = createAnimation({ Scheduler: scheduler });
      const arg = spy.mock.calls[0][0];

      expect(anim.lines[0].alpha).toBe(1);
      arg[1].fn();
      expect(anim.lines[0].alpha).toBe(0);
      arg[2].fn();
      expect(anim.lines[0].alpha).toBe(1);
      arg[3].fn();
      expect(anim.lines[0].alpha).toBe(0);
      arg[4].fn();
      expect(anim.lines[0].alpha).toBe(1);
      arg[5].fn();
      expect(anim.lines[0].alpha).toBe(0);
    });
  });

  describe('分数动画', () => {
    it('sequence[0] 触发 START_CLEAR_SCORE', () => {
      const scheduler = new Scheduler();
      const spy = jest.spyOn(scheduler, 'sequence');
      const { anim } = createAnimation({ Scheduler: scheduler });
      const emitSpy = jest.spyOn(anim, 'emit');
      const arg = spy.mock.calls[0][0];

      arg[0].fn();

      expect(emitSpy).toHaveBeenCalledWith('game:test-uuid:start:clear:score', {
        score: 800,
        lines: [3],
      });
    });
  });

  describe('结束定时器', () => {
    it('720ms 后 _finished = true', () => {
      const scheduler = new Scheduler();
      const spy = jest.spyOn(scheduler, 'delay');
      const { anim } = createAnimation({ Scheduler: scheduler });
      const endFn = spy.mock.calls.find(([, d]) => d === 720)[0];

      endFn();
      expect(anim._finished).toBe(true);
    });
  });

  describe('render', () => {
    it('emit RENDER_CLEAR_LINES', () => {
      const { anim } = createAnimation();
      const emitSpy = jest.spyOn(anim, 'emit');

      anim.render();

      expect(emitSpy).toHaveBeenCalledWith('ui:test-uuid:render:clear:lines', {
        state: { lines: [{ y: 3, alpha: 1 }] },
      });
    });
  });

  describe('dispose', () => {
    it('取消所有 7 个 Scheduler 任务', () => {
      const scheduler = new Scheduler();
      const spy = jest.spyOn(scheduler, 'cancel');
      const { anim } = createAnimation({ Scheduler: scheduler });

      anim.dispose();

      expect(spy).toHaveBeenCalledTimes(7);
    });
  });
});
