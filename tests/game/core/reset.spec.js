import reset from '@/lib/game/core/reset.js';

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
        getMode: jest.fn().mockReturnValue('playing'),
        getLevel: jest.fn().mockReturnValue(5),
        getDifficulty: jest.fn().mockReturnValue('normal'),
        getController: jest.fn().mockReturnValue('human'),
        resetBoard: jest.fn(),
        getState: jest.fn().mockReturnValue({ score: 0, lines: 0, level: 1 }),
        setDifficulty: jest.fn(),
        setMode: jest.fn(),
        setController: jest.fn(),
        setState: jest.fn(),
      },
      emit: jest.fn(),
      isVersus: jest.fn(() => false),
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

    it('应该清空 next 和 hold 预览', () => {
      expect(mockGame.emit).toHaveBeenCalledWith(
        'ui:test-uuid:clear:next:piece',
      );
      expect(mockGame.emit).toHaveBeenCalledWith(
        'ui:test-uuid:clear:hold:piece',
      );
    });

    it('应该停止 AI', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('ai:test-uuid:stop');
    });

    it('应该将 controller 重置为 human', () => {
      expect(mockGame.Store.setController).toHaveBeenCalledWith('human');
      expect(mockGame.emit).toHaveBeenCalledWith(
        'ui:test-uuid:update:controller',
        { controller: 'human' },
      );
    });

    it('应该重置回放状态', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('replay:test-uuid:reset');
    });

    it('单人模式不应该重启 AI', () => {
      expect(mockGame.emit).not.toHaveBeenCalledWith('ai:test-uuid:start');
    });
  });

  // ==================== 对战模式 main-menu ====================
  describe('对战模式 main-menu', () => {
    beforeEach(() => {
      mockGame.isVersus.mockReturnValue(true);
      mockGame.Store.getMode.mockReturnValue('playing');
      mockGame.Store.getController.mockReturnValue('ai');
      reset(mockGame);
    });

    it('对战模式应该保留难度（不重置为 easy）', () => {
      expect(mockGame.Store.setDifficulty).toHaveBeenCalledWith('normal');
    });

    it('对战模式 main-menu 也应该将等级重置为 1', () => {
      expect(setBeginningState).toHaveBeenCalledWith(mockGame, 'main-menu', 1);
    });

    it('对战模式应该保留 controller', () => {
      expect(mockGame.Store.setController).toHaveBeenCalledWith('ai');
    });

    it('AI controller 时应该重启 AI', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('ai:test-uuid:start');
    });
  });

  // ==================== 对战模式 battle-over ====================
  describe('对战模式 battle-over', () => {
    beforeEach(() => {
      mockGame.isVersus.mockReturnValue(true);
      mockGame.Store.getMode.mockReturnValue('battle-over');
      mockGame.Store.getController.mockReturnValue('human');
      reset(mockGame);
    });

    it('battle-over 模式应该将难度重置为 easy', () => {
      // battle-over 时 Store.getMode() === 'battle-over'，条件不满足
      // difficulty = 'easy'，不保留原难度
      expect(mockGame.Store.setDifficulty).toHaveBeenCalledWith('easy');
    });

    it('battle-over 模式应该将等级重置为 1', () => {
      expect(setBeginningState).toHaveBeenCalledWith(mockGame, 'main-menu', 1);
    });

    it('battle-over 重置 controller 为 human', () => {
      expect(mockGame.Store.setController).toHaveBeenCalledWith('human');
    });

    it('battle-over 不应该重启 AI', () => {
      expect(mockGame.emit).not.toHaveBeenCalledWith('ai:test-uuid:start');
    });
  });

  // ==================== 对战模式 battle-over + AI controller ====================
  describe('对战模式 battle-over（AI controller）', () => {
    beforeEach(() => {
      mockGame.isVersus.mockReturnValue(true);
      mockGame.Store.getMode.mockReturnValue('battle-over');
      mockGame.Store.getController.mockReturnValue('ai');
      reset(mockGame);
    });

    it('battle-over 模式应该将难度重置为 easy（即使是 AI）', () => {
      expect(mockGame.Store.setDifficulty).toHaveBeenCalledWith('easy');
    });

    it('battle-over 应该保留 AI controller', () => {
      expect(mockGame.Store.setController).toHaveBeenCalledWith('ai');
    });

    it('AI controller 时应该重启 AI', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('ai:test-uuid:start');
    });
  });

  // ==================== playing 模式 ====================
  describe('playing 模式（重新开始）', () => {
    beforeEach(() => {
      reset(mockGame, 'playing');
    });

    it('不应该重置难度', () => {
      expect(mockGame.Store.setDifficulty).not.toHaveBeenCalled();
    });

    it('不应该将等级重置为 1', () => {
      expect(setBeginningState).toHaveBeenCalledWith(mockGame, 'playing', 5);
    });

    it('不应该播放场景切换音效', () => {
      expect(mockGame.emit).not.toHaveBeenCalledWith('audio:play:sound', {
        sound: 'SWITCH_SCENE',
      });
    });

    it('更新 UI 模式为 playing', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('ui:test-uuid:update:mode', {
        mode: 'playing',
      });
    });

    it('应该停止 AI', () => {
      expect(mockGame.emit).toHaveBeenCalledWith('ai:test-uuid:stop');
    });

    it('应该将 controller 重置为 human', () => {
      expect(mockGame.Store.setController).toHaveBeenCalledWith('human');
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
