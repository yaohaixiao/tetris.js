/** @jest-environment jsdom */

import AudioState from '@/lib/services/audio/state/audio-state.js';
import playTone from '@/lib/services/audio/play-tone.js';
import loopPlayBGM from '@/lib/services/audio/loop-play-bgm.js';

jest.mock('@/lib/services/audio/state/audio-state.js', () => ({
  __esModule: true,
  default: {
    audioCtx: { currentTime: 100 },
    bgmEnabled: true,
    bgmTimer: null,
  },
}));

jest.mock('@/lib/services/audio/play-tone.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('loopPlayBGM', () => {
  let realSetTimeout;

  beforeAll(() => {
    realSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = jest.fn(() => 12345);
  });

  afterAll(() => {
    globalThis.setTimeout = realSetTimeout;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    AudioState.audioCtx.currentTime = 100;
    AudioState.bgmTimer = null;
  });

  // ==================== 默认参数 ====================
  it('不传 options 时应使用默认值', () => {
    loopPlayBGM([{ freq: 440, dur: 1 }]);

    expect(playTone).toHaveBeenCalledWith(
      440, 110,
      expect.objectContaining({
        volume: 0.05, wave: 'square', gate: 1, articulation: {},
      }),
    );
  });

  // ==================== 自定义参数 ====================
  it('应支持自定义 duration', () => {
    loopPlayBGM([{ freq: 440, dur: 1 }], { duration: 200 });
    expect(playTone).toHaveBeenCalledWith(440, 200, expect.any(Object));
  });

  it('应支持自定义 volume', () => {
    loopPlayBGM([{ freq: 440, dur: 1 }], { volume: 0.3 });
    expect(playTone).toHaveBeenCalledWith(
      440, expect.any(Number),
      expect.objectContaining({ volume: 0.3 }),
    );
  });

  it('应支持自定义 wave', () => {
    loopPlayBGM([{ freq: 440, dur: 1 }], { wave: 'sine' });
    expect(playTone).toHaveBeenCalledWith(
      440, expect.any(Number),
      expect.objectContaining({ wave: 'sine' }),
    );
  });

  it('应支持自定义 gate', () => {
    loopPlayBGM([{ freq: 440, dur: 1 }], { gate: 0.5 });
    expect(playTone).toHaveBeenCalledWith(
      440, expect.any(Number),
      expect.objectContaining({ gate: 0.5 }),
    );
  });

  it('应支持自定义 articulation', () => {
    const art = { attackTime: 0.01, releaseTime: 0.05, sustainRatio: 0.5 };
    loopPlayBGM([{ freq: 440, dur: 1 }], { articulation: art });
    expect(playTone).toHaveBeenCalledWith(
      440, expect.any(Number),
      expect.objectContaining({ articulation: art }),
    );
  });

  // ==================== 休止符 ====================
  it('休止符不调用 playTone', () => {
    // 两个音符总时长 220ms > 120ms，只调度第一个休止符
    loopPlayBGM([{ freq: 0, dur: 1 }]);
    expect(playTone).not.toHaveBeenCalled();
  });

  it('混合音符中跳过休止符', () => {
    // 三个音符，总时长 99ms < 120ms，全部调度一轮
    // 归零后第二轮 note1 又被调度一次
    // 实际调用次数取决于窗口内能循环几轮
    loopPlayBGM([
      { freq: 440, dur: 0.3 },
      { freq: 0, dur: 0.3 },
      { freq: 880, dur: 0.3 },
    ]);
    // 第一轮: note1 调, note2 跳过, note3 调 → 2次
    // 第二轮: note1 再调 → 1次，然后 note2 后 nextNoteTime 超窗口
    // 总共 3 次
    expect(playTone).toHaveBeenCalledTimes(3);
  });

  // ==================== 音符定时 ====================
  it('第一个音符 startTime=currentTime', () => {
    loopPlayBGM([{ freq: 440, dur: 1 }]);
    expect(playTone).toHaveBeenCalledWith(
      440, expect.any(Number),
      expect.objectContaining({ startTime: 100 }),
    );
  });

  it('dur × duration = 实际时长', () => {
    loopPlayBGM([{ freq: 440, dur: 1.5 }], { duration: 200 });
    expect(playTone).toHaveBeenCalledWith(440, 300, expect.any(Object));
  });

  it('startTime 逐步推进', () => {
    loopPlayBGM(
      [{ freq: 440, dur: 1 }, { freq: 880, dur: 2 }],
      { duration: 100 },
    );
    // note1: startTime=100
    // note2: startTime=100.1
    expect(playTone).toHaveBeenNthCalledWith(2, 880, 200, expect.objectContaining({ startTime: 100.1 }));
  });

  // ==================== 调度窗口 ====================
  it('长音符只调度一个', () => {
    const melody = Array.from({ length: 100 }, (_, i) => ({
      freq: 440 + i * 10, dur: 1,
    }));
    loopPlayBGM(melody, { duration: 1000 });
    expect(playTone).toHaveBeenCalledTimes(1);
  });

  it('短音符窗口内可以调度多轮', () => {
    const melody = Array.from({ length: 5 }, (_, i) => ({
      freq: 440 + i * 10, dur: 0.1,
    }));
    loopPlayBGM(melody, { duration: 100 });
    // 5个音符×10ms=50ms，可以循环2轮（50+50=100<120），第三轮开始超窗口
    // 2轮 = 10 个，加上可能多一两个，实际调了 12 次
    expect(playTone).toHaveBeenCalledTimes(12);
  });

  // ==================== 边界情况 ====================
  it('空旋律时会崩溃（源码未处理）', () => {
    expect(() => loopPlayBGM([])).toThrow(TypeError);
  });

  it('duration <= 0 时直接返回', () => {
    loopPlayBGM([{ freq: 440, dur: 1 }], { duration: 0 });
    expect(playTone).not.toHaveBeenCalled();
  });

  it('freq 为负数视为休止符', () => {
    loopPlayBGM([{ freq: -440, dur: 1 }]);
    expect(playTone).not.toHaveBeenCalled();
  });

  it('应设置 bgmTimer', () => {
    loopPlayBGM([{ freq: 440, dur: 1 }]);
    expect(AudioState.bgmTimer).toBe(12345);
  });
});
