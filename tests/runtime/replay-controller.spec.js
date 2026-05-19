import ReplayController from '@/lib/runtime/replay-controller';

describe('ReplayController', () => {
  let replay;
  let mockGame;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getMode: jest.fn().mockReturnValue('playing'),
    };

    mockGame = {
      id: 'test-uuid-123',
    };

    replay = new ReplayController({
      Game: mockGame,
      Store: mockStore,
    });
  });

  // ==================== 初始化 ====================

  describe('初始化', () => {
    test('默认状态：未录制、未回放', () => {
      expect(replay.recording).toBe(false);
      expect(replay.playing).toBe(false);
    });

    test('data 初始为空数组', () => {
      expect(replay.data).toEqual([]);
    });

    test('cursor 初始为 0', () => {
      expect(replay.cursor).toBe(0);
    });

    test('pieceSequence 初始为空', () => {
      expect(replay.pieceSequence).toEqual([]);
      expect(replay.pieceIndex).toBe(0);
    });

    test('playElapsed 和 startTime 初始为 0', () => {
      expect(replay.playElapsed).toBe(0);
      expect(replay.startTime).toBe(0);
    });

    test('timestamp 初始为 0', () => {
      expect(replay.timestamp).toBe(0);
    });
  });

  // ==================== hasData ====================

  describe('hasData', () => {
    test('data 为空时返回 false', () => {
      expect(replay.hasData).toBe(false);
    });

    test('data 有元素时返回 true', () => {
      replay.data.push({ ms: 100, cmd: {} });
      expect(replay.hasData).toBe(true);
    });
  });

  // ==================== getNextPiece ====================

  describe('getNextPiece', () => {
    test('非 playing 状态返回 null', () => {
      const result = replay.getNextPiece();

      expect(result).toEqual({ curr: null, next: null });
    });

    test('playing 状态下返回方块序列中的数据', () => {
      replay.playing = true;
      replay.pieceSequence = [
        { type: 'I', rotation: 0 },
        { type: 'O', rotation: 1 },
        { type: 'T', rotation: 2 },
      ];

      const result = replay.getNextPiece();

      expect(result.curr).toEqual({ type: 'I', rotation: 0 });
      expect(result.next).toEqual({ type: 'O', rotation: 1 });
      expect(replay.pieceIndex).toBe(1);
    });

    test('连续调用依次推进 pieceIndex', () => {
      replay.playing = true;
      replay.pieceSequence = [{ type: 'I' }, { type: 'O' }, { type: 'T' }];

      replay.getNextPiece();
      const result = replay.getNextPiece();

      expect(result.curr).toEqual({ type: 'O' });
      expect(result.next).toEqual({ type: 'T' });
      expect(replay.pieceIndex).toBe(2);
    });

    test('最后一个方块时 next 为 null', () => {
      replay.playing = true;
      replay.pieceSequence = [{ type: 'I' }];

      const result = replay.getNextPiece();

      expect(result.curr).toEqual({ type: 'I' });
      expect(result.next).toBeNull();
    });

    test('pieceIndex 超出序列长度时返回 null', () => {
      replay.playing = true;
      replay.pieceSequence = [{ type: 'I' }];
      replay.pieceIndex = 1;

      const result = replay.getNextPiece();

      expect(result).toEqual({ curr: null, next: null });
    });
  });

  // ==================== syncPlayElapsed ====================

  describe('syncPlayElapsed', () => {
    beforeEach(() => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.playElapsed = 500;
    });

    test('非 playing 状态不更新', () => {
      replay.playing = false;

      replay.syncPlayElapsed({ timestamp: 1600, isBlocked: false });

      expect(replay.playElapsed).toBe(500);
    });

    test('阻塞状态不更新', () => {
      replay.syncPlayElapsed({ timestamp: 1600, isBlocked: true });

      expect(replay.playElapsed).toBe(500);
    });

    test('正常状态下更新 playElapsed', () => {
      replay.syncPlayElapsed({ timestamp: 1600, isBlocked: false });

      // playElapsed = timestamp - startTime = 1600 - 1000 = 600
      expect(replay.playElapsed).toBe(600);
    });

    test('时间跳跃超过 1 秒时限制为 1 秒快进', () => {
      // prev = 500
      // now = 6000 - 1000 = 5000
      // delta = 5000 - 500 = 4500 > 1000
      // startTime += 4500 - 1000 = 3500 → startTime = 1000 + 3500 = 4500
      // playElapsed = 500 + 1000 = 1500
      replay.syncPlayElapsed({ timestamp: 6000, isBlocked: false });

      expect(replay.playElapsed).toBe(1500);
      expect(replay.startTime).toBe(4500);
    });

    test('时间跳跃刚好 1 秒时不限制', () => {
      // prev = 500
      // now = 2500 - 1000 = 1500
      // delta = 1500 - 500 = 1000（不满足 > 1000）
      replay.syncPlayElapsed({ timestamp: 2500, isBlocked: false });

      expect(replay.playElapsed).toBe(1500);
      expect(replay.startTime).toBe(1000);
    });
  });

  // ==================== update ====================

  describe('update', () => {
    beforeEach(() => {
      replay.timestamp = 1000;
    });

    test('更新 timestamp', () => {
      replay.update({ speed: () => 500, timestamp: 1200 });

      expect(replay.timestamp).toBe(1200);
    });

    test('非 playing 状态直接返回', () => {
      const spyEmit = jest.spyOn(replay, 'emit');

      replay.update({ speed: () => 500, timestamp: 1200 });

      expect(spyEmit).not.toHaveBeenCalled();
    });

    test('mode 非 replay 时直接返回', () => {
      mockStore.getMode.mockReturnValue('playing');
      replay.playing = true;
      replay.data = [{ ms: 100, cmd: { type: 'move' } }];

      const spyEmit = jest.spyOn(replay, 'emit');

      replay.update({ speed: () => 500, timestamp: 1200 });

      expect(spyEmit).not.toHaveBeenCalled();
    });

    describe('update', () => {
      beforeEach(() => {
        replay.timestamp = 1000;
      });

      test('更新 timestamp', () => {
        replay.update({ speed: 500, timestamp: 1200 });

        expect(replay.timestamp).toBe(1200);
      });

      test('非 playing 状态直接返回', () => {
        const spyEmit = jest.spyOn(replay, 'emit');

        replay.update({ speed: 500, timestamp: 1200 });

        expect(spyEmit).not.toHaveBeenCalled();
      });

      test('mode 非 replay 时直接返回', () => {
        mockStore.getMode.mockReturnValue('playing');
        replay.playing = true;
        replay.data = [{ ms: 100, cmd: { type: 'move' } }];

        const spyEmit = jest.spyOn(replay, 'emit');

        replay.update({ speed: 500, timestamp: 1200 });

        expect(spyEmit).not.toHaveBeenCalled();
      });

      describe('回放状态', () => {
        beforeEach(() => {
          mockStore.getMode.mockReturnValue('replay');
          replay.playing = true;
          replay.startTime = 1000;
          replay.cursor = 0; // startPlay() 会设置这个
        });

        test('回放完毕时调用 stopPlay', () => {
          replay.data = [{ ms: 100, cmd: { type: 'move' } }];
          replay.cursor = 1;
          replay.playElapsed = 500;

          const spyStopPlay = jest.spyOn(replay, 'stopPlay');

          replay.update({ speed: 500, timestamp: 1500 });

          expect(spyStopPlay).toHaveBeenCalled();
        });

        test('注入所有 playElapsed 已到的 command', () => {
          const spyEmit = jest.spyOn(replay, 'emit');

          replay.data = [
            { ms: 100, cmd: { type: 'move', payload: { x: -1 } } },
            { ms: 300, cmd: { type: 'rotate' } },
            { ms: 600, cmd: { type: 'drop' } },
          ];

          replay.playElapsed = 500;

          replay.update({ speed: 500, timestamp: 1500 });

          expect(spyEmit).toHaveBeenCalledTimes(2);
          expect(spyEmit).toHaveBeenNthCalledWith(1, 'dispatch:command', {
            type: 'move',
            payload: { x: -1 },
          });
          expect(spyEmit).toHaveBeenNthCalledWith(2, 'dispatch:command', {
            type: 'rotate',
          });
          expect(replay.cursor).toBe(2);
        });

        test('快进逻辑：gap > interval*2 时跳过', () => {
          const spyEmit = jest.spyOn(replay, 'emit');

          replay.data = [
            { ms: 100, cmd: { type: 'move' } },
            { ms: 2000, cmd: { type: 'rotate' } },
          ];

          replay.playElapsed = 100;
          // cursor = 0 → next = data[0], next.ms = 100
          // gap = 100 - 100 = 0，不快进

          // 需要让 cursor 指向 data[1] 才能触发快进
          replay.cursor = 1;

          // next = data[1], next.ms = 2000
          // gap = 2000 - 100 = 1900
          // speed = 500, interval*2 = 1000
          // 1900 > 1000 → 快进
          // skip = min(1900 - 500, 1000) = 1000
          // playElapsed = 100 + 1000 = 1100
          // startTime = 2100 - 1100 = 1000
          replay.update({ speed: 500, timestamp: 2100 });

          expect(replay.playElapsed).toBe(1100);
          expect(replay.startTime).toBe(1000);
          // ms=2000 > 1100 → 不注入
          expect(spyEmit).not.toHaveBeenCalled();
        });

        test('快进单次最多 1 秒', () => {
          replay.data = [{ ms: 5000, cmd: { type: 'move' } }];
          replay.playElapsed = 0;
          replay.cursor = 0;

          // next.ms = 5000, gap = 5000
          // speed = 500
          // skip = min(5000 - 500, 1000) = 1000
          // playElapsed = 0 + 1000 = 1000
          // startTime = 1000 - 1000 = 0
          replay.update({ speed: 500, timestamp: 1000 });

          expect(replay.playElapsed).toBe(1000);
        });

        test('gap 不超过 interval*2 时不快进', () => {
          replay.data = [{ ms: 800, cmd: { type: 'move' } }];
          replay.playElapsed = 500;
          replay.cursor = 0;

          // gap = 800 - 500 = 300
          // speed = 500, interval*2 = 1000
          // 300 <= 1000 → 不快进
          replay.update({ speed: 500, timestamp: 1500 });

          expect(replay.playElapsed).toBe(500);
        });

        test('speed 为 undefined 时默认 interval=1000', () => {
          replay.data = [{ ms: 3000, cmd: { type: 'move' } }];
          replay.playElapsed = 0;
          replay.cursor = 0;

          // speed = undefined → interval = 1000
          // gap = 3000, interval*2 = 2000
          // 3000 > 2000 → 快进
          // skip = min(3000 - 1000, 1000) = 1000
          // playElapsed = 1000
          replay.update({ timestamp: 2000 });

          expect(replay.playElapsed).toBe(1000);
        });
      });
    });
  });

  // ==================== startRecord / stopRecord ====================

  describe('录制', () => {
    test('startRecord 设置 recording 为 true', () => {
      replay.startRecord();

      expect(replay.recording).toBe(true);
    });

    test('startRecord 清空旧数据', () => {
      replay.data = [{ ms: 100, cmd: {} }];
      replay.pieceSequence = [{ type: 'I' }];
      replay.pieceIndex = 5;
      replay.playElapsed = 999;

      replay.startRecord();

      expect(replay.data).toEqual([]);
      expect(replay.pieceSequence).toEqual([]);
      expect(replay.pieceIndex).toBe(0);
      expect(replay.playElapsed).toBe(0);
    });

    test('startRecord 设置 startTime 为当前 timestamp', () => {
      replay.timestamp = 1500;

      replay.startRecord();

      expect(replay.startTime).toBe(1500);
    });

    test('stopRecord 设置 recording 为 false', () => {
      replay.recording = true;

      replay.stopRecord();

      expect(replay.recording).toBe(false);
    });
  });

  // ==================== startPlay / stopPlay ====================

  describe('回放', () => {
    test('startPlay 设置 playing 为 true', () => {
      replay.startPlay();

      expect(replay.playing).toBe(true);
    });

    test('startPlay 重置 cursor 和 pieceIndex', () => {
      replay.cursor = 10;
      replay.pieceIndex = 5;

      replay.startPlay();

      expect(replay.cursor).toBe(0);
      expect(replay.pieceIndex).toBe(0);
    });

    test('startPlay 设置 startTime 为当前 timestamp', () => {
      replay.timestamp = 2000;

      replay.startPlay();

      expect(replay.startTime).toBe(2000);
    });

    test('stopPlay 设置 playing 为 false', () => {
      replay.playing = true;

      replay.stopPlay();

      expect(replay.playing).toBe(false);
    });

    test('stopPlay 发射 game-over 事件', () => {
      const spyEmit = jest.spyOn(replay, 'emit');

      replay.stopPlay();

      expect(spyEmit).toHaveBeenCalledWith('game:test-uuid-123:update:mode', {
        mode: 'game-over',
      });
    });
  });

  // ==================== clear / reset / destroy ====================

  describe('clear', () => {
    test('清除所有状态', () => {
      replay.recording = true;
      replay.playing = true;
      replay.cursor = 5;
      replay.data = [{ ms: 100, cmd: {} }];
      replay.pieceSequence = [{ type: 'I' }];
      replay.pieceIndex = 3;
      replay.startTime = 1000;

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
    test('停止录制、停止回放、清除数据', () => {
      const spyStopRecord = jest.spyOn(replay, 'stopRecord');
      const spyStopPlay = jest.spyOn(replay, 'stopPlay');
      const spyClear = jest.spyOn(replay, 'clear');

      replay.reset();

      expect(spyStopRecord).toHaveBeenCalled();
      expect(spyStopPlay).toHaveBeenCalled();
      expect(spyClear).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    test('重置并解绑事件', () => {
      const spyReset = jest.spyOn(replay, 'reset');
      const spyUnsubscribe = jest.spyOn(replay, 'unsubscribe');

      replay.destroy();

      expect(spyReset).toHaveBeenCalled();
      expect(spyUnsubscribe).toHaveBeenCalled();
    });
  });

  // ==================== _onAddRecord ====================

  describe('_onAddRecord', () => {
    test('recording 为 true 时推入 data', () => {
      replay.recording = true;

      replay._onAddRecord({ ms: 100, cmd: { type: 'move' } });

      expect(replay.data).toEqual([{ ms: 100, cmd: { type: 'move' } }]);
    });

    test('recording 为 false 时忽略', () => {
      replay.recording = false;

      replay._onAddRecord({ ms: 100, cmd: { type: 'move' } });

      expect(replay.data).toEqual([]);
    });
  });

  // ==================== _onAddPiece ====================

  describe('_onAddPiece', () => {
    test('recording 为 true 时深拷贝推入 pieceSequence', () => {
      replay.recording = true;
      const piece = {
        type: 'I',
        rotation: 0,
        cells: [
          [1, 0],
          [1, 1],
        ],
      };

      replay._onAddPiece(piece);

      expect(replay.pieceSequence).toHaveLength(1);
      expect(replay.pieceSequence[0]).toEqual(piece);
      // 深拷贝：修改原对象不影响已存储的
      piece.type = 'O';
      expect(replay.pieceSequence[0].type).toBe('I');
    });

    test('recording 为 false 时忽略', () => {
      replay.recording = false;

      replay._onAddPiece({ type: 'I' });

      expect(replay.pieceSequence).toEqual([]);
    });
  });

  // ==================== _onGameOver ====================

  describe('_onGameOver', () => {
    test('有回放数据时准备棋盘进入回放', () => {
      replay.data = [{ ms: 100, cmd: {} }];
      replay.pieceSequence = [{ type: 'I' }, { type: 'O' }];
      replay.playing = true;

      const spyEmit = jest.spyOn(replay, 'emit');

      replay._onGameOver();

      expect(spyEmit).toHaveBeenCalledWith(
        'game:test-uuid-123:replay:prepare:board',
        { nextPiece: { curr: { type: 'I' }, next: { type: 'O' } } },
      );
    });

    test('无回放数据时直接进入 game-over', () => {
      const spyEmit = jest.spyOn(replay, 'emit');

      replay._onGameOver();

      expect(spyEmit).toHaveBeenCalledWith('ui:test-uuid-123:update:mode', {
        mode: 'game-over',
      });
      expect(spyEmit).toHaveBeenCalledWith('game:test-uuid-123:update:mode', {
        mode: 'game-over',
      });
    });
  });

  // ==================== _onClearLines ====================

  describe('_onClearLines', () => {
    test('非升级时忽略', () => {
      const spyEmit = jest.spyOn(replay, 'emit');

      replay._onClearLines({ isLevelUp: false, level: 5 });

      expect(spyEmit).not.toHaveBeenCalled();
    });

    test('回放中升级时忽略', () => {
      replay.playing = true;
      const spyEmit = jest.spyOn(replay, 'emit');

      replay._onClearLines({ isLevelUp: true, level: 5 });

      expect(spyEmit).not.toHaveBeenCalled();
    });

    test('正常游戏升级时触发音效和特效', () => {
      const spyEmit = jest.spyOn(replay, 'emit');

      replay._onClearLines({ isLevelUp: true, level: 5 });

      expect(spyEmit).toHaveBeenCalledWith('audio:stop:bgm');
      expect(spyEmit).toHaveBeenCalledWith('audio:resume:sound', {
        sound: 'LEVEL_UP',
      });
      expect(spyEmit).toHaveBeenCalledWith(
        'game:test-uuid-123:start:level:up',
        { level: 5 },
      );
    });
  });
});
