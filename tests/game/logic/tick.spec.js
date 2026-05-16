import tick from '@/lib/game/logic/tick.js';
import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';

// Mock 依赖
jest.mock('@/lib/game/logic/move.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/game/logic/lock.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/game/logic/clear-lines.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/game/logic/spawn.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('tick', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getMode: jest.fn(),
    };

    mockContext = {
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 模式限制 ====================
  describe('模式限制', () => {
    it('mode 为 playing 且未阻塞时应该正常执行', () => {
      mockStore.getMode.mockReturnValue('playing');
      move.mockReturnValue(true); // 移动成功，不会锁

      tick(mockContext, false);

      expect(move).toHaveBeenCalled();
    });

    it('mode 为 replay 且未阻塞时应该正常执行', () => {
      mockStore.getMode.mockReturnValue('replay');
      move.mockReturnValue(true);

      tick(mockContext, false);

      expect(move).toHaveBeenCalled();
    });

    it('mode 为 playing 但 isBlocked 为 true 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('playing');

      tick(mockContext, true);

      expect(move).not.toHaveBeenCalled();
    });

    it('mode 为 paused 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('paused');

      tick(mockContext, false);

      expect(move).not.toHaveBeenCalled();
    });

    it('mode 为 game-over 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('game-over');

      tick(mockContext, false);

      expect(move).not.toHaveBeenCalled();
    });

    it('mode 为 main-menu 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('main-menu');

      tick(mockContext, false);

      expect(move).not.toHaveBeenCalled();
    });

    it('mode 为 difficulty 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('difficulty');

      tick(mockContext, false);

      expect(move).not.toHaveBeenCalled();
    });
  });

  // ==================== playing 模式发送 AUTOTICK ====================
  describe('playing 模式发送 AUTO_TICK', () => {
    it('mode 为 playing 时应该发送 AUTO_TICK 事件', () => {
      mockStore.getMode.mockReturnValue('playing');
      move.mockReturnValue(true);

      tick(mockContext, false);

      expect(mockContext.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'replay',
        action: 'AUTO_TICK',
        payload: {
          Game: mockContext,
        },
      });
    });

    it('mode 为 replay 时不应该发送 AUTO_TICK 事件', () => {
      mockStore.getMode.mockReturnValue('replay');
      move.mockReturnValue(true);

      tick(mockContext, false);

      const autoTickCalls = mockContext.emit.mock.calls.filter(
        ([event]) => event === 'dispatch:input',
      );

      expect(autoTickCalls).toHaveLength(0);
    });

    it('isBlocked 为 true 时不应该发送 AUTO_TICK 事件', () => {
      mockStore.getMode.mockReturnValue('playing');

      tick(mockContext, true);

      expect(mockContext.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== 移动成功 ====================
  describe('移动成功', () => {
    it('move 返回 true 时不应该锁定', () => {
      mockStore.getMode.mockReturnValue('playing');
      move.mockReturnValue(true);

      tick(mockContext, false);

      expect(lock).not.toHaveBeenCalled();
      expect(clearLines).not.toHaveBeenCalled();
      expect(spawn).not.toHaveBeenCalled();
    });

    it('move 返回 true 时不应该播放音效', () => {
      mockStore.getMode.mockReturnValue('playing');
      move.mockReturnValue(true);

      tick(mockContext, false);

      const soundCalls = mockContext.emit.mock.calls.filter(
        ([event]) => event === 'audio:resume:sound',
      );

      // 只有 AUTO_TICK emit，没有 FALL 音效
      expect(soundCalls).toHaveLength(0);
    });

    it('move 应该以 (context, 0, 1) 参数调用', () => {
      mockStore.getMode.mockReturnValue('playing');
      move.mockReturnValue(true);

      tick(mockContext, false);

      expect(move).toHaveBeenCalledWith(mockContext, 0, 1);
    });
  });

  // ==================== 移动失败 → 锁定流程 ====================
  describe('移动失败 → 锁定流程', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      move.mockReturnValue(false);
    });

    it('move 返回 false 时应该锁定方块', () => {
      tick(mockContext, false);

      expect(lock).toHaveBeenCalledWith(mockContext);
    });

    it('应该播放 FALL 音效', () => {
      tick(mockContext, false);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:resume:sound', {
        sound: 'FALL',
      });
    });

    it('应该执行消行', () => {
      tick(mockContext, false);

      expect(clearLines).toHaveBeenCalledWith(mockContext);
    });

    it('应该生成新方块', () => {
      tick(mockContext, false);

      expect(spawn).toHaveBeenCalledWith(mockContext);
    });
  });

  // ==================== 锁定流程执行顺序 ====================
  describe('锁定流程执行顺序', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      move.mockReturnValue(false);
    });

    it('应该先 lock 再 clearLines', () => {
      tick(mockContext, false);

      const lockOrder = lock.mock.invocationCallOrder[0];
      const clearLinesOrder = clearLines.mock.invocationCallOrder[0];

      expect(lockOrder).toBeLessThan(clearLinesOrder);
    });

    it('应该先 clearLines 再 spawn', () => {
      tick(mockContext, false);

      const clearLinesOrder = clearLines.mock.invocationCallOrder[0];
      const spawnOrder = spawn.mock.invocationCallOrder[0];

      expect(clearLinesOrder).toBeLessThan(spawnOrder);
    });

    it('播放 FALL 音效应该在 lock 之后', () => {
      tick(mockContext, false);

      const lockOrder = lock.mock.invocationCallOrder[0];

      const fallSoundIndex = mockContext.emit.mock.calls.findIndex(
        ([event, payload]) =>
          event === 'audio:resume:sound' && payload.sound === 'FALL',
      );

      expect(lockOrder).toBeLessThan(
        mockContext.emit.mock.invocationCallOrder[fallSoundIndex],
      );
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('mode 为 null 时不应该执行', () => {
      mockStore.getMode.mockReturnValue(null);

      tick(mockContext, false);

      expect(move).not.toHaveBeenCalled();
    });

    it('mode 为 undefined 时不应该执行', () => {
      mockStore.getMode.mockReturnValue(undefined);

      tick(mockContext, false);

      expect(move).not.toHaveBeenCalled();
    });

    it('replay 模式 move 失败也应该执行锁定流程', () => {
      mockStore.getMode.mockReturnValue('replay');
      move.mockReturnValue(false);

      tick(mockContext, false);

      expect(lock).toHaveBeenCalled();
      expect(clearLines).toHaveBeenCalled();
      expect(spawn).toHaveBeenCalled();
    });

    it('replay 模式 move 成功不应该锁定', () => {
      mockStore.getMode.mockReturnValue('replay');
      move.mockReturnValue(true);

      tick(mockContext, false);

      expect(lock).not.toHaveBeenCalled();
    });
  });
});
