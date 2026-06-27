/** @jest-environment jsdom */

import ReplayController from '@/lib/runtime/replay-controller.js';

// Mock GameEvents — 添加 DISPATCH_COMMAND 字段
jest.mock('@/lib/events/event-catalog.js', () => ({
  GameEvents: jest.fn((id) => ({
    UPDATE_MODE: `game:${id}:update:mode`,
    DISPATCH_COMMAND: `game:${id}:dispatch:command`,
  })),
  ReplayEvents: jest.fn((id) => ({
    START_RECORD: `replay:${id}:start:record`,
    STOP_RECORD: `replay:${id}:stop:record`,
    ADD_RECORD: `replay:${id}:add:record`,
    ADD_PIECE: `replay:${id}:add:piece`,
    START_PLAY: `replay:${id}:start:play`,
    RESET: `replay:${id}:reset`,
    GAME_OVER: `replay:${id}:game:over`,
    STOP_CLEAR_LINES: `replay:${id}:stop:clear:lines`,
  })),
  AIEvents: jest.fn(() => ({ START: 'ai:start', STOP: 'ai:stop' })),
  UIEvents: jest.fn(() => ({
    UPDATE_MODE: 'ui:update:mode',
    UPDATE_CONTROLLER: 'ui:update:controller',
  })),
  AudioEvents: jest.fn(() => ({
    PLAY_SOUND: 'audio:play:sound',
    STOP_BGM: 'audio:stop:bgm',
  })),
}));

// 事件名常量
const DISPATCH_COMMAND = 'game:test-uuid-123:dispatch:command';

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
      Store: mockStore,
    };

    replay = new ReplayController({
      Game: mockGame,
      Store: mockStore,
    });
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 ReplayController 实例', () => {
      expect(replay).toBeDefined();
      expect(replay).toBeInstanceOf(ReplayController);
    });

    it('应该正确初始化默认值', () => {
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

    it('应该创建 Router 实例', () => {
      expect(replay.Router).toBeDefined();
    });

    it('应该正确注入依赖', () => {
      expect(replay.Game).toBe(mockGame);
      expect(replay.Store).toBe(mockStore);
    });
  });

  // ==================== hasData ====================
  describe('hasData', () => {
    it('data 为空时返回 false', () => {
      expect(replay.hasData).toBe(false);
    });

    it('data 有记录时返回 true', () => {
      replay.data = [{ ms: 100, cmd: {} }];
      expect(replay.hasData).toBe(true);
    });
  });

  // ==================== getNextPiece ====================
  describe('getNextPiece', () => {
    it('非 playing 状态时返回 null', () => {
      const result = replay.getNextPiece();
      expect(result).toEqual({ curr: null, next: null });
    });

    it('pieceSequence 为空时返回 null', () => {
      replay.playing = true;
      const result = replay.getNextPiece();
      expect(result).toEqual({ curr: null, next: null });
    });

    it('应该按顺序返回方块', () => {
      replay.playing = true;
      replay.pieceSequence = [
        {
          type: 'T',
          shape: [
            [0, 1, 0],
            [1, 1, 1],
          ],
        },
        { type: 'I', shape: [[1, 1, 1, 1]] },
      ];

      const result1 = replay.getNextPiece();
      expect(result1.curr).toEqual({
        type: 'T',
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
      });
      expect(result1.next).toEqual({ type: 'I', shape: [[1, 1, 1, 1]] });

      const result2 = replay.getNextPiece();
      expect(result2.curr).toEqual({ type: 'I', shape: [[1, 1, 1, 1]] });
      expect(result2.next).toBeNull();
    });

    it('索引越界时返回 null', () => {
      replay.playing = true;
      replay.pieceSequence = [{ type: 'T' }];
      replay.pieceIndex = 1;

      const result = replay.getNextPiece();
      expect(result).toEqual({ curr: null, next: null });
    });
  });

  // ==================== syncPlayElapsed ====================
  describe('syncPlayElapsed', () => {
    it('非播放状态跳过', () => {
      replay.playElapsed = 100;
      replay.syncPlayElapsed({ timestamp: 500, isBlocked: false });
      expect(replay.playElapsed).toBe(100);
    });

    it('阻塞状态跳过', () => {
      replay.playing = true;
      replay.playElapsed = 100;
      replay.syncPlayElapsed({ timestamp: 500, isBlocked: true });
      expect(replay.playElapsed).toBe(100);
    });

    it('正常推进逻辑时钟', () => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.playElapsed = 0;

      replay.syncPlayElapsed({ timestamp: 2000, isBlocked: false });

      expect(replay.playElapsed).toBe(1000);
    });

    it('时间跳跃超过 1 秒时限制快进', () => {
      replay.playing = true;
      replay.startTime = 1000;
      replay.playElapsed = 0;

      replay.syncPlayElapsed({ timestamp: 5000, isBlocked: false });

      expect(replay.playElapsed).toBe(1000);
    });
  });

  // ==================== update ====================
  describe('update', () => {
    it('非回放状态直接退出', () => {
      const spyEmit = jest.spyOn(replay, 'emit');
      replay.update({ speed: 1000, timestamp: 500 });

      expect(spyEmit).not.toHaveBeenCalled();
      expect(replay.cursor).toBe(0);
    });

    it('mode 不是 replay 时直接退出', () => {
      replay.playing = true;
      mockStore.getMode.mockReturnValue('playing');
      const spyEmit = jest.spyOn(replay, 'emit');

      replay.update({ speed: 1000, timestamp: 500 });

      expect(spyEmit).not.toHaveBeenCalled();
    });

    it('回放完毕时发射 game-over 事件', () => {
      replay.playing = true;
      mockStore.getMode.mockReturnValue('replay');
      replay.data = [{ ms: 100, cmd: { action: 'DROP' } }];
      replay.cursor = 1;
      const spyEmit = jest.spyOn(replay, 'emit');

      replay.update({ speed: 1000, timestamp: 500 });

      expect(spyEmit).toHaveBeenCalledWith('game:test-uuid-123:update:mode', {
        mode: 'game-over',
      });
      expect(replay.playing).toBe(false);
    });

    it('应该注入到期的 command', () => {
      replay.playing = true;
      mockStore.getMode.mockReturnValue('replay');
      replay.data = [
        { ms: 100, cmd: { action: 'MOVE_LEFT' } },
        { ms: 200, cmd: { action: 'DROP' } },
      ];
      replay.playElapsed = 150;
      const spyEmit = jest.spyOn(replay, 'emit');

      replay.update({ speed: 1000, timestamp: 500 });

      expect(spyEmit).toHaveBeenCalledWith(DISPATCH_COMMAND, {
        action: 'MOVE_LEFT',
      });
      expect(replay.cursor).toBe(1);
    });

    it('快进逻辑应该调整 startTime', () => {
      replay.playing = true;
      mockStore.getMode.mockReturnValue('replay');
      replay.data = [{ ms: 5000, cmd: { action: 'DROP' } }];
      replay.playElapsed = 0;
      replay.startTime = 0;

      replay.update({ speed: 100, timestamp: 100 });

      expect(replay.playElapsed).toBeGreaterThan(0);
    });
  });

  // ==================== startRecord / stopRecord ====================
  describe('录制控制', () => {
    it('startRecord 应该开启录制并清空数据', () => {
      replay.data = [{ ms: 100, cmd: {} }];
      replay.pieceSequence = [{ type: 'T' }];

      replay.startRecord();

      expect(replay.recording).toBe(true);
      expect(replay.data).toEqual([]);
      expect(replay.pieceSequence).toEqual([]);
      expect(replay.pieceIndex).toBe(0);
      expect(replay.playElapsed).toBe(0);
    });

    it('stopRecord 应该停止录制', () => {
      replay.recording = true;
      replay.stopRecord();
      expect(replay.recording).toBe(false);
    });
  });

  // ==================== startPlay / stopPlay ====================
  describe('回放控制', () => {
    it('startPlay 应该开启回放并重置状态', () => {
      replay.cursor = 5;
      replay.pieceIndex = 3;

      replay.startPlay();

      expect(replay.playing).toBe(true);
      expect(replay.cursor).toBe(0);
      expect(replay.pieceIndex).toBe(0);
    });

    it('stopPlay 应该停止回放', () => {
      replay.playing = true;
      replay.stopPlay();
      expect(replay.playing).toBe(false);
    });
  });

  // ==================== addRecord ====================
  describe('addRecord', () => {
    it('recording 为 true 时推入 data', () => {
      replay.recording = true;

      replay.addRecord({ ms: 100, cmd: { action: 'move' } });

      expect(replay.data).toEqual([{ ms: 100, cmd: { action: 'move' } }]);
    });

    it('recording 为 false 时忽略', () => {
      replay.recording = false;

      replay.addRecord({ ms: 100, cmd: { action: 'move' } });

      expect(replay.data).toEqual([]);
    });
  });

  // ==================== addPiece ====================
  describe('addPiece', () => {
    it('recording 为 true 时深拷贝推入 pieceSequence', () => {
      replay.recording = true;
      const piece = { type: 'I', shape: [[1, 1, 1, 1]] };

      replay.addPiece(piece);

      expect(replay.pieceSequence).toHaveLength(1);
      expect(replay.pieceSequence[0]).toEqual(piece);
      expect(replay.pieceSequence[0]).not.toBe(piece);
    });

    it('recording 为 false 时忽略', () => {
      replay.recording = false;

      replay.addPiece({ type: 'I' });

      expect(replay.pieceSequence).toEqual([]);
    });
  });

  // ==================== clear ====================
  describe('clear', () => {
    it('应该重置所有状态', () => {
      replay.recording = true;
      replay.playing = true;
      replay.data = [{ ms: 100, cmd: {} }];
      replay.cursor = 3;
      replay.pieceSequence = [{ type: 'T' }];
      replay.pieceIndex = 2;
      replay.startTime = 999;

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

  // ==================== reset ====================
  describe('reset', () => {
    it('应该调用 stopRecord + stopPlay + clear', () => {
      replay.recording = true;
      replay.playing = true;
      replay.data = [{ ms: 100, cmd: {} }];

      replay.reset();

      expect(replay.recording).toBe(false);
      expect(replay.playing).toBe(false);
      expect(replay.data).toEqual([]);
    });
  });

  // ==================== subscribe / unsubscribe ====================
  describe('subscribe / unsubscribe', () => {
    it('subscribe 应该委托给 Router', () => {
      const spy = jest.spyOn(replay.Router, 'subscribe');
      replay.subscribe();
      expect(spy).toHaveBeenCalled();
    });

    it('unsubscribe 应该委托给 Router', () => {
      const spy = jest.spyOn(replay.Router, 'unsubscribe');
      replay.unsubscribe();
      expect(spy).toHaveBeenCalled();
    });
  });

  // ==================== destroy ====================
  describe('destroy', () => {
    it('应该调用 reset + unsubscribe', () => {
      const spyReset = jest.spyOn(replay, 'reset');
      const spyUnsubscribe = jest.spyOn(replay.Router, 'unsubscribe');

      replay.destroy();

      expect(spyReset).toHaveBeenCalled();
      expect(spyUnsubscribe).toHaveBeenCalled();
    });
  });
});
