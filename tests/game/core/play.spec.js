/** @jest-environment jsdom */

import pause from '@/lib/game/core/pause.js';

describe('pause', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getMode: jest.fn().mockReturnValue('playing'),
      setMode: jest.fn(),
    };

    mockContext = {
      id: 'test-game-uuid',
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该发送 UI 模式更新事件', () => {
      pause(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-game-uuid:update:mode',
        { mode: 'paused' },
      );
    });

    it('应该设置 Store 模式为 paused', () => {
      pause(mockContext);

      expect(mockStore.setMode).toHaveBeenCalledWith('paused');
    });

    it('应该停止背景音乐', () => {
      pause(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:stop:bgm');
    });

    it('应该播放暂停音效', () => {
      pause(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'PAUSED',
      });
    });

    it('应该发送开始暂停事件', () => {
      pause(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:test-game-uuid:start:paused',
      );
    });
  });

  // ==================== 模式限制 ====================
  describe('模式限制', () => {
    it('mode 为 playing 时应该正常执行', () => {
      mockStore.getMode.mockReturnValue('playing');

      pause(mockContext);

      expect(mockStore.setMode).toHaveBeenCalled();
    });

    it('mode 不为 playing 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('paused');

      pause(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('mode 为 game-over 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('game-over');

      pause(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });

    it('mode 为 main-menu 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('main-menu');

      pause(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });

    it('mode 为 difficulty 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('difficulty');

      pause(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });

    it('mode 为 replay 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('replay');

      pause(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    it('应该先发送 UI 更新事件再设置 Store', () => {
      pause(mockContext);

      const firstEmitOrder = mockContext.emit.mock.invocationCallOrder[0];
      const setModeOrder = mockStore.setMode.mock.invocationCallOrder[0];

      // pause 里先 emit 再 setMode
      expect(firstEmitOrder).toBeLessThan(setModeOrder);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('Store.getMode 返回 null 时应该不执行', () => {
      mockStore.getMode.mockReturnValue(null);

      pause(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });

    it('Store.getMode 返回 undefined 时应该不执行', () => {
      mockStore.getMode.mockReturnValue(undefined);

      pause(mockContext);

      expect(mockStore.setMode).not.toHaveBeenCalled();
    });

    it('连续调用两次时第二次应该被阻止', () => {
      pause(mockContext);
      expect(mockStore.setMode).toHaveBeenCalledTimes(1);

      mockStore.getMode.mockReturnValue('paused');

      pause(mockContext);
      expect(mockStore.setMode).toHaveBeenCalledTimes(1);
    });
  });
});
