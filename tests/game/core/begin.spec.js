import begin from '@/lib/game/core/begin.js';
import spawn from '@/lib/game/logic/spawn.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';
import padStart from '@/lib/utils/pad-start.js';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/game/logic/spawn.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/game/actions/set-beginning-state.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/utils/pad-start.js', () => ({
  __esModule: true,
  default: jest.fn((val, pad) => String(val).padStart(pad, '0')),
}));

/**
 * Mock event catalog
 *
 * 与源码中使用的 AudioEvents / ReplayEvents / UIEvents 对齐
 */
jest.mock('@/lib/events/event-catalog.js', () => ({
  AudioEvents: () => ({
    PLAY_SOUND: 'audio:play:sound',
    RESUME_BGM: 'audio:resume:bgm',
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
  let levelElement;

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

    levelElement = document.createElement('div');
    levelElement.id = 'level';
    document.body.appendChild(levelElement);
  });

  afterEach(() => {
    if (levelElement.parentNode) {
      levelElement.parentNode.removeChild(levelElement);
    }
  });

  // ==================== DOM 更新 ====================
  describe('DOM 更新', () => {
    it('应该更新 #level 元素的文本内容', () => {
      begin(mockContext);
      expect(levelElement.textContent).not.toBe('');
    });

    it('应该使用 padStart 格式化等级', () => {
      begin(mockContext);
      expect(padStart).toHaveBeenCalledWith(5, 2);
    });

    it('#level 元素不存在时不应该报错', () => {
      document.body.removeChild(levelElement);
      expect(() => begin(mockContext)).not.toThrow();
    });
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

      // 验证 HUD 在 spawn 之前
      const events = mockContext.emit.mock.calls.map(([e]) => e);
      const hudIdx = events.indexOf('ui:test-game-uuid:update:hud');
      const recordIdx = events.indexOf('replay:test-game-uuid:start:record');
      expect(hudIdx).toBeGreaterThan(recordIdx);
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

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('level 为 1 时应该正常格式化', () => {
      mockStore.getLevel.mockReturnValue(1);
      begin(mockContext);
      expect(padStart).toHaveBeenCalledWith(1, 2);
    });

    it('level 为两位数时应该正常格式化', () => {
      mockStore.getLevel.mockReturnValue(15);
      begin(mockContext);
      expect(padStart).toHaveBeenCalledWith(15, 2);
    });

    it('#level 元素不存在时不应导致后续流程中断', () => {
      document.body.removeChild(levelElement);
      begin(mockContext);
      expect(mockStore.resetBoard).toHaveBeenCalled();
      expect(setBeginningState).toHaveBeenCalled();
      expect(spawn).toHaveBeenCalled();
    });
  });
});
