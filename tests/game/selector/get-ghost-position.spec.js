import getGhostPosition from '@/lib/game/selector/get-ghost-position.js';
import collision from '@/lib/game/logic/collision.js';

jest.mock('@/lib/game/logic/collision.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('getGhostPosition', () => {
  let mockRuntime;
  let mockStore;
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      curr: { shape: [[1]], color: '#FFA500' },
      cx: 4,
      cy: 5,
    };

    mockStore = {
      getState: jest.fn().mockReturnValue(mockState),
    };

    mockRuntime = {
      Store: mockStore,
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('无活动方块时应该返回 null', () => {
      mockState.curr = null;

      const result = getGhostPosition(mockRuntime);

      expect(result).toBeNull();
    });

    it('应该从当前 cy 开始检测碰撞', () => {
      collision.mockReturnValue(true); // 第一次就碰撞

      getGhostPosition(mockRuntime);

      // 第一次调用：oy = ghostY - cy + 1 = 5 - 5 + 1 = 1
      expect(collision).toHaveBeenCalledWith(mockRuntime, 0, 1);
    });

    it('应该返回 Ghost 的 cx 和 cy', () => {
      collision.mockReturnValueOnce(false)  // oy=1 无碰撞
               .mockReturnValueOnce(false)  // oy=2 无碰撞
               .mockReturnValueOnce(true);  // oy=3 碰撞

      const result = getGhostPosition(mockRuntime);

      expect(result).toEqual({ cx: 4, cy: 7 });
    });
  });

  // ==================== 碰撞检测循环 ====================
  describe('碰撞检测循环', () => {
    it('立即碰撞时 ghostY 应该等于 cy', () => {
      collision.mockReturnValue(true);

      const result = getGhostPosition(mockRuntime);

      expect(result).toEqual({ cx: 4, cy: 5 });
    });

    it('应该逐行下移直到碰撞', () => {
      collision
        .mockReturnValueOnce(false)  // oy=1
        .mockReturnValueOnce(false)  // oy=2
        .mockReturnValueOnce(false)  // oy=3
        .mockReturnValueOnce(false)  // oy=4
        .mockReturnValueOnce(true);  // oy=5 碰撞

      const result = getGhostPosition(mockRuntime);

      // cy=5，成功 4 次，ghostY = 5 + 4 = 9
      expect(result).toEqual({ cx: 4, cy: 9 });
      expect(collision).toHaveBeenCalledTimes(5);
    });

    it('应该每次用递增的 oy 调用 collision', () => {
      collision
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      getGhostPosition(mockRuntime);

      expect(collision).toHaveBeenNthCalledWith(1, mockRuntime, 0, 1);
      expect(collision).toHaveBeenNthCalledWith(2, mockRuntime, 0, 2);
      expect(collision).toHaveBeenNthCalledWith(3, mockRuntime, 0, 3);
    });

    it('下落 10 格后碰撞应该正确计算', () => {
      // 前 9 次无碰撞，第 10 次碰撞
      for (let i = 0; i < 9; i++) {
        collision.mockReturnValueOnce(false);
      }
      collision.mockReturnValueOnce(true);

      const result = getGhostPosition(mockRuntime);

      expect(result).toEqual({ cx: 4, cy: 14 });
      expect(collision).toHaveBeenCalledTimes(10);
    });
  });

  // ==================== 参数传递 ====================
  describe('参数传递', () => {
    it('应该用正确的 runtime 调用 collision', () => {
      collision.mockReturnValue(true);

      getGhostPosition(mockRuntime);

      expect(collision).toHaveBeenCalledWith(mockRuntime, 0, expect.any(Number));
    });

    it('ox 始终为 0（垂直下落）', () => {
      collision.mockReturnValue(true);

      getGhostPosition(mockRuntime);

      expect(collision).toHaveBeenCalledWith(expect.anything(), 0, expect.any(Number));
    });

    it('应该从 Store.getState 获取状态', () => {
      collision.mockReturnValue(true);

      getGhostPosition(mockRuntime);

      expect(mockStore.getState).toHaveBeenCalled();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('cx 非 4 时应该正确返回', () => {
      mockState.cx = 0;
      collision.mockReturnValueOnce(false)
               .mockReturnValueOnce(true);

      const result = getGhostPosition(mockRuntime);

      expect(result).toEqual({ cx: 0, cy: 6 });
    });

    it('cy 为 0 时应该从顶部计算', () => {
      mockState.cy = 0;
      collision.mockReturnValueOnce(false)
               .mockReturnValueOnce(true);

      const result = getGhostPosition(mockRuntime);

      expect(result).toEqual({ cx: 4, cy: 1 });
    });

    it('cy 为 0 且立即碰撞时 ghostY = 0', () => {
      mockState.cy = 0;
      collision.mockReturnValue(true);

      const result = getGhostPosition(mockRuntime);

      expect(result).toEqual({ cx: 4, cy: 0 });
    });

    it('方块在棋盘底部时应该立即碰撞', () => {
      mockState.cy = 19; // 假设 20 行棋盘
      collision.mockReturnValue(true);

      const result = getGhostPosition(mockRuntime);

      expect(result).toEqual({ cx: 4, cy: 19 });
    });

    it('curr.shape 为空数组时不应崩溃', () => {
      mockState.curr = { shape: [], color: '#FFA500' };
      collision.mockReturnValue(true);

      // collision 内部会遍历 shape，空数组不会触发碰撞检测
      // 这里只验证 getGhostPosition 不崩溃
      expect(() => getGhostPosition(mockRuntime)).not.toThrow();
    });

    it('碰撞函数抛错时应该向上传播', () => {
      collision.mockImplementation(() => {
        throw new Error('collision error');
      });

      expect(() => getGhostPosition(mockRuntime)).toThrow('collision error');
    });
  });
});
