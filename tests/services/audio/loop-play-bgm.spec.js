import loopPlayBGM from '@/lib/services/audio/loop-play-bgm';
import playTone from '@/lib/services/audio/play-tone';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/services/audio/play-tone', () => jest.fn());

describe('loopPlayBGM', () => {
  let scheduler;
  let audio;

  const melody = [
    { freq: 440, dur: 1 },
    { freq: 880, dur: 2 },
    { freq: 0, dur: 0.5 },
    { freq: 660, dur: 1 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    scheduler = new Scheduler();
    scheduler.now = 100; // 固定初始时间

    audio = {
      Context: { currentTime: 100 },
      Scheduler: scheduler,
    };
  });

  describe('参数校验', () => {
    test('melody 为空数组时提前返回', () => {
      loopPlayBGM(audio, []);
      expect(scheduler.size()).toBe(0);
    });

    test('melody 为 null/undefined 时提前返回', () => {
      loopPlayBGM(audio, null);
      loopPlayBGM(audio, undefined);
      expect(scheduler.size()).toBe(0);
    });

    test('duration <= 0 时提前返回', () => {
      loopPlayBGM(audio, melody, { duration: 0 });
      loopPlayBGM(audio, melody, { duration: -100 });
      expect(scheduler.size()).toBe(0);
    });
  });

  describe('BGM 调度注册', () => {
    test('注册 interval 任务到 scheduler', () => {
      jest.spyOn(scheduler, 'interval');
      loopPlayBGM(audio, melody);
      expect(scheduler.interval).toHaveBeenCalled();
    });

    test('interval 间隔为 25ms (LOOKAHEAD)', () => {
      jest.spyOn(scheduler, 'interval');
      loopPlayBGM(audio, melody);
      expect(scheduler.interval).toHaveBeenCalledWith(expect.any(Function), 25);
    });

    test('将 interval id 存到 audio.bgmSchedulerId', () => {
      loopPlayBGM(audio, melody);
      expect(audio.bgmSchedulerId).toBeGreaterThan(0);
    });
  });

  describe('预调度逻辑', () => {
    test('首次 tick 将未来 0.12s 内的音符排入时间线', () => {
      loopPlayBGM(audio, melody);

      // 新 Scheduler：interval 首次 tick 就触发
      // time = 100 + 25 = 125，tick(125) 触发
      scheduler.tick(125);

      // limit = 100 + 0.12 = 100.12
      // nextNoteTime = 100
      // melody[0]: 100 < 100.12 → 排入，nextNoteTime = 100.11
      // melody[1]: 100.11 < 100.12 → 排入，nextNoteTime = 100.33
      // melody[2] 休止符跳过，nextNoteTime = 100.385
      // 100.385 >= 100.12 → 停止
      expect(playTone).toHaveBeenCalledTimes(2);

      expect(playTone).toHaveBeenNthCalledWith(
        1,
        audio,
        440,
        110,
        expect.objectContaining({ startTime: 100 }),
      );
      expect(playTone).toHaveBeenNthCalledWith(
        2,
        audio,
        880,
        220,
        expect.objectContaining({ startTime: 100.11 }),
      );
    });

    test('休止符（freq=0）不调用 playTone', () => {
      loopPlayBGM(audio, [{ freq: 0, dur: 1 }]);
      scheduler.tick(125);
      expect(playTone).not.toHaveBeenCalled();
    });

    test('后续 tick 继续推进音符', () => {
      loopPlayBGM(audio, melody);

      scheduler.tick(125);
      const firstCallCount = playTone.mock.calls.length;

      audio.Context.currentTime = 100.4;
      // interval 第二次触发：nextTime = 125 + 25 = 150
      scheduler.tick(150);

      expect(playTone.mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    test('旋律循环：播完最后一个音符后回到开头', () => {
      const shortMelody = [
        { freq: 440, dur: 1 },
        { freq: 880, dur: 1 },
      ];

      loopPlayBGM(audio, shortMelody, { duration: 100 });

      scheduler.tick(125);
      expect(playTone).toHaveBeenCalledTimes(2);

      jest.clearAllMocks();

      audio.Context.currentTime = 100.25;
      scheduler.tick(150); // nextTime = 125 + 25 = 150

      expect(playTone).toHaveBeenCalledTimes(2);
      expect(playTone.mock.calls[0][1]).toBe(440);
      expect(playTone.mock.calls[0][3].startTime).toBeCloseTo(100.2, 5);
    });
  });

  describe('自定义参数', () => {
    test('自定义 volume', () => {
      loopPlayBGM(audio, melody, { volume: 0.08 });
      scheduler.tick(125);
      expect(playTone).toHaveBeenCalledWith(
        audio,
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({ volume: 0.08 }),
      );
    });

    test('自定义 wave', () => {
      loopPlayBGM(audio, melody, { wave: 'sine' });
      scheduler.tick(125);
      expect(playTone).toHaveBeenCalledWith(
        audio,
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({ wave: 'sine' }),
      );
    });

    test('自定义 gate', () => {
      loopPlayBGM(audio, melody, { gate: 0.5 });
      scheduler.tick(125);
      expect(playTone).toHaveBeenCalledWith(
        audio,
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({ gate: 0.5 }),
      );
    });

    test('自定义 duration', () => {
      loopPlayBGM(audio, melody, { duration: 200 });
      scheduler.tick(125);
      expect(playTone).toHaveBeenNthCalledWith(
        1,
        audio,
        expect.any(Number),
        200,
        expect.any(Object),
      );
    });

    test('自定义 articulation', () => {
      loopPlayBGM(audio, melody, { articulation: { attackTime: 0.01, sustainRatio: 0.5 } });
      scheduler.tick(125);
      expect(playTone).toHaveBeenCalledWith(
        audio,
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          articulation: { attackTime: 0.01, sustainRatio: 0.5 },
        }),
      );
    });
  });

  describe('停止 BGM', () => {
    test('外部通过 scheduler.cancel 可停止循环', () => {
      loopPlayBGM(audio, melody);
      const id = audio.bgmSchedulerId;
      scheduler.cancel(id);
      jest.clearAllMocks();
      scheduler.tick(200);
      expect(playTone).not.toHaveBeenCalled();
    });
  });
});
