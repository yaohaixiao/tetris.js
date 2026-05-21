import reset from '@/lib/game/core/reset.js';

// Mock 依赖
jest.mock('@/lib/game/actions/set-beginning-state.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import setBeginningState from '@/lib/game/actions/set-beginning-state.js';

describe('reset', () => {
  let mockGame;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = {
      id: 'test-uuid',
      Store: {
        getLevel: jest.fn().mockReturnValue(5),
        resetBoard: jest.fn(),
        getState: jest.fn().mockReturnValue({ score: 0, lines: 0, level: 1 }),
        setDifficulty: jest.fn(),
        setMode: jest.fn(),
        setController: jest.fn(),
        setState: jest.fn(),
      },
      emit: jest.fn(),
    };
  });

  // ==================== main-menu 模式（默认） ====================
  describe('main-menu 模式（默认）', () => {
    beforeEach(() => {
      reset(mockGame);
    });

    it('应该停止背景音乐', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('audio:stop:bgm');
    });

    it('应该清除动画和命令队列', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('animations:test-uuid:clear');
      expect(mockGame.emit).toHaveBeenCalledWith(
        'command:queue:test-uuid:clear',
      );
    });

    it('应该重置棋盘数据', () => {
      expect(mockGame.Store.resetBoard).toHaveBeenCalled();
    });

    it('应该重置难度为 easy', () => {
      expect(mockGame.Store.setDifficulty).toHaveBeenCalledWith('easy');
    });

    it('应该将等级重置为 1', () => {
      expect(setBeginningState).toHaveBeenCalledWith(mockGame, 'main-menu', 1);
    });

    it('应该播放场景切换音效', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'SWITCH_SCENE',
      });
    });

    it('应该更新 HUD 和 UI 模式', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('ui:test-uuid:update:hud', {
        state: mockGame.Store.getState(),
      });
      expect(mockGame.emit).toHaveBeenCalledWith('ui:test-uuid:update:mode', {
        mode: 'main-menu',
      });
    });

    // ========== 新增验证 ==========

    it('应该停止 AI', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('ai:test-uuid:stop');
    });

    it('应该将 controller 重置为 human', () => {
      expect(mockGame.Store.setController).toHaveBeenCalledWith('human');
      expect(mockGame.emit).toHaveBeenCalledWith(
        'ui:test-uuid:update:controller',
        {
          controller: 'human',
        },
      );
    });

    it('应该重置回放状态', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('replay:test-uuid:reset');
    });
  });

  // ==================== playing 模式（重新开始） ====================
  describe('playing 模式（重新开始）', () => {
    beforeEach(() => {
      reset(mockGame, 'playing');
    });

    it('不应该重置难度', () => {
      expect(mockGame.Store.setDifficulty).not.toHaveBeenCalled();
    });

    it('不应该将等级重置为 1', () => {
      expect(setBeginningState).toHaveBeenCalledWith(
        mockGame,
        'playing',
        5, // 保持原等级
      );
    });

    it('不应该播放场景切换音效', () => {
      expect(mockGame.emit).not.toHaveBeenCalledWith('audio:resume:sound', {
        sound: 'SWITCH_SCENE',
      });
    });

    it('更新 UI 模式为 playing', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('ui:test-uuid:update:mode', {
        mode: 'playing',
      });
    });

    // ========== 新增验证 ==========

    it('应该停止 AI', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('ai:test-uuid:stop');
    });

    it('应该将 controller 重置为 human', () => {
      expect(mockGame.Store.setController).toHaveBeenCalledWith('human');
      expect(mockGame.emit).toHaveBeenCalledWith(
        'ui:test-uuid:update:controller',
        {
          controller: 'human',
        },
      );
    });

    it('应该重置回放状态', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('replay:test-uuid:reset');
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('应该处理 mode 为 undefined 的情况（使用默认值）', () => {
      reset(mockGame, undefined);

      expect(setBeginningState).toHaveBeenCalledWith(mockGame, 'main-menu', 1);
    });

    it('多次调用 emit 不会报错', () => {
      expect(() => {
        reset(mockGame);
      }).not.toThrow();
    });
  });
});
