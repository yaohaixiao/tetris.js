import Replay from '@/lib/runtime/replay-runtime';
import EventBus from '@/lib/core/event-bus';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

describe('Replay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Replay.reset();
    Replay.timestamp = 0;
  });

  // ========== 初始状态 ==========
  describe('初始状态', () => {
    test('recording 和 playing 都为 false', () => {
      expect(Replay.recording).toBe(false);
      expect(Replay.playing).toBe(false);
    });

    test('data 为空数组', () => {
      expect(Replay.data).toEqual([]);
    });

    test('cursor 为 0', () => {
      expect(Replay.cursor).toBe(0);
    });

    test('playElapsed 为 0', () => {
      expect(Replay.playElapsed).toBe(0);
    });

    test('hasData 返回 false', () => {
      expect(Replay.hasData).toBe(false);
    });
  });

  // ========== hasData ==========
  describe('hasData', () => {
    test('data 有数据时返回 true', () => {
      Replay.data = [{ ms: 100, cmd: { action: 'MOVE_LEFT' } }];
      expect(Replay.hasData).toBe(true);
    });

    test('data 为空数组时返回 false', () => {
      Replay.data = [];
      expect(Replay.hasData).toBe(false);
    });
  });

  // ========== 录制 ==========
  describe('startRecord / stopRecord', () => {
    test('startRecord 设置 recording 为 true', () => {
      Replay.timestamp = 5000;
      Replay.startRecord();
      expect(Replay.recording).toBe(true);
    });

    test('startRecord 清空 data', () => {
      Replay.data = [{ ms: 100 }];
      Replay.startRecord();
      expect(Replay.data).toEqual([]);
    });

    test('startRecord 清空 pieceSequence', () => {
      Replay.pieceSequence = [{ type: 'I' }];
      Replay.startRecord();
      expect(Replay.pieceSequence).toEqual([]);
    });

    test('startRecord 重置 pieceIndex', () => {
      Replay.pieceIndex = 5;
      Replay.startRecord();
      expect(Replay.pieceIndex).toBe(0);
    });

    test('startRecord 重置 playElapsed', () => {
      Replay.playElapsed = 999;
      Replay.startRecord();
      expect(Replay.playElapsed).toBe(0);
    });

    test('startRecord 使用 timestamp 作为 startTime', () => {
      Replay.timestamp = 5000;
      Replay.startRecord();
      expect(Replay.startTime).toBe(5000);
    });

    test('stopRecord 设置 recording 为 false', () => {
      Replay.startRecord();
      Replay.stopRecord();
      expect(Replay.recording).toBe(false);
    });
  });

  // ========== 播放 ==========
  describe('startPlay / stopPlay', () => {
    test('startPlay 设置 playing 为 true', () => {
      Replay.timestamp = 5000;
      Replay.startPlay();
      expect(Replay.playing).toBe(true);
    });

    test('startPlay 重置 cursor', () => {
      Replay.cursor = 10;
      Replay.startPlay();
      expect(Replay.cursor).toBe(0);
    });

    test('startPlay 重置 pieceIndex', () => {
      Replay.pieceIndex = 3;
      Replay.startPlay();
      expect(Replay.pieceIndex).toBe(0);
    });

    test('startPlay 使用 timestamp 作为 startTime', () => {
      Replay.timestamp = 5000;
      Replay.startPlay();
      expect(Replay.startTime).toBe(5000);
    });

    test('stopPlay 设置 playing 为 false', () => {
      Replay.startPlay();
      Replay.stopPlay();
      expect(Replay.playing).toBe(false);
    });
  });

  // ========== syncPlayElapsed ==========
  describe('syncPlayElapsed', () => {
    test('不在播放状态时不更新', () => {
      Replay.playElapsed = 100;
      Replay.syncPlayElapsed({ timestamp: 500, isBlocked: false });
      expect(Replay.playElapsed).toBe(100);
    });

    test('被阻塞时不更新', () => {
      Replay.playing = true;
      Replay.startTime = 0;
      Replay.playElapsed = 100;
      Replay.syncPlayElapsed({ timestamp: 500, isBlocked: true });
      expect(Replay.playElapsed).toBe(100);
    });

    test('正常情况：playElapsed 同步到差值', () => {
      Replay.playing = true;
      Replay.startTime = 1000;
      Replay.playElapsed = 0;
      Replay.syncPlayElapsed({ timestamp: 2000, isBlocked: false });
      expect(Replay.playElapsed).toBe(1000);
    });

    test('跳跃超过 1000ms 时限制增量', () => {
      Replay.playing = true;
      Replay.startTime = 0;
      Replay.playElapsed = 0;
      Replay.syncPlayElapsed({ timestamp: 5000, isBlocked: false });
      // 跳了 5000ms，但只增加 1000ms
      expect(Replay.playElapsed).toBe(1000);
    });

    test('跳跃超过 1000ms 时 startTime 被同步调整', () => {
      Replay.playing = true;
      Replay.startTime = 0;
      Replay.playElapsed = 0;
      Replay.syncPlayElapsed({ timestamp: 5000, isBlocked: false });
      // startTime 应该被拨到 5000 - 1000 = 4000
      expect(Replay.startTime).toBe(4000);
    });
  });

  // ========== update（播放逻辑） ==========
  describe('update', () => {
    test('不在播放状态时直接返回', () => {
      Replay.data = [{ ms: 100, cmd: { action: 'MOVE_LEFT' } }];
      Replay.update({ getSpeed: () => 500, timestamp: 1000 });
      expect(EventBus.emit).not.toHaveBeenCalled();
    });

    test('播放完成时发射 game:update:mode 并停止', () => {
      Replay.playing = true;
      Replay.cursor = 2;
      Replay.data = [
        { ms: 100, cmd: { action: 'MOVE_LEFT' } },
        { ms: 200, cmd: { action: 'DROP' } },
      ];
      Replay.update({ getSpeed: () => 500, timestamp: 1000 });

      expect(EventBus.emit).toHaveBeenCalledWith('game:update:mode', {
        mode: 'game-over',
      });
      expect(Replay.playing).toBe(false);
    });

    test('正常推进：按时间顺序 emit 指令', () => {
      Replay.playing = true;
      Replay.cursor = 0;
      Replay.playElapsed = 250;
      Replay.data = [
        { ms: 100, cmd: { action: 'MOVE_LEFT' } },
        { ms: 200, cmd: { action: 'ROTATE' } },
        { ms: 300, cmd: { action: 'DROP' } },
      ];

      Replay.update({ getSpeed: () => 500, timestamp: 1000 });

      // 100 和 200 都应被执行，300 还没到
      expect(EventBus.emit).toHaveBeenCalledTimes(2);
      expect(EventBus.emit).toHaveBeenNthCalledWith(1, 'dispatch:command', {
        action: 'MOVE_LEFT',
      });
      expect(EventBus.emit).toHaveBeenNthCalledWith(2, 'dispatch:command', {
        action: 'ROTATE',
      });
      expect(Replay.cursor).toBe(2);
    });

    test('快进逻辑：gap 超过 2 倍下落间隔时快进', () => {
      Replay.playing = true;
      Replay.cursor = 0;
      Replay.playElapsed = 0;
      Replay.startTime = 0;
      Replay.data = [
        { ms: 5000, cmd: { action: 'AUTO_TICK' } }, // gap = 5000
      ];

      Replay.update({ getSpeed: () => 500, timestamp: 3000 });

      /*
       * gap(5000) > dropInterval(500) * 2 = 1000，触发快进
       * maxSkip = 1000, skip = min(5000 - 500, 1000) = 1000
       * playElapsed = 0 + 1000 = 1000
       */
      expect(Replay.playElapsed).toBe(1000);
    });

    test('数据为空时不报错', () => {
      Replay.playing = true;
      Replay.data = [];
      expect(() =>
        Replay.update({ getSpeed: () => 500, timestamp: 1000 }),
      ).not.toThrow();
    });
  });

  // ========== reset / clear ==========
  describe('reset / clear', () => {
    test('reset 重置所有状态', () => {
      Replay.recording = true;
      Replay.playing = true;
      Replay.data = [{ ms: 100 }];
      Replay.cursor = 5;
      Replay.reset();

      expect(Replay.recording).toBe(false);
      expect(Replay.playing).toBe(false);
      expect(Replay.data).toEqual([]);
      expect(Replay.cursor).toBe(0);
    });

    test('clear 重置所有字段', () => {
      Replay.recording = true;
      Replay.playing = true;
      Replay.data = [{ ms: 100 }];
      Replay.cursor = 5;
      Replay.pieceSequence = [{ type: 'I' }];
      Replay.pieceIndex = 3;
      Replay.startTime = 999;
      Replay.clear();

      expect(Replay.recording).toBe(false);
      expect(Replay.playing).toBe(false);
      expect(Replay.data).toEqual([]);
      expect(Replay.cursor).toBe(0);
      expect(Replay.pieceSequence).toEqual([]);
      expect(Replay.pieceIndex).toBe(0);
      expect(Replay.startTime).toBe(0);
    });
  });

  // ========== subscribe 注册的事件 ==========
  describe('subscribe', () => {
    test('subscribe 注册所有事件监听', () => {
      Replay.subscribe();

      expect(EventBus.on).toHaveBeenCalledWith(
        'replay:start:record',
        expect.any(Function),
      );
      expect(EventBus.on).toHaveBeenCalledWith(
        'replay:add:record',
        expect.any(Function),
      );
      expect(EventBus.on).toHaveBeenCalledWith(
        'replay:add:piece',
        expect.any(Function),
      );
      expect(EventBus.on).toHaveBeenCalledWith(
        'replay:start:play',
        expect.any(Function),
      );
      expect(EventBus.on).toHaveBeenCalledWith(
        'replay:reset',
        expect.any(Function),
      );
      expect(EventBus.on).toHaveBeenCalledWith(
        'replay:game:over',
        expect.any(Function),
      );
      expect(EventBus.on).toHaveBeenCalledWith(
        'replay:stop:clear:lines',
        expect.any(Function),
      );
    });
  });

  // ========== EventBus 回调逻辑 ==========
  describe('事件回调', () => {
    test('replay:add:record 在录制时添加数据', () => {
      Replay.recording = true;
      Replay.subscribe();

      // 取出注册的回调并手动调用
      const addRecordCallback = EventBus.on.mock.calls.find(
        (call) => call[0] === 'replay:add:record',
      )[1];

      addRecordCallback({ ms: 100, cmd: { action: 'MOVE_LEFT' } });
      expect(Replay.data.length).toBe(1);
    });

    test('replay:add:record 不在录制时不添加', () => {
      Replay.recording = false;
      Replay.subscribe();

      const addRecordCallback = EventBus.on.mock.calls.find(
        (call) => call[0] === 'replay:add:record',
      )[1];

      addRecordCallback({ ms: 100, cmd: { action: 'MOVE_LEFT' } });
      expect(Replay.data.length).toBe(0);
    });

    test('replay:game:over 有数据时发射 game:replay:prepare:board', () => {
      Replay.data = [{ ms: 100 }];
      Replay.subscribe();

      const gameOverCallback = EventBus.on.mock.calls.find(
        (call) => call[0] === 'replay:game:over',
      )[1];

      gameOverCallback();
      expect(EventBus.emit).toHaveBeenCalledWith('game:replay:prepare:board');
    });

    test('replay:game:over 无数据时发射 game:update:mode', () => {
      Replay.data = [];
      Replay.subscribe();

      const gameOverCallback = EventBus.on.mock.calls.find(
        (call) => call[0] === 'replay:game:over',
      )[1];

      gameOverCallback();
      expect(EventBus.emit).toHaveBeenCalledWith('game:update:mode', {
        mode: 'game-over',
      });
    });
  });
});
