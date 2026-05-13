import ReplayController from '@/lib/runtime/replay-controller.js';

describe('ReplayController', () => {
  let replay;

  // Mock Store
  const mockStore = {
    getMode: jest.fn().mockReturnValue('playing'),
  };

  // Mock Game
  const mockGame = {
    id: 'test-game-uuid',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    replay = new ReplayController({
      Game: mockGame,
      Store: mockStore,
    });

    // Mock emit 方法，避免调用真实的 EventBus
    jest.spyOn(replay, 'emit').mockImplementation(() => {});
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 ReplayController 实例', () => {
      expect(replay).toBeDefined();
      expect(replay).toBeInstanceOf(ReplayController);
    });

    it('应该正确初始化所有默认值', () => {
      expect(replay.recording).toBe(false);
      expect(replay.playing).toBe(false);
      expect(replay.data).toEqual([]);
      expect(replay.cursor).toBe(0);
      expect(replay.pieceSequence).toEqual([]);
      expect(replay.pieceIndex).toBe(0);
      expect(replay.playElapsed).toBe(0);
      expect(replay.startTime).toBe(0);
      expect(replay.timestamp).toBe(0);
    });

    it('hasData 应该返回 false', () => {
      expect(replay.hasData).toBe(false);
    });
  });

  // ==================== hasData ====================
  describe('hasData 属性', () => {
    it('data 为空时应该返回 false', () => {
      expect(replay.hasData).toBe(false);
    });

    it('data 不为空时应该返回 true', () => {
      replay.data = [{ ms: 100, cmd: { action: 'MOVE' } }];
      expect(replay.hasData).toBe(true);
    });
  });

  // ==================== getNextPiece ====================
  describe('getNextPiece 方法', () => {
    it('不在回放状态时应该返回 null', () => {
      const result = replay.getNextPiece();

      expect(result).toEqual({ curr: null, next: null });
    });

    it('在回放状态时应该返回当前方块和下一个方块', () => {
      replay.playing = true;
      replay.pieceSequence = [
        { type: 'I', rotation: 0 },
        { type: 'O', rotation: 0 },
        { type: 'T', rotation: 0 },
      ];

      const result = replay.getNextPiece();

      expect(result).toEqual({
        curr: { type: 'I', rotation: 0 },
        next: { type: 'O', rotation: 0 },
      });
      expect(replay.pieceIndex).toBe(1);
    });

    it('多次调用应该依次返回方块序列', () => {
      replay.playing = true;
      replay.pieceSequence = [
        { type: 'I' },
        { type: 'O' },
        { type: 'T' },
      ];

      expect(replay.getNextPiece()).toEqual({
        curr: { type: 'I' },
        next: { type: 'O' },
      });
      expect(replay.getNextPiece()).toEqual({
        curr: { type: 'O' },
        next: { type: 'T' },
      });
      expect(replay.getNextPiece()).toEqual({
        curr: { type: 'T' },
        next: null,
      });
    });

    it('方块序列越界时应该返回 null', () => {
      replay.playing = true;
      replay.pieceSequence = [{ type: 'I' }];

      // 消耗唯一一个方块
      replay.getNextPiece();

      // 再次调用，索引越界
      const result = replay.getNextPiece();

      expect(result).toEqual({ curr: null, next: null });
    });

    it('空方块序列时应该返回 null', () => {
      replay.playing = true;
      replay.pieceSequence = [];

      const result = replay.getNextPiece();

      expect(result).toEqual({ curr: null, next: null });
    });
  });

  // ==================== syncPlayElapsed ====================
  describe('syncPlayElapsed 方法', () => {
    it('不在回放状态时应该直接返回', () => {
      replay.playing = false;
      replay.playElapsed = 500;

      replay.syncPlayElapsed({
        timestamp: 2000,
        isBlocked: false,
      });

      expect(replay.playElapsed).toBe(500);
    });

    it('阻塞状态时应该直接返回', () => {
      replay.playing = true;
      replay.playElapsed = 500;

      replay.syncPlayElapsed({
        timestamp: 2000,
        isBlocked: true,
      });

      expect(replay.playElapsed).toBe(500);
    });

    it('正常情况应该更新 playElapsed', () => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.playElapsed = 0;

      replay.syncPlayElapsed({
        timestamp: 2500,
        isBlocked: false,
      });

      expect(replay.playElapsed).toBe(1500);
    });

    it('时间跳跃超过 1 秒时应该限制快进', () => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.playElapsed = 0;

      // 跳跃了 4 秒
      replay.syncPlayElapsed({
        timestamp: 5000,
        isBlocked: false,
      });

      // 被限制为 1 秒
      expect(replay.playElapsed).toBe(1000);
    });

    it('时间跳跃超过 1 秒时应该调整 startTime', () => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.playElapsed = 0;

      replay.syncPlayElapsed({
        timestamp: 5000,
        isBlocked: false,
      });

      // startTime 被调整为 timestamp - playElapsed
      // playElapsed 被限制为 1 秒
      // 新 startTime = 原 startTime + (delta - 1000) = 1000 + (4000 - 1000) = 4000
      // 验证：timestamp - startTime = 5000 - 4000 = 1000 = playElapsed
      expect(replay.startTime).toBe(4000);
    });

    it('时间跳跃刚好 1 秒时不应该限制', () => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.playElapsed = 0;

      replay.syncPlayElapsed({
        timestamp: 2000,
        isBlocked: false,
      });

      expect(replay.playElapsed).toBe(1000);
    });

    it('时间跳跃小于 1 秒时不应该限制', () => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.playElapsed = 0;

      replay.syncPlayElapsed({
        timestamp: 1500,
        isBlocked: false,
      });

      expect(replay.playElapsed).toBe(500);
    });
  });

  // ==================== update 方法 ====================
  describe('update 方法', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('replay');
    });

    it('应该更新 timestamp', () => {
      replay.update({ speed: 1000, timestamp: 5000 });

      expect(replay.timestamp).toBe(5000);
    });

    it('不在回放状态时应该直接返回', () => {
      replay.playing = false;
      const initialCursor = replay.cursor;

      replay.update({ speed: 1000, timestamp: 5000 });

      expect(replay.cursor).toBe(initialCursor);
    });

    it('mode 不是 replay 时应该直接返回', () => {
      mockStore.getMode.mockReturnValue('playing');
      replay.playing = true;
      const initialCursor = replay.cursor;

      replay.update({ speed: 1000, timestamp: 5000 });

      expect(replay.cursor).toBe(initialCursor);
    });

    it('回放完毕时应该调用 stopPlay', () => {
      replay.playing = true;
      replay.cursor = 3;
      replay.data = [
        { ms: 100, cmd: { action: 'MOVE' } },
        { ms: 200, cmd: { action: 'ROTATE' } },
        { ms: 300, cmd: { action: 'DROP' } },
      ];

      replay.update({ speed: 1000, timestamp: 5000 });

      expect(replay.playing).toBe(false);
    });

    it('应该将 playElapsed 已到的 command 逐条注入', () => {
      replay.playing = true;
      replay.cursor = 0;
      replay.playElapsed = 300;
      replay.data = [
        { ms: 100, cmd: { action: 'MOVE', payload: {} } },
        { ms: 200, cmd: { action: 'ROTATE', payload: {} } },
        { ms: 300, cmd: { action: 'DROP', payload: {} } },
        { ms: 400, cmd: { action: 'PAUSE', payload: {} } },
      ];

      replay.update({ speed: 1000, timestamp: 5000 });

      expect(replay.emit).toHaveBeenCalledTimes(3);
      expect(replay.emit).toHaveBeenNthCalledWith(1, 'dispatch:command', {
        action: 'MOVE',
        payload: {},
      });
      expect(replay.emit).toHaveBeenNthCalledWith(2, 'dispatch:command', {
        action: 'ROTATE',
        payload: {},
      });
      expect(replay.emit).toHaveBeenNthCalledWith(3, 'dispatch:command', {
        action: 'DROP',
        payload: {},
      });
      expect(replay.cursor).toBe(3);
    });

    it('没有到时间的 command 不应该被注入', () => {
      replay.playing = true;
      replay.cursor = 0;
      replay.playElapsed = 50;
      replay.data = [
        { ms: 100, cmd: { action: 'MOVE' } },
        { ms: 200, cmd: { action: 'ROTATE' } },
      ];

      replay.update({ speed: 1000, timestamp: 5000 });

      expect(replay.emit).not.toHaveBeenCalled();
      expect(replay.cursor).toBe(0);
    });

    it('空数据时回放应该直接结束', () => {
      replay.playing = true;
      replay.data = [];

      replay.update({ speed: 1000, timestamp: 5000 });

      expect(replay.playing).toBe(false);
      expect(replay.emit).not.toHaveBeenCalled();
    });

    it('回放结束应该发送 game-over 事件', () => {
      replay.playing = true;
      replay.cursor = 1;
      replay.data = [{ ms: 100, cmd: { action: 'MOVE' } }];

      replay.update({ speed: 1000, timestamp: 5000 });

      expect(replay.emit).toHaveBeenCalledWith(
        `game:${mockGame.id}:update:mode`,
        { mode: 'game-over' },
      );
    });

    describe('快进逻辑', () => {
      it('下一个 command 等待超过 2 倍 interval 时应该快进', () => {
        replay.playing = true;
        replay.cursor = 0;
        replay.playElapsed = 0;
        replay.startTime = 0;
        replay.data = [
          { ms: 5000, cmd: { action: 'MOVE' } },
        ];

        replay.update({ speed: 1000, timestamp: 1000 });

        // gap = 5000 - 0 = 5000 > 2 * 1000 = 2000
        // skip = min(5000 - 1000, 1000) = 1000
        // playElapsed = 0 + 1000 = 1000
        // startTime = timestamp - playElapsed = 1000 - 1000 = 0
        expect(replay.playElapsed).toBe(1000);
      });

      it('下一个 command 等待不超过 2 倍 interval 时不应该快进', () => {
        replay.playing = true;
        replay.cursor = 0;
        replay.playElapsed = 0;
        replay.startTime = 0;
        replay.data = [
          { ms: 1500, cmd: { action: 'MOVE' } },
        ];

        replay.update({ speed: 1000, timestamp: 1000 });

        // gap = 1500 - 0 = 1500 <= 2 * 1000 = 2000，不快进
        expect(replay.playElapsed).toBe(0);
      });

      it('speed 未提供时应该使用默认值 1000', () => {
        replay.playing = true;
        replay.cursor = 0;
        replay.playElapsed = 0;
        replay.startTime = 0;
        replay.data = [
          { ms: 5000, cmd: { action: 'MOVE' } },
        ];

        replay.update({ timestamp: 1000 });

        // speed 为 undefined，interval = 1000
        expect(replay.playElapsed).toBe(1000);
      });
    });
  });

  // ==================== startRecord 方法 ====================
  describe('startRecord 方法', () => {
    it('应该开启录制标志', () => {
      replay.startRecord();

      expect(replay.recording).toBe(true);
    });

    it('应该清空旧数据', () => {
      replay.data = [{ ms: 100, cmd: { action: 'MOVE' } }];
      replay.pieceSequence = [{ type: 'I' }];

      replay.startRecord();

      expect(replay.data).toEqual([]);
      expect(replay.pieceSequence).toEqual([]);
    });

    it('应该重置索引和计时', () => {
      replay.pieceIndex = 5;
      replay.playElapsed = 9999;

      replay.startRecord();

      expect(replay.pieceIndex).toBe(0);
      expect(replay.playElapsed).toBe(0);
    });

    it('应该将 startTime 设置为当前 timestamp', () => {
      replay.timestamp = 5000;
      replay.startTime = 0;

      replay.startRecord();

      expect(replay.startTime).toBe(5000);
    });
  });

  // ==================== stopRecord 方法 ====================
  describe('stopRecord 方法', () => {
    it('应该关闭录制标志', () => {
      replay.recording = true;

      replay.stopRecord();

      expect(replay.recording).toBe(false);
    });

    it('不应该影响 data', () => {
      const data = [{ ms: 100, cmd: { action: 'MOVE' } }];
      replay.data = data;
      replay.recording = true;

      replay.stopRecord();

      expect(replay.data).toBe(data);
    });
  });

  // ==================== startPlay 方法 ====================
  describe('startPlay 方法', () => {
    it('应该开启回放标志', () => {
      replay.startPlay();

      expect(replay.playing).toBe(true);
    });

    it('应该重置 cursor 和 pieceIndex', () => {
      replay.cursor = 10;
      replay.pieceIndex = 5;

      replay.startPlay();

      expect(replay.cursor).toBe(0);
      expect(replay.pieceIndex).toBe(0);
    });

    it('应该将 startTime 设置为当前 timestamp', () => {
      replay.timestamp = 5000;
      replay.startTime = 0;

      replay.startPlay();

      expect(replay.startTime).toBe(5000);
    });
  });

  // ==================== stopPlay 方法 ====================
  describe('stopPlay 方法', () => {
    it('应该关闭回放标志', () => {
      replay.playing = true;

      replay.stopPlay();

      expect(replay.playing).toBe(false);
    });

    it('应该发送 game-over 事件', () => {
      replay.stopPlay();

      expect(replay.emit).toHaveBeenCalledWith(
        `game:${mockGame.id}:update:mode`,
        { mode: 'game-over' },
      );
    });
  });

  // ==================== clear 方法 ====================
  describe('clear 方法', () => {
    it('应该重置所有状态', () => {
      replay.recording = true;
      replay.playing = true;
      replay.cursor = 10;
      replay.data = [{ ms: 100, cmd: { action: 'MOVE' } }];
      replay.pieceSequence = [{ type: 'I' }];
      replay.pieceIndex = 5;
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

    it('不应该清除事件绑定', () => {
      replay.subscribe();
      replay.clear();

      // 验证事件仍然有效
      replay.emit(`replay:${mockGame.id}:start:record`);
      expect(replay.recording).toBe(true);
    });
  });

  // ==================== reset 方法 ====================
  describe('reset 方法', () => {
    it('应该停止录制、停止回放并清除数据', () => {
      replay.recording = true;
      replay.playing = true;
      replay.data = [{ ms: 100, cmd: { action: 'MOVE' } }];

      replay.reset();

      expect(replay.recording).toBe(false);
      expect(replay.playing).toBe(false);
      expect(replay.data).toEqual([]);
    });

    it('应该发送 stopPlay 的 game-over 事件', () => {
      // 清除之前 spy 的记录
      replay.emit.mockClear();

      replay.reset();

      expect(replay.emit).toHaveBeenCalledWith(
        `game:${mockGame.id}:update:mode`,
        { mode: 'game-over' },
      );
    });
  });

  // ==================== 事件处理回调 ====================
  describe('事件处理回调', () => {
    describe('_onAddRecord', () => {
      it('录制中应该将记录写入 data', () => {
        replay.recording = true;

        const record = { ms: 500, cmd: { action: 'MOVE', payload: {} } };
        replay._onAddRecord(record);

        expect(replay.data).toHaveLength(1);
        expect(replay.data[0]).toBe(record);
      });

      it('非录制状态应该忽略', () => {
        replay.recording = false;

        replay._onAddRecord({ ms: 500, cmd: { action: 'MOVE' } });

        expect(replay.data).toHaveLength(0);
      });
    });

    describe('_onAddPiece', () => {
      it('录制中应该将方块深拷贝后写入', () => {
        replay.recording = true;

        const piece = { type: 'I', rotation: 0 };
        replay._onAddPiece(piece);

        expect(replay.pieceSequence).toHaveLength(1);
        // 应该是深拷贝，不是同一个引用
        expect(replay.pieceSequence[0]).not.toBe(piece);
        expect(replay.pieceSequence[0]).toEqual(piece);
      });

      it('非录制状态应该忽略', () => {
        replay.recording = false;

        replay._onAddPiece({ type: 'I' });

        expect(replay.pieceSequence).toHaveLength(0);
      });

      it('修改原始对象不应该影响已录制的方块', () => {
        replay.recording = true;

        const piece = { type: 'I', rotation: 0 };
        replay._onAddPiece(piece);

        piece.rotation = 3;
        piece.type = 'O';

        expect(replay.pieceSequence[0]).toEqual({ type: 'I', rotation: 0 });
      });
    });

    describe('_onGameOver', () => {
      it('有数据时应该准备回放棋盘', () => {
        replay.data = [{ ms: 100, cmd: { action: 'MOVE' } }];
        replay.pieceSequence = [{ type: 'I' }, { type: 'O' }];
        replay.playing = true;

        replay._onGameOver();

        expect(replay.emit).toHaveBeenCalledWith(
          `game:${mockGame.id}:replay:prepare:board`,
          {
            nextPiece: {
              curr: { type: 'I' },
              next: { type: 'O' },
            },
          },
        );
      });

      it('无数据时应该直接进入 game-over', () => {
        replay.data = [];

        replay._onGameOver();

        expect(replay.emit).toHaveBeenCalledWith(
          `ui:${mockGame.id}:update:mode`,
          { mode: 'game-over' },
        );
        expect(replay.emit).toHaveBeenCalledWith(
          `game:${mockGame.id}:update:mode`,
          { mode: 'game-over' },
        );
      });
    });

    describe('_onClearLines', () => {
      it('非升级时应该直接返回', () => {
        replay._onClearLines({ isLevelUp: false, level: 5 });

        expect(replay.emit).not.toHaveBeenCalled();
      });

      it('回放中升级时应该直接返回不播放音效', () => {
        replay.playing = true;

        replay._onClearLines({ isLevelUp: true, level: 5 });

        expect(replay.emit).not.toHaveBeenCalled();
      });

      it('正常游戏升级时应该播放升级音效和特效', () => {
        replay.playing = false;

        replay._onClearLines({ isLevelUp: true, level: 5 });

        expect(replay.emit).toHaveBeenCalledWith('audio:stop:bgm');
        expect(replay.emit).toHaveBeenCalledWith('audio:play:sound', {
          sound: 'LEVEL_UP',
        });
        expect(replay.emit).toHaveBeenCalledWith(
          `game:${mockGame.id}:start:level:up`,
          { level: 5 },
        );
      });
    });
  });

  // ==================== subscribe / unsubscribe ====================
  describe('subscribe 和 unsubscribe', () => {
    it('subscribe 后应该响应事件', () => {
      replay.subscribe();

      replay.emit(`replay:${mockGame.id}:start:record`);
      expect(replay.recording).toBe(true);
    });

    it('unsubscribe 后不应该响应事件', () => {
      replay.subscribe();
      replay.unsubscribe();

      replay.emit(`replay:${mockGame.id}:start:record`);
      expect(replay.recording).toBe(false);
    });

    it('应该响应 clear 事件', () => {
      replay.subscribe();
      replay.recording = true;

      replay.emit(`replay:${mockGame.id}:reset`);

      expect(replay.recording).toBe(false);
    });

    it('应该响应 add:record 事件', () => {
      replay.subscribe();
      replay.recording = true;

      const record = { ms: 100, cmd: { action: 'MOVE' } };
      replay.emit(`replay:${mockGame.id}:add:record`, record);

      expect(replay.data).toContain(record);
    });

    it('应该响应 start:play 事件', () => {
      replay.subscribe();

      replay.emit(`replay:${mockGame.id}:start:play`);

      expect(replay.playing).toBe(true);
    });
  });

  // ==================== destroy 方法 ====================
  describe('destroy 方法', () => {
    it('应该停止录制和回放', () => {
      replay.recording = true;
      replay.playing = true;

      replay.destroy();

      expect(replay.recording).toBe(false);
      expect(replay.playing).toBe(false);
    });

    it('应该清除数据', () => {
      replay.data = [{ ms: 100, cmd: { action: 'MOVE' } }];
      replay.pieceSequence = [{ type: 'I' }];

      replay.destroy();

      expect(replay.data).toEqual([]);
      expect(replay.pieceSequence).toEqual([]);
    });

    it('解绑后不应该再响应事件', () => {
      replay.subscribe();
      replay.destroy();

      replay.emit(`replay:${mockGame.id}:start:record`);
      expect(replay.recording).toBe(false);
    });
  });

  // ==================== 事件名称格式 ====================
  describe('事件名称格式', () => {
    it('所有事件都应该包含正确的 uuid', () => {
      jest.spyOn(replay, 'on');

      replay.subscribe();

      const expectedPrefix = `replay:${mockGame.id}:`;
      const calls = replay.on.mock.calls;

      calls.forEach(([eventName]) => {
        expect(eventName.startsWith(expectedPrefix)).toBe(true);
      });
    });
  });
});
