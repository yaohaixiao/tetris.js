import Sounds from '@/lib/services/audio/sounds';
import playTone from '@/lib/services/audio/play-tone';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/services/audio/play-tone', () => jest.fn());

jest.mock('@/lib/services/audio/constants/motifs', () => ({
  combo: { shift: 0, speed: 1.0, volume: 1.0 },
  tetris: { shift: 2, speed: 1.5, volume: 1.2 },
  perfect: { shift: 4, speed: 2.0, volume: 1.5 },
}));

jest.mock('@/lib/services/audio/constants/clear/chord-sets.js', () => [
  // set 0: 大三和弦
  [
    [440, 554, 659],
    [587, 740, 880],
    [523, 622, 784],
    [659, 784, 988],
    [440, 659, 880],
  ],
]);

jest.mock('@/lib/services/audio/constants/clear/param-sets.js', () => [
  { volMul: 1.0, spdMul: 1.0, wave: 'square' },
]);

describe('Sounds', () => {
  let sounds;
  let scheduler;
  let audio;

  beforeEach(() => {
    jest.clearAllMocks();

    scheduler = new Scheduler();

    audio = {
      Context: { currentTime: 100 },
      Scheduler: scheduler,
    };

    sounds = new Sounds(audio);
  });

  // =============== 基础音效 ===============

  describe('基础音效（直接调用 playTone）', () => {
    test('LEVEL_CHANGED — 520Hz triangle 80ms', () => {
      sounds.LEVEL_CHANGED();
      expect(playTone).toHaveBeenCalledWith(sounds, 520, 80, {
        volume: 0.2,
        wave: 'triangle',
      });
    });

    test('SWITCH_SCENE — 620Hz triangle 80ms', () => {
      sounds.SWITCH_SCENE();
      expect(playTone).toHaveBeenCalledWith(sounds, 620, 80, {
        volume: 0.2,
        wave: 'triangle',
      });
    });

    test('DIFFICULTY_CHANGED — 880Hz triangle 80ms', () => {
      sounds.DIFFICULTY_CHANGED();
      expect(playTone).toHaveBeenCalledWith(sounds, 880, 80, {
        volume: 0.2,
        wave: 'triangle',
      });
    });

    test('GAME_STARTED — 1319Hz triangle 160ms', () => {
      sounds.GAME_STARTED();
      expect(playTone).toHaveBeenCalledWith(sounds, 1319, 160, {
        volume: 0.22,
        wave: 'triangle',
      });
    });

    test('COUNTDOWN — 784Hz sine 180ms', () => {
      sounds.COUNTDOWN();
      expect(playTone).toHaveBeenCalledWith(sounds, 784, 180, {
        volume: 0.4,
        wave: 'sine',
      });
    });

    test('MOVE — 330Hz 60ms 默认参数', () => {
      sounds.MOVE();
      expect(playTone).toHaveBeenCalledWith(sounds, 330, 60);
    });

    test('ROTATE — 440Hz 60ms', () => {
      sounds.ROTATE();
      expect(playTone).toHaveBeenCalledWith(sounds, 440, 60);
    });

    test('DROP — 220Hz 100ms', () => {
      sounds.DROP();
      expect(playTone).toHaveBeenCalledWith(sounds, 220, 100);
    });

    test('FALL — 180Hz 200ms', () => {
      sounds.FALL();
      expect(playTone).toHaveBeenCalledWith(sounds, 180, 200);
    });

    test('PAUSED — 300Hz 150ms', () => {
      sounds.PAUSED();
      expect(playTone).toHaveBeenCalledWith(sounds, 300, 150);
    });

    test('SECOND_TICK — 880Hz triangle 50ms 低音量', () => {
      sounds.SECOND_TICK();
      expect(playTone).toHaveBeenCalledWith(sounds, 880, 50, {
        volume: 0.085,
        wave: 'triangle',
      });
    });

    test('RESUME — 400Hz 150ms', () => {
      sounds.RESUME();
      expect(playTone).toHaveBeenCalledWith(sounds, 400, 150);
    });

    test('BGM_TOGGLED — 440Hz 100ms', () => {
      sounds.BGM_TOGGLED();
      expect(playTone).toHaveBeenCalledWith(sounds, 440, 100);
    });
  });

  // =============== CLEAR 音效 ===============

  describe('CLEAR — 动机映射', () => {
    test('全清（isPerfectClear=true, lines=1, level=1）使用 perfect 动机', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.CLEAR(1, 1, true);
      const queue = scheduler.sequence.mock.calls[0][0];
      queue[0].fn();

      // setIndex=0, frequencies[1]=[587,740,880], perfect shift=4
      // chord[0] = 587 + 48 = 635
      // speed = 260 * 2.0 * 1.0 = 520
      // volume = 0.32 * 1.5 * 1.0 = 0.48
      expect(playTone).toHaveBeenCalledWith(sounds, 635, 520, {
        volume: 0.48,
        wave: 'square',
        startTime: 100.16,
      });
    });

    test('4行消除（level=1）使用 tetris 动机', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.CLEAR(4, 1, false);
      const queue = scheduler.sequence.mock.calls[0][0];
      queue[0].fn();

      // setIndex=0, frequencies[4]=[440,659,880], tetris shift=2
      // chord[0] = 440 + 24 = 464
      // speed = 260 * 1.5 * 1.0 = 390
      // volume = 0.32 * 1.2 * 1.0 = 0.384
      expect(playTone).toHaveBeenCalledWith(sounds, 464, 390, {
        volume: 0.384,
        wave: 'square',
        startTime: 100.16,
      });
    });

    test('1行消除（level=1）使用 combo 动机', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.CLEAR(1, 1, false);
      const queue = scheduler.sequence.mock.calls[0][0];
      queue[0].fn();

      // setIndex=0, frequencies[1]=[587,740,880], combo shift=0
      // chord[0] = 587
      // speed = 260 * 1.0 * 1.0 = 260
      // volume = 0.32 * 1.0 * 1.0 = 0.32
      expect(playTone).toHaveBeenCalledWith(sounds, 587, 260, {
        volume: 0.32,
        wave: 'square',
        startTime: 100.16,
      });
    });

    test('全清优先级高于 tetris（lines=4, level=1, isPerfectClear=true）', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.CLEAR(4, 1, true);
      const queue = scheduler.sequence.mock.calls[0][0];
      queue[0].fn();

      // perfect shift=4 → chord[0] = 440 + 48 = 488
      expect(playTone).toHaveBeenCalledWith(sounds, 488, 520, {
        volume: 0.48,
        wave: 'square',
        startTime: 100.16,
      });
    });
  });

  describe('CLEAR — 和弦与调度', () => {
    test('CLEAR 调用 scheduler.sequence', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.CLEAR(1, 1, false);

      expect(scheduler.sequence).toHaveBeenCalled();
    });

    test('sequence 入参为包含 3 个元素的队列', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.CLEAR(1, 1, false);

      const queue = scheduler.sequence.mock.calls[0][0];

      expect(Array.isArray(queue)).toBe(true);
      expect(queue.length).toBe(3);
      queue.forEach((item) => {
        expect(item).toHaveProperty('fn');
        expect(typeof item.fn).toBe('function');
      });
    });

    test('三个音轨按 timeouts 错开播放', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.CLEAR(1, 1, false);
      const queue = scheduler.sequence.mock.calls[0][0];

      queue[0].fn();
      queue[1].fn();
      queue[2].fn();

      const calls = playTone.mock.calls;

      expect(calls[0][3].startTime).toBe(100.16);
      expect(calls[1][3].startTime).toBe(100.32);
      expect(calls[2][3].startTime).toBe(100.48);
    });
  });

  // =============== LEVEL_UP 音效 ===============

  describe('LEVEL_UP — 上行音阶', () => {
    test('LEVEL_UP 调用 scheduler.sequence', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.LEVEL_UP();

      expect(scheduler.sequence).toHaveBeenCalled();
    });

    test('sequence 包含 8 个音符', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.LEVEL_UP();

      const queue = scheduler.sequence.mock.calls[0][0];

      expect(queue).toHaveLength(8);
    });

    test('音符频率逐级上升', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.LEVEL_UP();
      const queue = scheduler.sequence.mock.calls[0][0];

      queue.forEach((item) => item.fn());

      const freqs = playTone.mock.calls.map((call) => call[1]);

      expect(freqs).toEqual([523, 587, 659, 784, 880, 1047, 1175, 1319]);
    });
  });

  // =============== GAME_OVER 音效 ===============

  describe('GAME_OVER — 下行悲伤旋律', () => {
    test('GAME_OVER 调用 scheduler.sequence', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.GAME_OVER();

      expect(scheduler.sequence).toHaveBeenCalled();
    });

    test('包含 3 个下行音符', () => {
      jest.spyOn(scheduler, 'sequence');

      sounds.GAME_OVER();
      const queue = scheduler.sequence.mock.calls[0][0];

      expect(queue).toHaveLength(3);

      queue.forEach((item) => item.fn());

      const freqs = playTone.mock.calls.map((call) => call[1]);

      expect(freqs).toEqual([330, 294, 262]);
    });
  });
});
