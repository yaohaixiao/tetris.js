import getNextPiece from '@/lib/game/utils/get-next-piece.js';

// Mock Game 模块
jest.mock('@/lib/game/index.js', () => ({
  store: {
    getState: jest.fn(),
  },
  Replay: {
    playing: false,
    getNextPiece: jest.fn(),
  },
}));

// Mock randomShape
jest.mock('@/lib/game/utils/random-shape.js', () => jest.fn());

import Game from '@/lib/game/index.js';
import randomShape from '@/lib/game/utils/random-shape.js';

describe('getNextPiece', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Game.Replay.playing = false;
    Game.Replay.getNextPiece.mockReset();
    Game.store.getState.mockReset();
    randomShape.mockReset();
  });

  describe('回放模式', () => {
    it('应该委托给 Replay.getNextPiece', () => {
      Game.Replay.playing = true;
      const mockPiece = { curr: { type: 'T' }, next: { type: 'I' } };
      Game.Replay.getNextPiece.mockReturnValue(mockPiece);

      const result = getNextPiece();

      expect(Game.Replay.getNextPiece).toHaveBeenCalled();
      expect(result).toBe(mockPiece);
    });
  });

  describe('正常模式', () => {
    it('有 next 时应该深拷贝 next 作为 curr', () => {
      const existingNext = {
        type: 'J',
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
      };
      Game.store.getState.mockReturnValue({ next: existingNext });
      randomShape.mockReturnValue({ type: 'S', shape: [[1]] });

      const result = getNextPiece();

      // curr 是 existingNext 的深拷贝
      expect(result.curr).toEqual(existingNext);
      expect(result.curr).not.toBe(existingNext);
      expect(result.curr.shape).not.toBe(existingNext.shape);

      // next 是随机生成的新方块
      expect(result.next).toEqual({ type: 'S', shape: [[1]] });
    });

    it('没有 next 时应该随机生成 curr', () => {
      Game.store.getState.mockReturnValue({ next: null });
      randomShape
        .mockReturnValueOnce({ type: 'Z', shape: [[1, 1]] }) // curr
        .mockReturnValueOnce({ type: 'O', shape: [[1, 1]] }); // next

      const result = getNextPiece();

      expect(result.curr).toEqual({ type: 'Z', shape: [[1, 1]] });
      expect(result.next).toEqual({ type: 'O', shape: [[1, 1]] });
      expect(randomShape).toHaveBeenCalledTimes(2);
    });

    it('next 为 undefined 时也应该随机生成', () => {
      Game.store.getState.mockReturnValue({});
      randomShape
        .mockReturnValueOnce({ type: 'L', shape: [[1]] })
        .mockReturnValueOnce({ type: 'T', shape: [[2]] });

      const result = getNextPiece();

      expect(result.curr).toEqual({ type: 'L', shape: [[1]] });
      expect(result.next).toEqual({ type: 'T', shape: [[2]] });
    });
  });
});
