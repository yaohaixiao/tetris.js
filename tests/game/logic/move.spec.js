// tests/game/logic/move.spec.js

import move from '@/lib/game/logic/move.js';
import collision from '@/lib/game/logic/collision.js';

jest.mock('@/lib/game/logic/collision.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('move', () => {
  let mockContext;
  let mockStore;
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      cx: 4,
      cy: 5,
      curr: { shape: [[1]], color: '#ffa500' },
    };

    mockStore = {
      getState: jest.fn().mockReturnValue(mockState),
      setState: jest.fn(),
    };

    mockContext = {
      Store: mockStore,
      emit: jest.fn(),
    };
  });

  // ==================== 移动成功 ====================
  describe('移动成功', () => {
    it('无碰撞时应该返回 true', () => {
      collision.mockReturnValue(false);

      const result = move(mockContext, 0, 1);

      expect(result).toBe(true);
    });

    it('应该更新 cx 和 cy', () => {
      collision.mockReturnValue(false);

      move(mockContext, 1, 1);

      expect(mockStore.setState).toHaveBeenCalledWith({
        cx: 5,
        cy: 6,
      });
    });

    it('只有 ox 时应该只更新 cx', () => {
      collision.mockReturnValue(false);

      move(mockContext, 1, 0);

      expect(mockStore.setState).toHaveBeenCalledWith({
        cx: 5,
        cy: 5,
      });
    });

    it('只有 oy 时应该只更新 cy', () => {
      collision.mockReturnValue(false);

      move(mockContext, 0, 1);

      expect(mockStore.setState).toHaveBeenCalledWith({
        cx: 4,
        cy: 6,
      });
    });

    it('应该播放移动音效', () => {
      collision.mockReturnValue(false);

      move(mockContext, 0, 1);

      expect(mockContext.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'MOVE',
      });
    });

    it('应该调用 collision 检测碰撞', () => {
      collision.mockReturnValue(false);

      move(mockContext, -1, 0);

      expect(collision).toHaveBeenCalledWith(mockContext, -1, 0);
    });

    it('移动成功时重置 _lockTimer', () => {
      mockState.curr._lockTimer = 200;
      collision.mockReturnValue(false);

      move(mockContext, 0, 1);

      expect(mockState.curr._lockTimer).toBe(0);
    });

    it('_lockTimer 不存在时不报错', () => {
      delete mockState.curr._lockTimer;
      collision.mockReturnValue(false);

      expect(() => move(mockContext, 0, 1)).not.toThrow();
    });
  });

  // ==================== 移动失败 ====================
  describe('移动失败', () => {
    it('碰撞时应该返回 false', () => {
      collision.mockReturnValue(true);

      const result = move(mockContext, 0, 1);

      expect(result).toBe(false);
    });

    it('碰撞时不应该更新状态', () => {
      collision.mockReturnValue(true);

      move(mockContext, 0, 1);

      expect(mockStore.setState).not.toHaveBeenCalled();
    });

    it('碰撞时不应该播放音效', () => {
      collision.mockReturnValue(true);

      move(mockContext, 0, 1);

      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('碰撞时 collision 仍然应该被调用', () => {
      collision.mockReturnValue(true);

      move(mockContext, 1, 1);

      expect(collision).toHaveBeenCalledWith(mockContext, 1, 1);
    });

    it('碰撞时不应该重置 _lockTimer', () => {
      mockState.curr._lockTimer = 200;
      collision.mockReturnValue(true);

      move(mockContext, 0, 1);

      expect(mockState.curr._lockTimer).toBe(200);
    });
  });

  // ==================== 参数传递 ====================
  describe('参数传递', () => {
    it('ox 为负数时应该正确传递', () => {
      collision.mockReturnValue(false);

      move(mockContext, -2, 0);

      expect(mockStore.setState).toHaveBeenCalledWith({ cx: 2, cy: 5 });
      expect(collision).toHaveBeenCalledWith(mockContext, -2, 0);
    });

    it('oy 为负数时应该正确传递', () => {
      collision.mockReturnValue(false);

      move(mockContext, 0, -1);

      expect(mockStore.setState).toHaveBeenCalledWith({ cx: 4, cy: 4 });
      expect(collision).toHaveBeenCalledWith(mockContext, 0, -1);
    });

    it('ox 和 oy 都为 0 时应该正常处理', () => {
      collision.mockReturnValue(false);

      move(mockContext, 0, 0);

      expect(mockStore.setState).toHaveBeenCalledWith({ cx: 4, cy: 5 });
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('cx 为 0 时左移应该正确检测碰撞', () => {
      mockState.cx = 0;
      collision.mockReturnValue(true);

      const result = move(mockContext, -1, 0);

      expect(result).toBe(false);
      expect(mockStore.setState).not.toHaveBeenCalled();
    });

    it('cy 为 0 时上移应该正确检测碰撞', () => {
      mockState.cy = 0;
      collision.mockReturnValue(true);

      const result = move(mockContext, 0, -1);

      expect(result).toBe(false);
    });

    it('碰撞时保持原 cx/cy 不变', () => {
      collision.mockReturnValue(true);
      const originalCx = mockState.cx;
      const originalCy = mockState.cy;

      move(mockContext, 1, 1);

      expect(mockState.cx).toBe(originalCx);
      expect(mockState.cy).toBe(originalCy);
    });

    it('多次移动应该正确累加', () => {
      collision.mockReturnValue(false);

      move(mockContext, 1, 0);
      expect(mockStore.setState).toHaveBeenLastCalledWith({ cx: 5, cy: 5 });

      mockState.cx = 5;
      mockState.cy = 5;

      move(mockContext, 0, 1);
      expect(mockStore.setState).toHaveBeenLastCalledWith({ cx: 5, cy: 6 });
    });
  });
});
