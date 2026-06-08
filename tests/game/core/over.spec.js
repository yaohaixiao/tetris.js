import over from '@/lib/game/core/over.js';

describe('over', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getMode: jest.fn().mockReturnValue('playing'),
    };

    mockContext = {
      id: 'test-game-uuid',
      Store: mockStore,
      emit: jest.fn(),
      isVersus: jest.fn(() => false),
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该停止录制', () => {
      over(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'replay:test-game-uuid:stop:record',
      );
    });

    it('应该停止背景音乐', () => {
      over(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:stop:bgm');
    });

    it('应该播放游戏结束音效', () => {
      over(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'GAME_OVER',
      });
    });

    it('单人模式应该发送 GAME_OVER 事件', () => {
      mockContext.isVersus.mockReturnValue(false);
      over(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'replay:test-game-uuid:game:over',
      );
    });

    it('对战模式应该发送 battle:update:winner 事件', () => {
      mockContext.isVersus.mockReturnValue(true);
      over(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('battle:update:winner', {
        loser: mockContext,
      });
    });

    it('对战模式不应该发送 GAME_OVER 事件', () => {
      mockContext.isVersus.mockReturnValue(true);
      over(mockContext);

      expect(mockContext.emit).not.toHaveBeenCalledWith(
        'replay:test-game-uuid:game:over',
      );
    });
  });

  // ==================== 防重复执行 ====================
  describe('防重复执行', () => {
    it('mode 为 game-over 时应该直接返回', () => {
      mockStore.getMode.mockReturnValue('game-over');

      over(mockContext);

      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('mode 为 replay 时应该直接返回', () => {
      mockStore.getMode.mockReturnValue('replay');

      over(mockContext);

      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('mode 为 playing 时应该正常执行', () => {
      mockStore.getMode.mockReturnValue('playing');

      over(mockContext);

      expect(mockContext.emit).toHaveBeenCalled();
    });

    it('mode 为 paused 时应该正常执行', () => {
      mockStore.getMode.mockReturnValue('paused');

      over(mockContext);

      expect(mockContext.emit).toHaveBeenCalled();
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    it('应该按正确顺序发送事件', () => {
      over(mockContext);

      const calls = mockContext.emit.mock.calls.map(([event]) => event);

      const stopRecordIndex = calls.indexOf(
        'replay:test-game-uuid:stop:record',
      );
      const stopBgmIndex = calls.indexOf('audio:stop:bgm');
      const gameOverSoundIndex = calls.indexOf('audio:play:sound');
      const gameOverIndex = calls.indexOf('replay:test-game-uuid:game:over');

      expect(stopRecordIndex).toBeLessThan(stopBgmIndex);
      expect(stopBgmIndex).toBeLessThan(gameOverSoundIndex);
      expect(gameOverSoundIndex).toBeLessThan(gameOverIndex);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('Store.getMode 返回未知值时应该正常执行', () => {
      mockStore.getMode.mockReturnValue('unknown-mode');

      over(mockContext);

      expect(mockContext.emit).toHaveBeenCalled();
    });

    it('连续调用两次时第二次应该被阻止', () => {
      over(mockContext);

      const firstCallCount = mockContext.emit.mock.calls.length;

      mockStore.getMode.mockReturnValue('game-over');

      over(mockContext);

      expect(mockContext.emit).toHaveBeenCalledTimes(firstCallCount);
    });
  });
});
