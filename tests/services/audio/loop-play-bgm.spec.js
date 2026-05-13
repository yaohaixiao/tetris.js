import loopPlayBGM from '@/lib/services/audio/loop-play-bgm.js';
import AudioState from '@/lib/services/audio/state/audio-state.js';
import playTone from '@/lib/services/audio/play-tone.js';

// Mock 依赖模块
jest.mock('@/lib/services/audio/state/audio-state.js', () => ({
  __esModule: true,
  default: {
    audioCtx: {
      currentTime: 100,
    },
    bgmTimer: null,
  },
}));

jest.mock('@/lib/services/audio/play-tone.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('loopPlayBGM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    AudioState.audioCtx.currentTime = 100;
    AudioState.bgmTimer = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该启动调度器并设置定时器', () => {
      loopPlayBGM([{ freq: 440, dur: 1 }]);

      expect(AudioState.bgmTimer).not.toBeNull();
      expect(setTimeout).toHaveBeenCalled();
    });

    it('应该为每个音符调用 playTone', () => {
      const melody = [
        { freq: 440, dur: 1 },
        { freq: 880, dur: 2 },
      ];

      loopPlayBGM(melody);

      // 推进时间使调度器执行
      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== 默认参数 ====================
  describe('默认参数', () => {
    it('不传 options 时应该使用默认值', () => {
      const melody = [{ freq: 440, dur: 1 }];

      loopPlayBGM(melody);

      // 推进时间使调度器执行
      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledWith(
        440,
        110, // dur * duration = 1 * 110
        expect.objectContaining({
          volume: 0.05,
          wave: 'square',
          gate: 1,
          articulation: {},
        }),
      );
    });

    it('options 为空对象时应该使用默认值', () => {
      const melody = [{ freq: 440, dur: 1 }];

      loopPlayBGM(melody, {});

      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledWith(
        440,
        110,
        expect.objectContaining({
          volume: 0.05,
          wave: 'square',
          gate: 1,
          articulation: {},
        }),
      );
    });
  });

  // ==================== 自定义参数 ====================
  describe('自定义参数', () => {
    it('应该支持自定义 duration', () => {
      const melody = [{ freq: 440, dur: 2 }];

      loopPlayBGM(melody, { duration: 200 });

      jest.advanceTimersByTime(25);

      // stepDur = 2 * 200 = 400
      expect(playTone).toHaveBeenCalledWith(440, 400, expect.any(Object));
    });

    it('应该支持自定义 volume', () => {
      const melody = [{ freq: 440, dur: 1 }];

      loopPlayBGM(melody, { volume: 0.3 });

      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledWith(
        440,
        expect.any(Number),
        expect.objectContaining({ volume: 0.3 }),
      );
    });

    it('应该支持自定义 wave', () => {
      const melody = [{ freq: 440, dur: 1 }];

      loopPlayBGM(melody, { wave: 'sine' });

      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledWith(
        440,
        expect.any(Number),
        expect.objectContaining({ wave: 'sine' }),
      );
    });

    it('应该支持自定义 gate', () => {
      const melody = [{ freq: 440, dur: 1 }];

      loopPlayBGM(melody, { gate: 0.5 });

      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledWith(
        440,
        expect.any(Number),
        expect.objectContaining({ gate: 0.5 }),
      );
    });

    it('应该支持自定义 articulation', () => {
      const melody = [{ freq: 440, dur: 1 }];
      const articulation = { attackTime: 0.01, releaseTime: 0.05, sustainRatio: 0.5 };

      loopPlayBGM(melody, { articulation });

      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledWith(
        440,
        expect.any(Number),
        expect.objectContaining({ articulation }),
      );
    });
  });

  // ==================== 休止符处理 ====================
  describe('休止符处理', () => {
    it('频率为 0 时不应该调用 playTone', () => {
      const melody = [
        { freq: 440, dur: 1 },
        { freq: 0, dur: 1 },   // 休止符
        { freq: 880, dur: 1 },
      ];

      loopPlayBGM(melody);
      jest.advanceTimersByTime(25);

      // 只应该为两个非休止符调用 playTone
      expect(playTone).toHaveBeenCalledTimes(2);
      expect(playTone).toHaveBeenNthCalledWith(1, 440, expect.any(Number), expect.any(Object));
      expect(playTone).toHaveBeenNthCalledWith(2, 880, expect.any(Number), expect.any(Object));
    });

    it('休止符仍然应该推进 nextNoteTime', () => {
      const melody = [
        { freq: 440, dur: 1 },
        { freq: 0, dur: 2 },   // 休止符，时长为 2 倍
        { freq: 880, dur: 1 },
      ];

      loopPlayBGM(melody);
      jest.advanceTimersByTime(25);

      // 休止符推进了 2 * 110 = 220ms
      // 第一个音符 startTime = 100
      // 休止符推进，第三个音符 startTime 应该加上休止符时长
      expect(playTone).toHaveBeenNthCalledWith(
        2,
        880,
        expect.any(Number),
        expect.objectContaining({
          startTime: expect.any(Number),
        }),
      );

      // 验证第三个音符的 startTime
      // nextNoteTime 初始 = 100
      // 第一个音符后 = 100 + 110/1000 = 100.11
      // 休止符后 = 100.11 + 220/1000 = 100.33
      const thirdNoteCall = playTone.mock.calls[1];
      expect(thirdNoteCall[2].startTime).toBeCloseTo(100.33, 10);
    });
  });

  // ==================== 音符定时 ====================
  describe('音符定时', () => {
    it('应该使用 AudioContext 时间线进行精确排程', () => {
      const melody = [{ freq: 440, dur: 1 }];

      loopPlayBGM(melody);
      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledWith(
        440,
        expect.any(Number),
        expect.objectContaining({
          startTime: 100, // 第一个音符立即开始
        }),
      );
    });

    it('音符时长应该基于 dur × duration 计算', () => {
      const melody = [
        { freq: 440, dur: 1.5 },
        { freq: 880, dur: 0.5 },
      ];

      loopPlayBGM(melody, { duration: 200 });
      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenNthCalledWith(1, 440, 300, expect.any(Object));  // 1.5 * 200 = 300
      expect(playTone).toHaveBeenNthCalledWith(2, 880, 100, expect.any(Object));  // 0.5 * 200 = 100
    });

    it('音符应该依次排入，startTime 逐步推进', () => {
      const melody = [
        { freq: 440, dur: 1 },
        { freq: 880, dur: 2 },
      ];

      loopPlayBGM(melody, { duration: 100 });
      jest.advanceTimersByTime(25);

      // 第一个音符 startTime = 100
      // stepdur = 1 * 100 = 100ms = 0.1s
      // 第二个音符 startTime = 100 + 0.1 = 100.1
      expect(playTone).toHaveBeenNthCalledWith(
        2,
        880,
        200,
        expect.objectContaining({
          startTime: 100.1,
        }),
      );
    });
  });

  // ==================== 循环播放 ====================
  describe('循环播放', () => {
    it('到达旋律末尾时应该从头开始', () => {
      const melody = [
        { freq: 440, dur: 1 },
        { freq: 880, dur: 1 },
      ];

      loopPlayBGM(melody);

      // 第一次调度
      jest.advanceTimersByTime(25);
      expect(playTone).toHaveBeenCalledTimes(2);

      // 清理后重新设置时间，模拟下一轮
      playTone.mockClear();

      // 推进足够时间让下一轮调度触发
      // 需要 currentTime + SCHEDULE_AHEAD_TIME > nextNoteTime
      // nextNoteTime = 100 + 0.22 = 100.22
      // currentTime 需要 >= 100.22 - 0.12 = 100.1
      AudioState.audioCtx.currentTime = 100.2;

      jest.advanceTimersByTime(25);
      jest.advanceTimersByTime(25);
      jest.advanceTimersByTime(25);

      // 应该再次为两个音符调用 playTone（循环）
      expect(playTone).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== 调度窗口 ====================
  describe('调度窗口', () => {
    it('只应该调度 SCHEDULE_AHEAD_TIME 窗口内的音符', () => {
      const melody = Array.from({ length: 100 }, (_, i) => ({
        freq: 440 + i * 10,
        dur: 1,
      }));

      loopPlayBGM(melody, { duration: 1000 });
      jest.advanceTimersByTime(25);

      // 每个音符 1000ms = 1s
      // SCHEDULE_AHEAD_TIME = 0.12s
      // 应该只调度了 1 个音符（第一个音符排入后 nextNoteTime 推进 1s，超出窗口）
      expect(playTone).toHaveBeenCalledTimes(1);
    });

    it('短音符应该一次调度多个', () => {
      const melody = Array.from({ length: 10 }, (_, i) => ({
        freq: 440 + i * 10,
        dur: 0.01,
      }));

      loopPlayBGM(melody, { duration: 100 });
      jest.advanceTimersByTime(25);

      // 每个音符 1ms = 0.001s
      // 0.12s 窗口可以容纳约 120 个音符
      // 但旋律只有 10 个，所以应该全部被调度
      expect(playTone).toHaveBeenCalledTimes(10);
    });
  });

  // ==================== AudioState.bgmTimer ====================
  describe('AudioState.bgmTimer', () => {
    it('应该将定时器 ID 存储到 AudioState.bgmTimer', () => {
      loopPlayBGM([{ freq: 440, dur: 1 }]);

      expect(AudioState.bgmTimer).not.toBeNull();
      expect(typeof AudioState.bgmTimer).toBe('number');
    });

    it('外部应该能通过 clearTimeout 停止调度', () => {
      loopPlayBGM([{ freq: 440, dur: 1 }]);

      clearTimeout(AudioState.bgmTimer);

      // 推进时间
      jest.advanceTimersByTime(1000);

      // 第一次调度应该已经执行，但后续不应再有新调度
      expect(playTone).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('空旋律时应该正常工作不崩溃', () => {
      expect(() => {
        loopPlayBGM([]);
      }).not.toThrow();

      jest.advanceTimersByTime(25);

      // 没有音符，不应该调用 playTone
      expect(playTone).not.toHaveBeenCalled();
    });

    it('旋律只有一个音符时应该循环播放', () => {
      const melody = [{ freq: 440, dur: 1 }];

      loopPlayBGM(melody);
      jest.advanceTimersByTime(25);
      expect(playTone).toHaveBeenCalledTimes(1);

      // 推进足够时间让循环触发
      AudioState.audioCtx.currentTime = 100.2;
      jest.advanceTimersByTime(25);
      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledTimes(2);
    });

    it('duration 为 0 时不崩溃', () => {
      const melody = [{ freq: 440, dur: 1 }];

      loopPlayBGM(melody, { duration: 0 });
      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledWith(440, 0, expect.any(Object));
    });

    it('freq 为负数时应该正常播放', () => {
      const melody = [{ freq: -440, dur: 1 }];

      loopPlayBGM(melody);
      jest.advanceTimersByTime(25);

      // freq > 0 为 false，-440 > 0 是 false
      // 所以负数频率会被当作休止符处理
      expect(playTone).not.toHaveBeenCalled();
    });

    it('音符时长为 0 时仍然应该推进时间', () => {
      const melody = [
        { freq: 440, dur: 0 },
        { freq: 880, dur: 1 },
      ];

      loopPlayBGM(melody);
      jest.advanceTimersByTime(25);

      expect(playTone).toHaveBeenCalledTimes(2);
      // 第一个音符时长为 0，startTime 应该等于第二个音符
      expect(playTone).toHaveBeenNthCalledWith(
        1,
        440,
        0,
        expect.objectContaining({ startTime: 100 }),
      );
    });
  });
});
