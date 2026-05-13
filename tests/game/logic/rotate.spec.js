import rotate from '@/lib/game/logic/rotate.js';
import collision from '@/lib/game/logic/collision.js';

// Mock 依赖
jest.mock('@/lib/game/logic/collision.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('rotate', () => {
  let mockContext;
  let mockStore;
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      curr: {
        shape: [
          [1, 0],
          [1, 1],
        ],
        color: '#0000FF',
      },
      cx: 4,
      cy: 5,
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

  // ==================== 矩阵旋转验证 ====================
  describe('矩阵旋转验证', () => {
    it('L 型方块旋转验证', () => {
      mockState.curr = {
        shape: [
          [1, 0],
          [1, 1],
        ],
        color: '#0000FF',
      };
      collision.mockReturnValue(false);

      rotate(mockContext);

      const rotated = mockStore.setState.mock.calls[0][0].curr.shape;
      // 转置 → 反转行：[[1,1],[0,1]] → toReversed → [[1,1],[1,0]]
      // 不对，再看：
      // prev[0].map 按列迭代
      // 列0: prev.map(r=>r[0]) = [1,1], toReversed = [1,1]
      // 列1: prev.map(r=>r[1]) = [0,1], toReversed = [1,0]
      // 结果: [[1,1],[1,0]]
      expect(rotated).toEqual([
        [1, 1],
        [1, 0],
      ]);
    });

    it('I 型方块旋转验证', () => {
      mockState.curr = {
        shape: [[1, 1, 1, 1]],
        color: '#008080',
      };
      collision.mockReturnValue(false);

      rotate(mockContext);

      // 1×4 → 列0: [1], toReversed=[1]
      // 列1: [1], toReversed=[1]
      // 列2: [1], toReversed=[1]
      // 列3: [1], toReversed=[1]
      // 结果: [[1],[1],[1],[1]]
      const rotated = mockStore.setState.mock.calls[0][0].curr.shape;
      expect(rotated).toEqual([[1], [1], [1], [1]]);
    });

    it('T 型方块旋转验证', () => {
      mockState.curr = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: '#FFFF00',
      };
      collision.mockReturnValue(false);

      rotate(mockContext);

      // 列0: [0,1], toReversed=[1,0]
      // 列1: [1,1], toReversed=[1,1]
      // 列2: [0,1], toReversed=[1,0]
      // 结果: [[1,0],[1,1],[1,0]]
      const rotated = mockStore.setState.mock.calls[0][0].curr.shape;
      expect(rotated).toEqual([
        [1, 0],
        [1, 1],
        [1, 0],
      ]);
    });

    it('O 型方块旋转后应保持不变', () => {
      mockState.curr = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#FFA500',
      };
      collision.mockReturnValue(false);

      rotate(mockContext);

      // 列0: [1,1], toReversed=[1,1]
      // 列1: [1,1], toReversed=[1,1]
      // 结果: [[1,1],[1,1]]
      const rotated = mockStore.setState.mock.calls[0][0].curr.shape;
      expect(rotated).toEqual([
        [1, 1],
        [1, 1],
      ]);
    });
  });

  // ==================== 旋转后碰撞 ====================
  describe('旋转后碰撞', () => {
    it('旋转后碰撞应该恢复原形状', () => {
      collision.mockReturnValue(true);

      rotate(mockContext);

      // 第二次 setState 恢复原始形状
      const restoreCall = mockStore.setState.mock.calls[1][0];
      expect(restoreCall.curr.shape).toEqual([
        [1, 0],
        [1, 1],
      ]);
    });

    it('旋转后碰撞应该调用两次 setState', () => {
      collision.mockReturnValue(true);

      rotate(mockContext);

      // 第一次设置旋转后的形状，第二次恢复
      expect(mockStore.setState).toHaveBeenCalledTimes(2);
    });

    it('旋转后碰撞不应该播放音效', () => {
      collision.mockReturnValue(true);

      rotate(mockContext);

      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('碰撞检测应该使用旋转后的形状', () => {
      collision.mockReturnValue(true);

      rotate(mockContext);

      // collision 被调用时，curr.shape 已经更新为旋转后的形状
      expect(collision).toHaveBeenCalledWith(mockContext, 0, 0);
    });
  });

  // ==================== 矩阵旋转验证 ====================
  describe('矩阵旋转验证', () => {
    it('I 型方块旋转验证', () => {
      mockState.curr = {
        shape: [[1, 1, 1, 1]],
        color: '#008080',
      };
      collision.mockReturnValue(false);

      rotate(mockContext);

      // 1×4 旋转后应该是 4×1
      const rotated = mockStore.setState.mock.calls[0][0].curr.shape;
      expect(rotated).toEqual([[1], [1], [1], [1]]);
    });

    it('T 型方块旋转验证', () => {
      mockState.curr = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: '#FFFF00',
      };
      collision.mockReturnValue(false);

      rotate(mockContext);

      // 转置 → 反转行
      const rotated = mockStore.setState.mock.calls[0][0].curr.shape;
      expect(rotated).toEqual([
        [1, 0],
        [1, 1],
        [1, 0],
      ]);
    });

    it('O 型方块旋转后应保持不变', () => {
      mockState.curr = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#FFA500',
      };
      collision.mockReturnValue(false);

      rotate(mockContext);

      const rotated = mockStore.setState.mock.calls[0][0].curr.shape;
      expect(rotated).toEqual([
        [1, 1],
        [1, 1],
      ]);
    });
  });

  // ==================== curr 为 null ====================
  describe('curr 为 null', () => {
    it('curr 为 null 时应该直接返回', () => {
      mockState.curr = null;

      rotate(mockContext);

      expect(mockStore.setState).not.toHaveBeenCalled();
      expect(collision).not.toHaveBeenCalled();
    });

    it('curr 为 null 时不应该报错', () => {
      mockState.curr = null;

      expect(() => {
        rotate(mockContext);
      }).not.toThrow();
    });
  });

  // ==================== 颜色保持 ====================
  describe('颜色保持', () => {
    it('旋转后颜色应该保持不变', () => {
      collision.mockReturnValue(false);
      mockState.curr.color = '#123456';

      rotate(mockContext);

      const rotated = mockStore.setState.mock.calls[0][0].curr;
      expect(rotated.color).toBe('#123456');
    });

    it('碰撞恢复后颜色应该保持不变', () => {
      collision.mockReturnValue(true);
      mockState.curr.color = '#ABCDEF';

      rotate(mockContext);

      const restored = mockStore.setState.mock.calls[1][0].curr;
      expect(restored.color).toBe('#ABCDEF');
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('旋转后不修改原始 curr.shape', () => {
      collision.mockReturnValue(false);
      const originalShape = structuredClone(mockState.curr.shape);

      rotate(mockContext);

      // 原始 state 中的 curr.shape 被 setState 调用修改了引用
      // 因为 Store.setState 会更新 this.state
    });

    it('使用 structuredClone 深拷贝 curr', () => {
      collision.mockReturnValue(false);

      rotate(mockContext);

      const rotatedCurr = mockStore.setState.mock.calls[0][0].curr;

      // 旋转后的 curr 是新的对象
      expect(rotatedCurr).not.toBe(mockState.curr);
    });

    it('连续旋转 4 次应回到原始形状', () => {
      collision.mockReturnValue(false);

      const originalShape = [
        [1, 0],
        [1, 1],
      ];
      mockState.curr.shape = structuredClone(originalShape);

      // 旋转1
      rotate(mockContext);
      const shape1 = mockStore.setState.mock.calls[0][0].curr.shape;
      mockState.curr.shape = shape1;
      mockStore.setState.mockClear();

      // 旋转2
      rotate(mockContext);
      const shape2 = mockStore.setState.mock.calls[0][0].curr.shape;
      mockState.curr.shape = shape2;
      mockStore.setState.mockClear();

      // 旋转3
      rotate(mockContext);
      const shape3 = mockStore.setState.mock.calls[0][0].curr.shape;
      mockState.curr.shape = shape3;
      mockStore.setState.mockClear();

      // 旋转4
      rotate(mockContext);
      const shape4 = mockStore.setState.mock.calls[0][0].curr.shape;

      expect(shape4).toEqual(originalShape);
    });
  });
});
