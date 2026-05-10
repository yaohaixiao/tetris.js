// Mock EventBus（Base 的依赖）
jest.mock('@/lib/core/event-bus', () => ({
  events: new Map(),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  once: jest.fn(),
  clear: jest.fn(),
}));

// Mock structuredClone（Node 18+ 原生支持，低版本需要）
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

import ReplayController from '@/lib/runtime/replay-controller.js';

describe('ReplayController', () => {
  let replay;

  beforeEach(() => {
    replay = new ReplayController();

      // 把继承的方法变成 spy，其他测试才能用 toHaveBeenCalledWith
      jest.spyOn(replay, 'emit');
      jest.spyOn(replay, 'on');
      jest.spyOn(replay, 'off');
  });

  // ==================== 基础属性 ====================
  describe('hasData', () => {
    it('data 为空时返回 false', () => {
      expect(replay.hasData).toBe(false);
    });

    it('data 有数据时返回 true', () => {
      replay.data = [{ ms: 100, cmd: 'test' }];
      expect(replay.hasData).toBe(true);
    });
  });

  // ==================== 录制 ====================
  describe('startRecord', () => {
    it('应该开启录制状态', () => {
      replay.startRecord();
      expect(replay.recording).toBe(true);
    });

    it('应该清空旧数据', () => {
      replay.data = [{ ms: 100, cmd: 'old' }];
      replay.pieceSequence = [{ type: 'I' }];
      replay.startRecord();

      expect(replay.data).toEqual([]);
      expect(replay.pieceSequence).toEqual([]);
    });

    it('应该重置 pieceIndex 和 playElapsed', () => {
      replay.pieceIndex = 10;
      replay.playElapsed = 5000;
      replay.startRecord();

      expect(replay.pieceIndex).toBe(0);
      expect(replay.playElapsed).toBe(0);
    });

    it('应该将 startTime 设置为当前 timestamp', () => {
      replay.timestamp = 999;
      replay.startRecord();
      expect(replay.startTime).toBe(999);
    });
  });

  describe('stopRecord', () => {
    it('应该关闭录制标志', () => {
      replay.recording = true;
      replay.stopRecord();
      expect(replay.recording).toBe(false);
    });
  });

  // ==================== 回放 ====================
  describe('startPlay', () => {
    it('应该开启回放状态', () => {
      replay.startPlay();
      expect(replay.playing).toBe(true);
    });

    it('应该重置 cursor 和 pieceIndex', () => {
      replay.cursor = 5;
      replay.pieceIndex = 8;
      replay.startPlay();

      expect(replay.cursor).toBe(0);
      expect(replay.pieceIndex).toBe(0);
    });

    it('应该将 startTime 设置为当前 timestamp', () => {
      replay.timestamp = 1234;
      replay.startPlay();
      expect(replay.startTime).toBe(1234);
    });
  });

  describe('stopPlay', () => {
    it('应该关闭回放标志', () => {
      replay.playing = true;
      replay.stopPlay();
      expect(replay.playing).toBe(false);
    });
  });

  // ==================== getNextPiece ====================
  describe('getNextPiece', () => {
    it('非回放状态返回 null', () => {
      replay.playing = false;
      replay.pieceSequence = [{ type: 'T' }];
      replay.pieceIndex = 0;

      const result = replay.getNextPiece();

      expect(result).toEqual({ curr: null, next: null });
    });

    it('应该返回当前方块和下一个方块', () => {
      replay.playing = true;
      replay.pieceSequence = [
        { type: 'T', shape: [[0, 1, 0]] },
        { type: 'L', shape: [[1, 1, 1]] },
      ];
      replay.pieceIndex = 0;

      const result = replay.getNextPiece();

      expect(result.curr).toEqual({ type: 'T', shape: [[0, 1, 0]] });
      expect(result.next).toEqual({ type: 'L', shape: [[1, 1, 1]] });
      expect(replay.pieceIndex).toBe(1);
    });

    it('最后一个方块时 next 为 null', () => {
      replay.playing = true;
      replay.pieceSequence = [{ type: 'S' }];
      replay.pieceIndex = 0;

      const result = replay.getNextPiece();

      expect(result.curr).toEqual({ type: 'S' });
      expect(result.next).toBeNull();
    });

    it('pieceSequence 为空时返回 null', () => {
      replay.playing = true;
      replay.pieceSequence = [];
      replay.pieceIndex = 0;

      const result = replay.getNextPiece();

      expect(result).toEqual({ curr: null, next: null });
    });

    it('pieceIndex 越界时返回 null', () => {
      replay.playing = true;
      replay.pieceSequence = [{ type: 'Z' }];
      replay.pieceIndex = 1;

      const result = replay.getNextPiece();

      expect(result).toEqual({ curr: null, next: null });
    });

    it('多次调用应该正常推进 pieceIndex', () => {
      replay.playing = true;
      replay.pieceSequence = [{ type: 'O' }, { type: 'I' }, { type: 'J' }];
      replay.pieceIndex = 0;

      const r1 = replay.getNextPiece();
      expect(r1.curr.type).toBe('O');
      expect(replay.pieceIndex).toBe(1);

      const r2 = replay.getNextPiece();
      expect(r2.curr.type).toBe('I');
      expect(replay.pieceIndex).toBe(2);

      const r3 = replay.getNextPiece();
      expect(r3.curr.type).toBe('J');
      expect(r3.next).toBeNull();
      expect(replay.pieceIndex).toBe(3);
    });
  });

  // ==================== syncPlayElapsed ====================
  describe('syncPlayElapsed', () => {
    it('非回放状态应该跳过', () => {
      replay.playing = false;
      replay.startTime = 1000;
      replay.syncPlayElapsed({ timestamp: 2000, isBlocked: false });
      expect(replay.playElapsed).toBe(0);
    });

    it('阻塞状态应该跳过', () => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.syncPlayElapsed({ timestamp: 2000, isBlocked: true });
      expect(replay.playElapsed).toBe(0);
    });

    it('应该正常推进 playElapsed', () => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.syncPlayElapsed({ timestamp: 1500, isBlocked: false });
      expect(replay.playElapsed).toBe(500);
    });

    it('跳跃超过 1 秒应该限制为最多快进 1 秒', () => {
      replay.playing = true;
      replay.playElapsed = 1000;
      replay.startTime = 0;
      replay.syncPlayElapsed({ timestamp: 5000, isBlocked: false });
      expect(replay.playElapsed).toBe(2000);
    });

    it('正常小幅前进不应被限制', () => {
      replay.playing = true;
      replay.playElapsed = 1000;
      replay.startTime = 0;
      replay.syncPlayElapsed({ timestamp: 1800, isBlocked: false });
      expect(replay.playElapsed).toBe(1800);
    });
  });

  // ==================== update ====================
  describe('update', () => {
    it('非回放状态直接返回', () => {
      replay.playing = false;
      replay.update({ getSpeed: () => 1000, timestamp: 100 });
      expect(replay.cursor).toBe(0);
    });

    it('回放完毕停止播放并发送 game-over', () => {
      replay.playing = true;
      replay.data = [{ ms: 100, cmd: 'test' }];
      replay.cursor = 1;

      replay.update({ getSpeed: () => 1000, timestamp: 1000 });

      expect(replay.playing).toBe(false);
      expect(replay.emit).toHaveBeenCalledWith('game:update:mode', {
        mode: 'game-over',
      });
    });

    it('空数据不应崩溃', () => {
      replay.playing = true;
      expect(() => {
        replay.update({ getSpeed: () => 1000, timestamp: 100 });
      }).not.toThrow();
    });

    it('应该将已到时的 command 逐个 emit', () => {
      replay.playing = true;
      replay.playElapsed = 200;
      replay.data = [
        { ms: 100, cmd: { action: 'move', payload: {} } },
        { ms: 200, cmd: { action: 'rotate', payload: {} } },
      ];

      replay.update({ getSpeed: () => 1000, timestamp: 1000 });

      expect(replay.emit).toHaveBeenCalledWith('dispatch:command', {
        action: 'move',
        payload: {},
      });
      expect(replay.emit).toHaveBeenCalledWith('dispatch:command', {
        action: 'rotate',
        payload: {},
      });
      expect(replay.cursor).toBe(2);
    });

    it('快进超过 2 倍间隔时应快速跳过', () => {
      replay.playing = true;
      replay.playElapsed = 0;
      replay.data = [{ ms: 5000, cmd: { action: 'drop', payload: {} } }];
      replay.cursor = 0;

      replay.update({ getSpeed: () => 1000, timestamp: 10000 });

      // playElapsed 应该被快进
      expect(replay.playElapsed).toBeGreaterThan(0);
    });
  });

  // ==================== clear / reset ====================
  describe('clear', () => {
    it('应该重置所有状态', () => {
      replay.recording = true;
      replay.playing = true;
      replay.cursor = 5;
      replay.data = [{ ms: 100, cmd: 'test' }];
      replay.pieceSequence = [{ type: 'J' }];
      replay.pieceIndex = 3;
      replay.startTime = 9999;

      replay.clear();

      expect(replay.recording).toBe(false);
      expect(replay.playing).toBe(false);
      expect(replay.cursor).toBe(0);
      expect(replay.data).toEqual([]);
      expect(replay.pieceSequence).toEqual([]);
      expect(replay.pieceIndex).toBe(0);
      expect(replay.startTime).toBe(0);
    });
  });

  describe('reset', () => {
    it('应该停止录制/回放并清除数据', () => {
      replay.recording = true;
      replay.playing = true;
      replay.data = [{ ms: 100, cmd: 'test' }];

      replay.reset();

      expect(replay.recording).toBe(false);
      expect(replay.playing).toBe(false);
      expect(replay.data).toEqual([]);
    });
  });

  // ==================== subscribe / destroy ====================
  describe('subscribe', () => {
    it('应该绑定所有事件', () => {
      replay.subscribe();

      expect(replay.on).toHaveBeenCalledWith(
        'replay:start:record',
        replay._onStartRecord,
      );
      expect(replay.on).toHaveBeenCalledWith(
        'replay:stop:record',
        replay._onStopRecord,
      );
      expect(replay.on).toHaveBeenCalledWith(
        'replay:add:record',
        replay._onAddRecord,
      );
      expect(replay.on).toHaveBeenCalledWith(
        'replay:add:piece',
        replay._onAddPiece,
      );
      expect(replay.on).toHaveBeenCalledWith(
        'replay:start:play',
        replay._onStartPlay,
      );
      expect(replay.on).toHaveBeenCalledWith('replay:reset', replay._onReset);
      expect(replay.on).toHaveBeenCalledWith(
        'replay:game:over',
        replay._onGameOver,
      );
      expect(replay.on).toHaveBeenCalledWith(
        'replay:stop:clear:lines',
        replay._onClearLines,
      );
    });
  });

  describe('destroy', () => {
    it('应该重置状态并解绑所有事件', () => {
      replay.recording = true;
      replay.data = [{ ms: 100, cmd: 'test' }];

      replay.destroy();

      expect(replay.recording).toBe(false);
      expect(replay.data).toEqual([]);
      expect(replay.off).toHaveBeenCalledTimes(8);
    });
  });

  // ==================== 私有处理器 ====================
  describe('私有事件处理器', () => {
    describe('_onStartRecord', () => {
      it('应该调用 startRecord', () => {
        jest.spyOn(replay, 'startRecord');
        replay._onStartRecord();
        expect(replay.startRecord).toHaveBeenCalled();
      });
    });

    describe('_onStopRecord', () => {
      it('应该调用 stopRecord', () => {
        jest.spyOn(replay, 'stopRecord');
        replay._onStopRecord();
        expect(replay.stopRecord).toHaveBeenCalled();
      });
    });

    describe('_onAddRecord', () => {
      it('录制状态下应该添加数据', () => {
        replay.recording = true;
        replay._onAddRecord({ ms: 100, cmd: 'test' });
        expect(replay.data).toEqual([{ ms: 100, cmd: 'test' }]);
      });

      it('非录制状态下应该忽略', () => {
        replay.recording = false;
        replay._onAddRecord({ ms: 100, cmd: 'test' });
        expect(replay.data).toEqual([]);
      });
    });

    describe('_onAddPiece', () => {
      it('录制状态下应该深拷贝添加方块', () => {
        const piece = { type: 'I', rotation: 0 };
        replay.recording = true;
        replay._onAddPiece(piece);

        expect(replay.pieceSequence).toHaveLength(1);
        expect(replay.pieceSequence[0]).toEqual(piece);
        expect(replay.pieceSequence[0]).not.toBe(piece);
      });

      it('非录制状态下应该忽略', () => {
        replay.recording = false;
        replay._onAddPiece({ type: 'I' });
        expect(replay.pieceSequence).toEqual([]);
      });
    });

    describe('_onStartPlay', () => {
      it('应该调用 startPlay', () => {
        jest.spyOn(replay, 'startPlay');
        replay._onStartPlay();
        expect(replay.startPlay).toHaveBeenCalled();
      });
    });

    describe('_onReset', () => {
      it('应该调用 reset', () => {
        jest.spyOn(replay, 'reset');
        replay._onReset();
        expect(replay.reset).toHaveBeenCalled();
      });
    });

    describe('_onGameOver', () => {
      it('有回放数据时应发送准备棋盘事件（含 nextPiece）', () => {
        replay.data = [{ ms: 100, cmd: 'test' }];
        replay.pieceSequence = [{ type: 'T' }, { type: 'L' }];
        replay.pieceIndex = 0;
        replay.playing = true;

        replay._onGameOver();

        expect(replay.emit).toHaveBeenCalledWith('game:replay:prepare:board', {
          nextPiece: { curr: { type: 'T' }, next: { type: 'L' } },
        });
      });

      it('无回放数据时应发送 game-over 事件', () => {
        replay.data = [];
        replay._onGameOver();

        expect(replay.emit).toHaveBeenCalledWith('ui:update:mode', {
          mode: 'game-over',
        });
        expect(replay.emit).toHaveBeenCalledWith('game:update:mode', {
          mode: 'game-over',
        });
      });
    });

    describe('_onClearLines', () => {
      it('未升级时不触发', () => {
        replay._onClearLines({ isLevelUp: false, level: 1 });
        expect(replay.emit).not.toHaveBeenCalled();
      });

      it('回放中升级不触发音效', () => {
        replay.playing = true;
        replay._onClearLines({ isLevelUp: true, level: 5 });
        expect(replay.emit).not.toHaveBeenCalled();
      });

      it('正常升级应触发 BGM 停止、音效和特效', () => {
        replay._onClearLines({ isLevelUp: true, level: 3 });

        expect(replay.emit).toHaveBeenCalledWith('audio:stop:bgm');
        expect(replay.emit).toHaveBeenCalledWith('audio:sounds:level:up');
        expect(replay.emit).toHaveBeenCalledWith('effects:start:level:up', {
          level: 3,
        });
      });
    });
  });
});
