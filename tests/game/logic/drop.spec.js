/** @jest-environment jsdom */

import drop from '@/lib/game/logic/drop.js';
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

describe('drop', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getState: jest.fn().mockReturnValue({
        curr: {
          shape: [[1]],
          color: '#FFA500',
        },
        cx: 4,
        cy: 18,
        score: 0,
      }),
      setState: jest.fn(),
    };

    mockContext = {
      id: 'test-uuid',
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 基本流程 ====================
  describe('基本流程', () => {
    it('应该循环调用 move 直到返回 false', () => {
      move
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      drop(mockContext);

      expect(move).toHaveBeenCalledTimes(4);
    });

    it('move 立即返回 false 时也应该正常执行后续', () => {
      move.mockReturnValue(false);

      drop(mockContext);

      expect(move).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 硬降计分 ====================
  describe('硬降计分', () => {
    it('应该计算下落格数并加 2 分/格', () => {
      // 直接用 mockReturnValue 覆盖全部 getState 调用
      mockStore.getState.mockReturnValue({
        cx: 4,
        cy: 20,
        score: 100,
        curr: { shape: [[1]], color: '#FFA500' },
      });

      // 但需要 startY 和 endY 不同，才能测试计分
      // 所以用 once 单独覆盖第一次
      mockStore.getState.mockReturnValueOnce({ cy: 18 }); // ① startY = 18
      // 之后全部走 mockReturnValue：cy = 20，cellsDropped = 2

      move
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      drop(mockContext);

      // cellsDropped = 20 - 18 = 2, +2×2 = +4
      expect(mockStore.setState).toHaveBeenCalledWith({ score: 104 });
    });

    it('move 立即返回 false 时不加分', () => {
      mockStore.getState.mockReturnValue({
        cx: 4,
        cy: 18,
        score: 100,
        curr: { shape: [[1]], color: '#FFA500' },
      });

      move.mockReturnValue(false);

      drop(mockContext);

      // cellsDropped = 18 - 18 = 0，不加分
      expect(mockStore.setState).toHaveBeenCalledWith({ score: 100 });
    });
  });

  // ==================== move 调用参数 ====================
  describe('move 调用参数', () => {
    it('应该以 (context, 0, 1, true) 参数调用 move，标记为硬降', () => {
      move.mockReturnValue(false);

      drop(mockContext);

      expect(move).toHaveBeenCalledWith(mockContext, 0, 1, true);
    });

    it('每次循环都应该传递相同的参数', () => {
      move
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      drop(mockContext);

      move.mock.calls.forEach((call) => {
        expect(call).toEqual([mockContext, 0, 1, true]);
      });
    });
  });

  // ==================== 后续操作 ====================
  describe('后续操作', () => {
    beforeEach(() => {
      move.mockReturnValue(false);
    });

    it('应该锁定方块', () => {
      drop(mockContext);

      expect(lock).toHaveBeenCalledWith(mockContext);
      expect(lock).toHaveBeenCalledTimes(1);
    });

    it('应该发射落地高亮事件', () => {
      drop(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'game:test-uuid:start:landing:flash',
        { piece: { shape: [[1]], cx: 4, cy: 18 } },
      );
    });

    it('应该播放落地音效', () => {
      drop(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'FALL',
      });
    });

    it('应该执行消行', () => {
      drop(mockContext);

      expect(clearLines).toHaveBeenCalledWith(mockContext);
      expect(clearLines).toHaveBeenCalledTimes(1);
    });

    it('应该生成新方块', () => {
      drop(mockContext);

      expect(spawn).toHaveBeenCalledWith(mockContext);
      expect(spawn).toHaveBeenCalledTimes(1);
    });

    it('应该播放快速下落完成音效', () => {
      drop(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'DROP',
      });
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    beforeEach(() => {
      move.mockReturnValue(false);
    });

    it('lock → landing flash → FALL → clearLines → spawn → DROP', () => {
      drop(mockContext);

      const events = mockContext.emit.mock.calls.map(([e]) => e);

      const lockOrder = lock.mock.invocationCallOrder[0];
      const clearLinesOrder = clearLines.mock.invocationCallOrder[0];
      const spawnOrder = spawn.mock.invocationCallOrder[0];

      expect(lockOrder).toBeLessThan(clearLinesOrder);
      expect(clearLinesOrder).toBeLessThan(spawnOrder);

      const flashIdx = events.indexOf('game:test-uuid:start:landing:flash');
      const fallIdx = events.indexOf('audio:play:sound');
      const dropIdx = events.lastIndexOf('audio:play:sound');

      expect(flashIdx).toBeLessThan(fallIdx);
      expect(fallIdx).toBeLessThan(dropIdx);
    });
  });

  // ==================== 音效 ====================
  describe('音效', () => {
    it('总共应该播放两个音效', () => {
      move.mockReturnValue(false);

      drop(mockContext);

      const soundCalls = mockContext.emit.mock.calls.filter(
        ([event]) => event === 'audio:play:sound',
      );

      expect(soundCalls).toHaveLength(2);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('move 多次返回 true 后返回 false 应该正确完成流程', () => {
      move
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      drop(mockContext);

      expect(move).toHaveBeenCalledTimes(6);
      expect(lock).toHaveBeenCalledTimes(1);
      expect(spawn).toHaveBeenCalledTimes(1);
    });

    it('move 第一次就返回 false 应该正常完成全部后续流程', () => {
      move.mockReturnValue(false);

      drop(mockContext);

      expect(lock).toHaveBeenCalled();
      expect(clearLines).toHaveBeenCalled();
      expect(spawn).toHaveBeenCalled();
      // 3 个 emit：landing flash + FALL + DROP
      expect(mockContext.emit).toHaveBeenCalledTimes(3);
    });
  });
});
