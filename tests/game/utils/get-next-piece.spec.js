import getNextPiece from '@/lib/game/utils/get-next-piece.js';
import randomShape from '@/lib/game/utils/random-shape.js';

// Mock randomShape
jest.mock('@/lib/game/utils/random-shape.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('getNextPiece', () => {
  let mockContext;
  let mockReplay;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReplay = {
      playing: false,
      getNextPiece: jest.fn(),
    };

    mockStore = {
      getState: jest.fn(),
    };

    mockContext = {
      Replay: mockReplay,
      Store: mockStore,
    };
  });

  // ==================== 回放模式 ====================
  describe('回放模式', () => {
    it('Replay.playing 为 true 时应该调用 Replay.getNextPiece', () => {
      mockReplay.playing = true;
      mockReplay.getNextPiece.mockReturnValue({
        curr: { shape: [[1]], color: '#FF0000' },
        next: { shape: [[1, 1]], color: '#00FF00' },
      });

      const result = getNextPiece(mockContext);

      expect(mockReplay.getNextPiece).toHaveBeenCalled();
      expect(result).toEqual({
        curr: { shape: [[1]], color: '#FF0000' },
        next: { shape: [[1, 1]], color: '#00FF00' },
      });
    });

    it('回放模式时不应该调用 Store.getState', () => {
      mockReplay.playing = true;
      mockReplay.getNextPiece.mockReturnValue({
        curr: { shape: [[1]], color: '#FF0000' },
        next: null,
      });

      getNextPiece(mockContext);

      expect(mockStore.getState).not.toHaveBeenCalled();
    });

    it('回放模式时不应该调用 randomShape', () => {
      mockReplay.playing = true;
      mockReplay.getNextPiece.mockReturnValue({
        curr: { shape: [[1]], color: '#FF0000' },
        next: null,
      });

      getNextPiece(mockContext);

      expect(randomShape).not.toHaveBeenCalled();
    });
  });

  // ==================== 正常模式 - 有 next ====================
  describe('正常模式 - 有 next', () => {
    it('有 next 时应该将 next 作为 curr', () => {
      mockStore.getState.mockReturnValue({
        next: { shape: [[1, 1]], color: '#FFA500' },
      });
      randomShape.mockReturnValue({ shape: [[1]], color: '#008080' });

      const result = getNextPiece(mockContext);

      expect(result.curr).toEqual({
        shape: [[1, 1]],
        color: '#FFA500',
      });
    });

    it('有 next 时应该深拷贝 shape', () => {
      const nextPiece = { shape: [[1, 1]], color: '#FFA500' };
      mockStore.getState.mockReturnValue({ next: nextPiece });
      randomShape.mockReturnValue({ shape: [[1]], color: '#008080' });

      const result = getNextPiece(mockContext);

      // 修改返回的 curr.shape 不应该影响原始 next
      result.curr.shape[0][0] = 999;
      expect(nextPiece.shape[0][0]).toBe(1);
    });

    it('有 next 时 next 字段应该调用 randomShape 生成新方块', () => {
      mockStore.getState.mockReturnValue({
        next: { shape: [[1, 1]], color: '#FFA500' },
      });
      randomShape.mockReturnValue({ shape: [[1]], color: '#008080' });

      const result = getNextPiece(mockContext);

      expect(randomShape).toHaveBeenCalled();
      expect(result.next).toEqual({ shape: [[1]], color: '#008080' });
    });
  });

  // ==================== 正常模式 - 无 next ====================
  describe('正常模式 - 无 next', () => {
    it('没有 next 时 curr 应该调用 randomShape', () => {
      mockStore.getState.mockReturnValue({ next: null });
      randomShape.mockReturnValueOnce({ shape: [[1, 1]], color: '#FF0000' });
      randomShape.mockReturnValueOnce({ shape: [[1]], color: '#00FF00' });

      const result = getNextPiece(mockContext);

      expect(randomShape).toHaveBeenCalledTimes(2);
      expect(result.curr).toEqual({ shape: [[1, 1]], color: '#FF0000' });
      expect(result.next).toEqual({ shape: [[1]], color: '#00FF00' });
    });

    it('curr 和 next 应该分别调用 randomShape', () => {
      mockStore.getState.mockReturnValue({ next: null });
      randomShape.mockReturnValueOnce({ shape: [[1]], color: '#FF0000' });
      randomShape.mockReturnValueOnce({ shape: [[1, 1]], color: '#00FF00' });

      const result = getNextPiece(mockContext);

      // curr 和 next 应该是不同的随机结果
      expect(result.curr).not.toEqual(result.next);
    });
  });

  // ==================== 返回结构 ====================
  describe('返回结构', () => {
    it('应该返回包含 curr 和 next 的对象', () => {
      mockStore.getState.mockReturnValue({ next: null });
      randomShape.mockReturnValue({ shape: [[1]], color: '#FF0000' });

      const result = getNextPiece(mockContext);

      expect(result).toHaveProperty('curr');
      expect(result).toHaveProperty('next');
    });

    it('curr 和 next 都应该是对象', () => {
      mockStore.getState.mockReturnValue({ next: null });
      randomShape.mockReturnValue({ shape: [[1]], color: '#FF0000' });

      const result = getNextPiece(mockContext);

      expect(typeof result.curr).toBe('object');
      expect(typeof result.next).toBe('object');
    });

    it('curr 和 next 都应该包含 shape 和 color', () => {
      mockStore.getState.mockReturnValue({ next: null });
      randomShape.mockReturnValue({ shape: [[1]], color: '#FF0000' });

      const result = getNextPiece(mockContext);

      expect(result.curr).toHaveProperty('shape');
      expect(result.curr).toHaveProperty('color');
      expect(result.next).toHaveProperty('shape');
      expect(result.next).toHaveProperty('color');
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('state 中 next 为 undefined 时应该调用 randomShape', () => {
      mockStore.getState.mockReturnValue({});
      randomShape.mockReturnValue({ shape: [[1]], color: '#FF0000' });

      const result = getNextPiece(mockContext);

      expect(result.curr).toEqual({ shape: [[1]], color: '#FF0000' });
    });

    it('回放 getNextPiece 返回 null 时应该正常返回', () => {
      mockReplay.playing = true;
      mockReplay.getNextPiece.mockReturnValue({
        curr: null,
        next: null,
      });

      const result = getNextPiece(mockContext);

      expect(result).toEqual({ curr: null, next: null });
    });
  });
});
