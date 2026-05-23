import ClearLinesAnimation from '@/lib/services/animations/clear-lines-animation';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/game/actions/apply-clear-lines', () => jest.fn(() => ({
  level: 6,
  levelUp: true,
  clearScore: 800,
  stateHandler: jest.fn(),
})));

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
    Game: { id: 'test-uuid', Store: { getState: jest.fn(() => ({ lines: 0, level: 5, score: 0, baseLines: 0, levelUpSteps: 10, board: [] })) }, Elements: { Main: { rows: 20, cols: 10 } } },
    Scheduler: scheduler,
    lines: [3],
  });
  return { anim, scheduler };
};

describe('ClearLinesAnimation', () => {
  describe('构造函数 & initialize', () => {
    it('应该注册 6 个 sequence 任务（1 个分数 + 5 个闪烁）', () => {
      const scheduler = new Scheduler();
      const sequenceSpy = jest.spyOn(scheduler, 'sequence');

      createAnimation({ Scheduler: scheduler });

      const sequenceArg = sequenceSpy.mock.calls[0][0];
      expect(sequenceArg).toHaveLength(6);
      // 所有任务都有 fn
      for (const item of sequenceArg) {
        expect(typeof item.fn).toBe('function');
      }
    });

    it('应该将 7 个任务 ID 记录到 _schedulerIds（6 sequence + 1 end）', () => {
      const { anim } = createAnimation();
      // sequence 6 个 + end delay 1 个 = 7
      expect(anim._schedulerIds).toHaveLength(7);
    });
  });

  describe('闪烁（toggle 从 sequence[1] 开始）', () => {
    let anim, sequenceArg;

    beforeEach(() => {
      const scheduler = new Scheduler();
      const sequenceSpy = jest.spyOn(scheduler, 'sequence');
      const result = createAnimation({ Scheduler: scheduler });
      anim = result.anim;
      sequenceArg = sequenceSpy.mock.calls[0][0];
    });

    it('第一次 toggle（sequence[1]）alpha 从 1 变 0', () => {
      expect(anim.lines[0].alpha).toBe(1);
      sequenceArg[1].fn();
      expect(anim.lines[0].alpha).toBe(0);
    });

    it('第二次 toggle（sequence[2]）alpha 从 0 变 1', () => {
      sequenceArg[1].fn(); // 0
      sequenceArg[2].fn(); // 1
      expect(anim.lines[0].alpha).toBe(1);
    });

    it('5 次 toggle 后最终 alpha 为 0', () => {
      sequenceArg[1].fn(); // 0
      sequenceArg[2].fn(); // 1
      sequenceArg[3].fn(); // 0
      sequenceArg[4].fn(); // 1
      sequenceArg[5].fn(); // 0
      expect(anim.lines[0].alpha).toBe(0);
    });
  });

  describe('分数动画触发', () => {
    it('sequence[0] 触发 START_CLEAR_SCORE', () => {
      const scheduler = new Scheduler();
      const sequenceSpy = jest.spyOn(scheduler, 'sequence');
      const { anim } = createAnimation({ Scheduler: scheduler });
      const emitSpy = jest.spyOn(anim, 'emit');
      const sequenceArg = sequenceSpy.mock.calls[0][0];

      sequenceArg[0].fn();

      expect(emitSpy).toHaveBeenCalledWith(
        'game:test-uuid:start:clear:score',
        { score: 800, lines: [3] },
      );
    });
  });

  describe('结束定时器', () => {
    it('end delay 触发后 _finished = true', () => {
      const scheduler = new Scheduler();
      const delaySpy = jest.spyOn(scheduler, 'delay');
      const { anim } = createAnimation({ Scheduler: scheduler });
      const endFn = delaySpy.mock.calls.find(([fn, d]) => d === 720)[0];

      endFn();
      expect(anim._finished).toBe(true);
    });
  });

  describe('render', () => {
    it('渲染时 emit RENDER_CLEAR_LINES 带当前 lines 状态', () => {
      const { anim } = createAnimation();
      const emitSpy = jest.spyOn(anim, 'emit');

      anim.render();

      expect(emitSpy).toHaveBeenCalledWith(
        'ui:test-uuid:render:clear:lines',
        { state: { lines: [{ y: 3, alpha: 1 }] } },
      );
    });
  });

  describe('dispose', () => {
    it('应该取消所有 7 个 Scheduler 任务', () => {
      const scheduler = new Scheduler();
      const cancelSpy = jest.spyOn(scheduler, 'cancel');
      const { anim } = createAnimation({ Scheduler: scheduler });

      anim.dispose();

      expect(cancelSpy).toHaveBeenCalledTimes(7);
    });
  });
});
