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

      expect(scheduler.interval).toHaveBeenCalledWith(
        expect.any(Function),
        25,
      );
    });

    test('将 interval id 存到 audio.bgmSchedulerId', () => {
      loopPlayBGM(audio, melody);

      expect(audio.bgmSchedulerId).toBeGreaterThan(0);
    });
  });

  describe('预调度逻辑', () => {
    test('首次 tick 将未来 0.12s 内的音符排入时间线', () => {
      loopPlayBGM(audio, melody);

      scheduler.tick(100);
      scheduler.tick(125);

      expect(playTone).toHaveBeenCalledTimes(2);

      // 第1个音符：melody[0], startTime = 100
      expect(playTone).toHaveBeenNthCalledWith(
        1,
        audio,
        440,
        110,
        expect.objectContaining({
          volume: 0.05,
          wave: 'square',
          gate: 1,
        }),
      );
      expect(playTone.mock.calls[0][3].startTime).toBe(100);

      // 第2个音符：melody[1], startTime = 100.11
      expect(playTone).toHaveBeenNthCalledWith(
        2,
        audio,
        880,
        220,
        expect.objectContaining({
          volume: 0.05,
          wave: 'square',
          gate: 1,
        }),
      );
      expect(playTone.mock.calls[1][3].startTime).toBe(100.11);
    });

    test('休止符（freq=0）不调用 playTone', () => {
      const restMelody = [{ freq: 0, dur: 1 }];

      loopPlayBGM(audio, restMelody);

      scheduler.tick(100);
      scheduler.tick(125);

      expect(playTone).not.toHaveBeenCalled();
    });

    test('后续 tick 继续推进音符', () => {
      loopPlayBGM(audio, melody);

      scheduler.tick(100);
      scheduler.tick(125);
      const firstCallCount = playTone.mock.calls.length;

      // 推进 currentTime 使 limit 扩大
      audio.Context.currentTime = 100.4;

      scheduler.tick(150);

      expect(playTone.mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    test('旋律循环：播完最后一个音符后回到开头', () => {
      const shortMelody = [
        { freq: 440, dur: 1 },
        { freq: 880, dur: 1 },
      ];

      loopPlayBGM(audio, shortMelody, { duration: 100 });

      // 第一轮调度
      scheduler.tick(100);
      scheduler.tick(125);

      expect(playTone).toHaveBeenCalledTimes(2);
      expect(playTone.mock.calls[0][1]).toBe(440);
      expect(playTone.mock.calls[1][1]).toBe(880);

      jest.clearAllMocks();

      // 第一轮后：
      // melody[0] startTime = 100
      // melody[1] startTime = 100 + 0.1 = 100.1
      // nextNoteTime = 100.1 + 0.1 = 100.2, currentNoteIndex = 0（已循环）
      //
      // 推进 currentTime
      audio.Context.currentTime = 100.25;

      // nextTime = 125+25 = 150
      scheduler.tick(150);

      // limit = 100.25 + 0.12 = 100.37
      // nextNoteTime = 100.2 < 100.37 → 排入 melody[0]
      // nextNoteTime → 100.3 < 100.37 → 排入 melody[1]

      expect(playTone).toHaveBeenCalledTimes(2);

      // 第一个是循环后的 melody[0]，频率 440
      expect(playTone.mock.calls[0][1]).toBe(440);
      expect(playTone.mock.calls[0][2]).toBe(100);

      // startTime 浮点精度：100.2 → 100.19999999999999
      expect(playTone.mock.calls[0][3].startTime).toBeCloseTo(100.2, 5);
    });
  });

  describe('自定义参数', () => {
    test('自定义 volume', () => {
      loopPlayBGM(audio, melody, { volume: 0.08 });

      scheduler.tick(100);
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

      scheduler.tick(100);
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

      scheduler.tick(100);
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

      scheduler.tick(100);
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
      loopPlayBGM(audio, melody, {
        articulation: { attackTime: 0.01, sustainRatio: 0.5 },
      });

      scheduler.tick(100);
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
