/** @jest-environment jsdom */

import drop from '@/lib/game/logic/drop.js';
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

describe('drop', () => {
  let mockContext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContext = {
      emit: jest.fn(),
    };
  });

  // ==================== 基本流程 ====================
  describe('基本流程', () => {
    it('应该循环调用 move 直到返回 false', () => {
      // 前 3 次返回 true，第 4 次返回 false
      move
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      drop(mockContext);

      expect(move).toHaveBeenCalledTimes(4);
    });

    it('move 一直返回 true 会无限循环（理论上不会发生）', () => {
      // 模拟 move 一直返回 true，
      // 在实际使用中不会发生，因为总会触底
      // 这里只验证函数结构
    });

    it('move 立即返回 false 时也应该正常执行后续', () => {
      move.mockReturnValue(false);

      drop(mockContext);

      expect(move).toHaveBeenCalledTimes(1);
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

    it('move 循环结束后应该按顺序执行 lock → 音效 → clearLines → spawn → 音效', () => {
      drop(mockContext);

      const lockOrder = lock.mock.invocationCallOrder[0];
      const clearLinesOrder = clearLines.mock.invocationCallOrder[0];
      const spawnOrder = spawn.mock.invocationCallOrder[0];

      // lock 在 clearLines 之前
      expect(lockOrder).toBeLessThan(clearLinesOrder);
      // clearLines 在 spawn 之前
      expect(clearLinesOrder).toBeLessThan(spawnOrder);
    });

    it('锁定时不应该再移动', () => {
      move.mockReturnValue(false);

      drop(mockContext);

      // move 只调用了一次
      expect(move).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== move 调用参数 ====================
  describe('move 调用参数', () => {
    it('应该以 (context, 0, 1) 参数调用 move', () => {
      move.mockReturnValue(false);

      drop(mockContext);

      expect(move).toHaveBeenCalledWith(mockContext, 0, 1);
    });

    it('每次循环都应该传递相同的参数', () => {
      move
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      drop(mockContext);

      const allCalls = move.mock.calls;
      allCalls.forEach((call) => {
        expect(call).toEqual([mockContext, 0, 1]);
      });
    });
  });

  // ==================== 音效 ====================
  describe('音效', () => {
    it('FALL 音效应该在 lock 之后播放', () => {
      move.mockReturnValue(false);

      drop(mockContext);

      const lockOrder = lock.mock.invocationCallOrder[0];
      const fallSoundCall = mockContext.emit.mock.calls.find(
        ([event, payload]) =>
          event === 'audio:play:sound' && payload.sound === 'FALL',
      );

      // 查找该调用的顺序
      const fallSoundIndex = mockContext.emit.mock.calls.findIndex(
        ([event, payload]) =>
          event === 'audio:play:sound' && payload.sound === 'FALL',
      );

      expect(lockOrder).toBeLessThan(
        mockContext.emit.mock.invocationCallOrder[fallSoundIndex],
      );
    });

    it('DROP 音效应该在 spawn 之后播放', () => {
      move.mockReturnValue(false);

      drop(mockContext);

      const spawnOrder = spawn.mock.invocationCallOrder[0];
      const dropSoundIndex = mockContext.emit.mock.calls.findIndex(
        ([event, payload]) =>
          event === 'audio:play:sound' && payload.sound === 'DROP',
      );

      expect(spawnOrder).toBeLessThan(
        mockContext.emit.mock.invocationCallOrder[dropSoundIndex],
      );
    });

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
      expect(mockContext.emit).toHaveBeenCalledTimes(2);
    });
  });
});
