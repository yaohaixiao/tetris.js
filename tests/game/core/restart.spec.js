/** @jest-environment jsdom */

import restart from '@/lib/game/core/restart.js';
import reset from '@/lib/game/core/reset.js';
import spawn from '@/lib/game/logic/spawn.js';

// Mock 依赖
jest.mock('@/lib/game/core/reset.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/game/logic/spawn.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('restart', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getMode: jest.fn().mockReturnValue('playing'),
      getLevel: jest.fn().mockReturnValue(5),
    };

    mockContext = {
      Store: mockStore,
      emit: jest.fn(),
      options: {
        Level: {
          max: 15,
        },
      },
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该调用 reset 重置状态为 playing', () => {
      restart(mockContext);

      expect(reset).toHaveBeenCalledWith(mockContext, 'playing');
    });

    it('应该调用 spawn 生成新方块', () => {
      restart(mockContext);

      expect(spawn).toHaveBeenCalledWith(mockContext);
    });

    it('应该播放背景音乐', () => {
      restart(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 5,
        maxLevel: 15,
      });
    });
  });

  // ==================== 模式限制 ====================
  describe('模式限制', () => {
    it('mode 为 playing 时应该正常执行', () => {
      mockStore.getMode.mockReturnValue('playing');

      restart(mockContext);

      expect(reset).toHaveBeenCalled();
    });

    it('mode 不为 playing 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('paused');

      restart(mockContext);

      expect(reset).not.toHaveBeenCalled();
      expect(spawn).not.toHaveBeenCalled();
      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('mode 为 game-over 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('game-over');

      restart(mockContext);

      expect(reset).not.toHaveBeenCalled();
    });

    it('mode 为 main-menu 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('main-menu');

      restart(mockContext);

      expect(reset).not.toHaveBeenCalled();
    });

    it('mode 为 difficulty 时不应该执行', () => {
      mockStore.getMode.mockReturnValue('difficulty');

      restart(mockContext);

      expect(reset).not.toHaveBeenCalled();
    });
  });

  // ==================== 参数传递 ====================
  describe('参数传递', () => {
    it('应该获取当前等级传递给 BGM', () => {
      mockStore.getLevel.mockReturnValue(10);

      restart(mockContext);

      expect(mockStore.getLevel).toHaveBeenCalled();
      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 10,
        maxLevel: 15,
      });
    });

    it('应该获取最大等级传递给 BGM', () => {
      mockContext.options.Level.max = 20;

      restart(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 5,
        maxLevel: 20,
      });
    });

    it('level 和 maxLevel 不同时应该正确传递', () => {
      mockStore.getLevel.mockReturnValue(8);
      mockContext.options.Level.max = 30;

      restart(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 8,
        maxLevel: 30,
      });
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    it('应该先 reset 再 spawn', () => {
      restart(mockContext);

      const resetCallOrder = reset.mock.invocationCallOrder[0];
      const spawnCallOrder = spawn.mock.invocationCallOrder[0];

      expect(resetCallOrder).toBeLessThan(spawnCallOrder);
    });

    it('应该先 spawn 再播放 BGM', () => {
      restart(mockContext);

      const spawnCallOrder = spawn.mock.invocationCallOrder[0];
      const bgmCallOrder = mockContext.emit.mock.invocationCallOrder[0];

      expect(spawnCallOrder).toBeLessThan(bgmCallOrder);
    });

    it('完整执行顺序应为 reset → spawn → emit BGM', () => {
      restart(mockContext);

      const resetCallOrder = reset.mock.invocationCallOrder[0];
      const spawnCallOrder = spawn.mock.invocationCallOrder[0];
      const emitCallOrder = mockContext.emit.mock.invocationCallOrder[0];

      expect(resetCallOrder).toBeLessThan(spawnCallOrder);
      expect(spawnCallOrder).toBeLessThan(emitCallOrder);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('level 为 1 时应该正常传递', () => {
      mockStore.getLevel.mockReturnValue(1);

      restart(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:bgm', {
        level: 1,
        maxLevel: 15,
      });
    });

    it('Store.getMode 返回 null 时不应该执行', () => {
      mockStore.getMode.mockReturnValue(null);

      restart(mockContext);

      expect(reset).not.toHaveBeenCalled();
    });

    it('Store.getMode 返回 undefined 时不应该执行', () => {
      mockStore.getMode.mockReturnValue(undefined);

      restart(mockContext);

      expect(reset).not.toHaveBeenCalled();
    });

    it('不需要额外参数时 spawn 仍然应该被调用', () => {
      restart(mockContext);

      expect(spawn).toHaveBeenCalledTimes(1);
    });
  });
});
