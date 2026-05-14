/** @jest-environment jsdom */

import begin from '@/lib/game/core/begin.js';
import spawn from '@/lib/game/logic/spawn.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';
import padStart from '@/lib/utils/pad-start.js';

// Mock 依赖
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

describe('begin', () => {
  let mockContext;
  let mockStore;
  let levelElement;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockStore = {
      getLevel: jest.fn().mockReturnValue(5),
      resetBoard: jest.fn(),
    };

    mockContext = {
      id: 'test-game-uuid',
      Store: mockStore,
      emit: jest.fn(),
      options: {
        Level: {
          max: 15,
        },
      },
    };

    // 创建 DOM 元素
    levelElement = document.createElement('div');
    levelElement.id = 'level';
    document.body.appendChild(levelElement);
  });

  afterEach(() => {
    // 清理 DOM
    if (levelElement.parentNode) {
      levelElement.parentNode.removeChild(levelElement);
    }
    jest.useRealTimers();
  });

  // ==================== DOM 更新 ====================
  describe('DOM 更新', () => {
    it('应该更新 #level 元素的文本内容', () => {
      begin(mockContext);

      expect(levelElement.textContent).not.toBe('');
    });

    it('应该使用 padStart 格式化等级', () => {
      mockStore.getLevel.mockReturnValue(5);

      begin(mockContext);

      expect(padStart).toHaveBeenCalledWith(5, 2);
    });

    it('#level 元素不存在时不应该报错', () => {
      document.body.removeChild(levelElement);

      expect(() => {
        begin(mockContext);
      }).not.toThrow();
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

    it('应该延迟 250ms 播放背景音乐', () => {
      begin(mockContext);

      expect(mockContext.emit).not.toHaveBeenCalledWith(
        'audio:play:bgm',
        expect.any(Object),
      );

      jest.advanceTimersByTime(250);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 5,
        maxLevel: 15,
      });
    });

    it('延迟播放 BGM 应该传递正确的 level 和 maxLevel', () => {
      mockStore.getLevel.mockReturnValue(10);
      mockContext.options.Level.max = 20;

      begin(mockContext);
      jest.advanceTimersByTime(250);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 10,
        maxLevel: 20,
      });
    });

    it('BGM 不应该在 250ms 之前播放', () => {
      begin(mockContext);

      jest.advanceTimersByTime(200);

      expect(mockContext.emit).not.toHaveBeenCalledWith(
        'audio:play:bgm',
        expect.any(Object),
      );
    });
  });

  // ==================== 执行顺序验证 ====================
  describe('执行顺序验证', () => {
    it('应该按正确顺序执行操作', () => {
      begin(mockContext);

      const callNames = mockContext.emit.mock.calls.map(([event]) => event);

      // 1. replay:start:record
      // 2. audio:play:sound (GAME_STARTED)
      const recordIndex = callNames.indexOf(
        'replay:test-game-uuid:start:record',
      );
      const soundIndex = callNames.indexOf('audio:play:sound');

      expect(recordIndex).toBeLessThan(soundIndex);
      expect(mockStore.resetBoard).toHaveBeenCalled();
      expect(setBeginningState).toHaveBeenCalled();
      expect(spawn).toHaveBeenCalled();
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

      // 后续流程仍然应该执行
      expect(mockStore.resetBoard).toHaveBeenCalled();
      expect(setBeginningState).toHaveBeenCalled();
      expect(spawn).toHaveBeenCalled();
    });
  });
});
