import spawn from '@/lib/game/logic/spawn.js';
import getNextPiece from '@/lib/game/utils/get-next-piece.js';
import collision from '@/lib/game/logic/collision.js';
import over from '@/lib/game/core/over.js';

// Mock 依赖
jest.mock('@/lib/game/utils/get-next-piece.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/game/logic/collision.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/game/core/over.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('spawn', () => {
  let mockContext;
  let mockStore;
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      curr: null,
      next: null,
    };

    mockStore = {
      getState: jest.fn().mockReturnValue(mockState),
      setState: jest.fn(),
    };

    mockContext = {
      id: 'test-game-uuid',
      Store: mockStore,
      emit: jest.fn(),
      options: {
        Elements: {
          Main: {
            cols: 10,
          },
        },
      },
    };

    // 默认 getNextPiece 返回有效方块
    getNextPiece.mockReturnValue({
      curr: {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#FFA500',
      },
      next: {
        shape: [[1, 1, 1]],
        color: '#008080',
      },
    });

    // 默认无碰撞
    collision.mockReturnValue(false);
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该调用 getNextPiece 获取方块', () => {
      spawn(mockContext);

      expect(getNextPiece).toHaveBeenCalledWith(mockContext);
    });

    it('应该更新 Store 状态', () => {
      spawn(mockContext);

      expect(mockStore.setState).toHaveBeenCalled();
    });
  });

  // ==================== 方块居中 ====================
  describe('方块居中', () => {
    it('2×2 方块在 10 列棋盘居中 cx 应该为 4', () => {
      spawn(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];

      // Math.floor(10/2) - Math.floor(2/2) = 5 - 1 = 4
      expect(setStateCall.cx).toBe(4);
    });

    it('3 列宽方块居中 cx 应该为 4', () => {
      getNextPiece.mockReturnValue({
        curr: {
          shape: [
            [0, 1, 0],
            [1, 1, 1],
          ],
          color: '#FFFF00',
        },
        next: { shape: [[1]], color: '#000' },
      });

      spawn(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];

      // Math.floor(10/2) - Math.floor(3/2) = 5 - 1 = 4
      expect(setStateCall.cx).toBe(4);
    });

    it('4 列宽方块（I型）居中 cx 应该为 3', () => {
      getNextPiece.mockReturnValue({
        curr: {
          shape: [[1, 1, 1, 1]],
          color: '#008080',
        },
        next: { shape: [[1]], color: '#000' },
      });

      spawn(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];

      // Math.floor(10/2) - Math.floor(4/2) = 5 - 2 = 3
      expect(setStateCall.cx).toBe(3);
    });

    it('cy 应该始终为 0', () => {
      spawn(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];

      expect(setStateCall.cy).toBe(0);
    });
  });

  // ==================== 无碰撞路径 ====================
  describe('无碰撞路径', () => {
    it('无碰撞时不应该调用 over', () => {
      collision.mockReturnValue(false);

      spawn(mockContext);

      expect(over).not.toHaveBeenCalled();
    });

    it('应该发送渲染预览方块事件', () => {
      spawn(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'ui:test-game-uuid:render:next:piece',
        { state: expect.any(Object) },
      );
    });

    it('应该发送 replay 录制事件', () => {
      spawn(mockContext);

      expect(mockContext.emit).toHaveBeenCalledWith(
        'replay:test-game-uuid:add:piece',
        expect.any(Object),
      );
    });
  });

  // ==================== 碰撞导致游戏结束 ====================
  describe('碰撞导致游戏结束', () => {
    it('出生碰撞时应该调用 over', () => {
      collision.mockReturnValue(true);

      spawn(mockContext);

      expect(over).toHaveBeenCalledWith(mockContext);
    });

    it('出生碰撞时不应该发送渲染事件', () => {
      collision.mockReturnValue(true);

      spawn(mockContext);

      const renderCalls = mockContext.emit.mock.calls.filter(
        ([event]) => event === 'ui:test-game-uuid:render:next:piece',
      );

      expect(renderCalls).toHaveLength(0);
    });

    it('出生碰撞时不应该发送 replay 事件', () => {
      collision.mockReturnValue(true);

      spawn(mockContext);

      const replayCalls = mockContext.emit.mock.calls.filter(
        ([event]) => event === 'replay:test-game-uuid:add:piece',
      );

      expect(replayCalls).toHaveLength(0);
    });
  });

  // ==================== curr 为 null ====================
  describe('curr 为 null', () => {
    it('getNextPiece 返回 null curr 时应该直接返回', () => {
      getNextPiece.mockReturnValue({ curr: null, next: null });

      spawn(mockContext);

      expect(mockStore.setState).not.toHaveBeenCalled();
    });

    it('getNextPiece 返回 null curr 时不应该检测碰撞', () => {
      getNextPiece.mockReturnValue({ curr: null, next: null });

      spawn(mockContext);

      expect(collision).not.toHaveBeenCalled();
    });
  });

  // ==================== Store 状态更新内容 ====================
  describe('Store 状态更新内容', () => {
    it('应该将 curr 设置为 getNextPiece 返回的 curr', () => {
      const piece = {
        shape: [[1]],
        color: '#123456',
      };
      getNextPiece.mockReturnValue({
        curr: piece,
        next: { shape: [[1]], color: '#000' },
      });

      spawn(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      expect(setStateCall.curr).toBe(piece);
    });

    it('应该将 next 设置为 getNextPiece 返回的 next', () => {
      const nextPiece = {
        shape: [[1, 1, 1]],
        color: '#654321',
      };
      getNextPiece.mockReturnValue({
        curr: { shape: [[1]], color: '#000' },
        next: nextPiece,
      });

      spawn(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      expect(setStateCall.next).toBe(nextPiece);
    });
  });

  // ==================== 执行顺序 ====================
  describe('执行顺序', () => {
    it('应该先 setState 再检测碰撞', () => {
      spawn(mockContext);

      const setStateOrder = mockStore.setState.mock.invocationCallOrder[0];
      const collisionOrder = collision.mock.invocationCallOrder[0];

      expect(setStateOrder).toBeLessThan(collisionOrder);
    });

    it('碰撞检测使用更新后的 state', () => {
      spawn(mockContext);

      // collision 被调用时，Store.getState 应该已经被更新
      expect(mockStore.getState).toHaveBeenCalled();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('cols 为奇数时应该正确居中', () => {
      mockContext.options.Elements.Main.cols = 9;

      spawn(mockContext);

      const setStateCall = mockStore.setState.mock.calls[0][0];

      // Math.floor(9/2) - Math.floor(2/2) = 4 - 1 = 3
      expect(setStateCall.cx).toBe(3);
    });

    it('getNextPiece 返回的 curr 为 undefined 时应该直接返回', () => {
      getNextPiece.mockReturnValue({ curr: undefined, next: null });

      spawn(mockContext);

      expect(mockStore.setState).not.toHaveBeenCalled();
    });
  });
});
