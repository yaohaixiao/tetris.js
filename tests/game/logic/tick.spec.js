import tick from '@/lib/game/logic/tick.js';
import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';

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

jest.mock('@/lib/events/event-catalog.js', () => ({
  AudioEvents: () => ({
    PLAY_SOUND: 'audio:play:sound',
  }),
  GameEvents: (uuid) => ({
    START_LANDING_FLASH: `game:${uuid}:start:landing:flash`,
  }),
}));

describe('tick', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getMode: jest.fn(),
      getState: jest.fn().mockReturnValue({
        curr: { shape: [[1]], color: '#FFA500' },
        cx: 4,
        cy: 18,
      }),
    };

    mockContext = {
      id: 'test-uuid',
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 模式限制 ====================
  describe('模式限制', () => {
    it('mode 为 playing 且未阻塞时应该正常执行', () => {
      mockStore.getMode.mockReturnValue('playing');
      move.mockReturnValue(true);

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

  // ==================== playing 模式发送 AUTO_TICK ====================
  describe('playing 模式发送 AUTO_TICK', () => {
    it('mode 为 playing 时应该发送 AUTO_TICK 事件', () => {
      mockStore.getMode.mockReturnValue('playing');
      move.mockReturnValue(true);

      tick(mockContext, false);

      expect(mockContext.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'replay',
        action: 'AUTO_TICK',
        payload: { Game: mockContext },
      });
    });

    it('mode 为 replay 时不应该发送 AUTO_TICK', () => {
      mockStore.getMode.mockReturnValue('replay');
      move.mockReturnValue(true);

      tick(mockContext, false);

      const autoTickCalls = mockContext.emit.mock.calls.filter(
        ([event]) => event === 'dispatch:input',
      );
      expect(autoTickCalls).toHaveLength(0);
    });

    it('isBlocked 为 true 时不应该发送 AUTO_TICK', () => {
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

    it('应该发射落地高亮事件', () => {
      tick(mockContext, false);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:test-uuid:start:landing:flash',
        { piece: { shape: [[1]], cx: 4, cy: 18 } },
      );
    });

    it('应该播放 FALL 音效', () => {
      tick(mockContext, false);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:sound', {
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

      expect(lock.mock.invocationCallOrder[0])
        .toBeLessThan(clearLines.mock.invocationCallOrder[0]);
    });

    it('应该先 clearLines 再 spawn', () => {
      tick(mockContext, false);

      expect(clearLines.mock.invocationCallOrder[0])
        .toBeLessThan(spawn.mock.invocationCallOrder[0]);
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
