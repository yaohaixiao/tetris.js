import begin from '@/lib/game/core/begin.js';
import spawn from '@/lib/game/logic/spawn.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/game/logic/spawn.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/game/actions/set-beginning-state.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/events/event-catalog.js', () => ({
  AudioEvents: () => ({
    PLAY_SOUND: 'audio:play:sound',
    RESUME_BGM: 'audio:resume:bgm',
    STOP_BGM: 'audio:stop:bgm',
  }),
  GameEvents: (id) => ({
    START_TIMER: `game:${id}:start:timer`,
    // 如果 begin.js 中还有其他 GameEvents，在这里添加
    // UPDATE_HUD: `game:${id}:update:hud`,  // 如果有的话
    // PAUSE_TIMER: `game:${id}:pause:timer`, // 如果有的话
  }),
  ReplayEvents: (id) => ({
    START_RECORD: `replay:${id}:start:record`,
  }),
  UIEvents: (id) => ({
    UPDATE_HUD: `ui:${id}:update:hud`,
  }),
}));

describe('begin', () => {
  let mockContext;
  let mockStore;
  let scheduler;

  beforeEach(() => {
    jest.clearAllMocks();

    scheduler = new Scheduler();
    scheduler.now = 0;

    mockStore = {
      getLevel: jest.fn().mockReturnValue(5),
      resetBoard: jest.fn(),
    };

    mockContext = {
      id: 'test-game-uuid',
      Store: mockStore,
      Scheduler: scheduler,
      emit: jest.fn(),
    };
  });

  // ==================== Replay 录制 ====================
  describe('Replay 录制', () => {
    it('应该发送开始录制事件', () => {
      begin(mockContext);
      expect(mockContext.emit).toHaveBeenCalledWith(
        'replay:test-game-uuid:start:record',
      );
    });
  });

  // ==================== Store 操作 ====================
  describe('Store 操作', () => {
    it('应该调用 Store.resetBoard', () => {
      begin(mockContext);
      expect(mockStore.resetBoard).toHaveBeenCalled();
    });

    it('应该调用 Store.getLevel 获取等级', () => {
      begin(mockContext);
      expect(mockStore.getLevel).toHaveBeenCalled();
    });
  });

  // ==================== setBeginningState ====================
  describe('setBeginningState', () => {
    it('应该调用 setBeginningState 设置 playing 状态', () => {
      begin(mockContext);
      expect(setBeginningState).toHaveBeenCalledWith(mockContext, 'playing', 5);
    });

    it('应该传递正确的 level', () => {
      mockStore.getLevel.mockReturnValue(8);
      begin(mockContext);
      expect(setBeginningState).toHaveBeenCalledWith(mockContext, 'playing', 8);
    });
  });

  // ==================== HUD 更新 ====================
  describe('HUD 更新', () => {
    it('应该在 setBeginningState 之后更新 HUD', () => {
      begin(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-game-uuid:update:hud',
      );

      const events = mockContext.emit.mock.calls.map(([e]) => e);
      const hudIdx = events.indexOf('ui:test-game-uuid:update:hud');
      const recordIdx = events.indexOf('replay:test-game-uuid:start:record');
      expect(hudIdx).toBeGreaterThan(recordIdx);
    });

    it('应该发送 START_TIMER 事件', () => {
      begin(mockContext);
      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:test-game-uuid:start:timer',
      );
    });
  });

  // ==================== spawn ====================
  describe('spawn', () => {
    it('应该调用 spawn 生成初始方块', () => {
      begin(mockContext);
      expect(spawn).toHaveBeenCalledWith(mockContext);
    });
  });

  // ==================== 音效 ====================
  describe('音效', () => {
    it('应该播放游戏开始音效', () => {
      begin(mockContext);
      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'GAME_STARTED',
      });
    });

    it('延迟 250ms 后播放背景音乐', () => {
      begin(mockContext);

      expect(mockContext.emit).not.toHaveBeenCalledWith(
        'audio:resume:bgm',
        expect.any(Object),
      );

      scheduler.tick(0);
      scheduler.tick(250);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:resume:bgm', {
        level: 5,
      });
    });

    it('延迟播放 BGM 应该传递正确的 level', () => {
      mockStore.getLevel.mockReturnValue(10);
      begin(mockContext);

      scheduler.tick(0);
      scheduler.tick(250);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:resume:bgm', {
        level: 10,
      });
    });

    it('BGM 不应该在 250ms 之前播放', () => {
      begin(mockContext);

      scheduler.tick(0);
      scheduler.tick(200);

      expect(mockContext.emit).not.toHaveBeenCalledWith(
        'audio:resume:bgm',
        expect.any(Object),
      );
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    it('应该按正确顺序 emit 事件', () => {
      begin(mockContext);

      const events = mockContext.emit.mock.calls.map(([e]) => e);

      const recordIdx = events.indexOf('replay:test-game-uuid:start:record');
      const hudIdx = events.indexOf('ui:test-game-uuid:update:hud');
      const soundIdx = events.indexOf('audio:play:sound');

      expect(recordIdx).toBeLessThan(hudIdx);
      expect(hudIdx).toBeLessThan(soundIdx);
    });
  });
});
