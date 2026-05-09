import getNextPiece from '@/lib/game/utils/get-next-piece';
import Game from '@/lib/game';
import Replay from '../../../lib/runtime/replay-controller.js';
import randomShape from '@/lib/game/utils/random-shape';

jest.mock('@/lib/game', () => ({
  store: {
    getState: jest.fn(),
  },
}));

jest.mock('../../../lib/runtime/replay-controller.js', () => ({
  playing: false,
  pieceSequence: [],
  pieceIndex: 0,
}));

jest.mock('@/lib/game/utils/random-shape', () =>
  jest.fn(() => ({ type: 'I', shape: [[1, 1, 1, 1]] })),
);

describe('getNextPiece', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Replay.playing = false;
    Replay.pieceSequence = [];
    Replay.pieceIndex = 0;
    randomShape.mockReturnValue({ type: 'I', shape: [[1, 1, 1, 1]] });
  });

  // ========== 正常模式 ==========
  describe('正常模式', () => {
    test('state 中有 next 时返回 curr=next 的深拷贝', () => {
      const nextPiece = {
        type: 'T',
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
      };
      Game.store.getState.mockReturnValue({ next: nextPiece });

      const result = getNextPiece();

      expect(result.curr).toEqual(nextPiece);
      // 不是同一个引用（深拷贝）
      expect(result.curr.shape).not.toBe(nextPiece.shape);
      // 调用 randomShape 生成新的 next
      expect(result.next).toEqual({ type: 'I', shape: [[1, 1, 1, 1]] });
    });

    test('state 中 next 为 null 时 curr 由 randomShape 生成', () => {
      Game.store.getState.mockReturnValue({ next: null });

      const result = getNextPiece();

      expect(result.curr).toEqual({ type: 'I', shape: [[1, 1, 1, 1]] });
      expect(result.next).toEqual({ type: 'I', shape: [[1, 1, 1, 1]] });
    });

    test('state 中 next 为 undefined 时 curr 由 randomShape 生成', () => {
      Game.store.getState.mockReturnValue({});

      const result = getNextPiece();

      expect(result.curr).toEqual({ type: 'I', shape: [[1, 1, 1, 1]] });
    });
  });

  // ========== Replay 模式 ==========
  describe('Replay 模式', () => {
    test('取 pieceSequence 中的当前和下一个', () => {
      Replay.playing = true;
      Replay.pieceSequence = [
        { type: 'T', shape: [[0, 1, 0]] },
        { type: 'L', shape: [[1, 1, 1]] },
      ];
      Replay.pieceIndex = 0;

      const result = getNextPiece();

      expect(result.curr).toEqual({ type: 'T', shape: [[0, 1, 0]] });
      expect(result.next).toEqual({ type: 'L', shape: [[1, 1, 1]] });
      expect(Replay.pieceIndex).toBe(1);
    });

    test('pieceIndex 越界时返回 curr=null, next=null', () => {
      Replay.playing = true;
      Replay.pieceSequence = [{ type: 'T', shape: [[0, 1, 0]] }];
      Replay.pieceIndex = 1; // 已到末尾

      const result = getNextPiece();

      expect(result.curr).toBeNull();
      expect(result.next).toBeNull();
    });

    test('pieceSequence 为空时返回 null', () => {
      Replay.playing = true;
      Replay.pieceSequence = [];
      Replay.pieceIndex = 0;

      const result = getNextPiece();

      expect(result.curr).toBeNull();
      expect(result.next).toBeNull();
    });

    test('最后一个 piece 时 next 为 null', () => {
      Replay.playing = true;
      Replay.pieceSequence = [{ type: 'S', shape: [[0, 1, 1]] }];
      Replay.pieceIndex = 0;

      const result = getNextPiece();

      expect(result.curr).toEqual({ type: 'S', shape: [[0, 1, 1]] });
      expect(result.next).toBeNull();
      expect(Replay.pieceIndex).toBe(1);
    });

    test('多次调用正常推进 pieceIndex', () => {
      Replay.playing = true;
      Replay.pieceSequence = [
        { type: 'O', shape: [[1, 1]] },
        { type: 'I', shape: [[1, 1, 1, 1]] },
        { type: 'Z', shape: [[1, 1, 0]] },
      ];
      Replay.pieceIndex = 0;

      const result1 = getNextPiece();
      expect(result1.curr.type).toBe('O');
      expect(Replay.pieceIndex).toBe(1);

      const result2 = getNextPiece();
      expect(result2.curr.type).toBe('I');
      expect(Replay.pieceIndex).toBe(2);
    });
  });
});
