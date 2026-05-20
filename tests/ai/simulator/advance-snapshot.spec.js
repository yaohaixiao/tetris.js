import advanceSnapshot from '@/lib/ai/simulator/advance-snapshot.js';

jest.mock('@/lib/game/utils/random-shape.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/simulator/simulate-placement.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/utils/clear-full-lines.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import randomShape from '@/lib/game/utils/random-shape.js';
import simulatePlacement from '@/lib/ai/simulator/simulate-placement.js';
import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';

describe('advanceSnapshot', () => {
  const T_SHAPE = [
    [0, 1, 0],
    [1, 1, 1],
  ];

  const O_SHAPE = [
    [1, 1],
    [1, 1],
  ];

  const createSnapshot = () => ({
    controller: 'ai',
    board: Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => 0)),
    level: 1,
    score: 0,
    lines: 0,
    cur: {
      shape: T_SHAPE,
      color: '#00c8ff',
    },
    next: {
      shape: O_SHAPE,
      color: '#ffa500',
    },
    piece: {
      shape: T_SHAPE,
      position: { x: 3, y: 0 },
    },
    mode: 'playing',
  });

  const createMove = () => ({
    board: Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => 0)),
    actions: ['DROP'],
    y: 18,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    simulatePlacement.mockImplementation((board) => board.map((row) => [...row]));
    clearFullLines.mockImplementation((board) => board.map((row) => [...row]));
    randomShape.mockReturnValue({
      shape: [[1]],
      color: '#fff',
    });
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该返回一个新的快照对象', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const result = advanceSnapshot(snapshot, move);

      expect(result).toBeDefined();
      expect(result).not.toBe(snapshot);
    });

    it('应该保留原始快照中的非棋盘字段', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const result = advanceSnapshot(snapshot, move);

      expect(result.controller).toBe(snapshot.controller);
      expect(result.mode).toBe(snapshot.mode);
      expect(result.level).toBe(snapshot.level);
      expect(result.score).toBe(snapshot.score);
      expect(result.lines).toBe(snapshot.lines);
    });

    it('应该调用 simulatePlacement 放置当前方块', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      advanceSnapshot(snapshot, move);

      expect(simulatePlacement).toHaveBeenCalledWith(
        snapshot.board,
        snapshot.piece.shape,
        snapshot.piece.position.x,
        move.y,
      );
    });

    it('应该调用 clearFullLines 清除满行', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      advanceSnapshot(snapshot, move);

      expect(clearFullLines).toHaveBeenCalled();
    });

    it('应该调用 randomShape 生成下一个预览方块（仅 1 次）', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      advanceSnapshot(snapshot, move);

      // 改用 snapshot.next 后，只有 next 字段需要 randomShape
      expect(randomShape).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 返回的快照结构 ====================
  describe('返回的快照结构', () => {
    it('board 应该是 clearFullLines 处理后的结果', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const clearedBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
      clearedBoard[19][0] = 1;
      clearFullLines.mockReturnValue(clearedBoard);

      const result = advanceSnapshot(snapshot, move);

      expect(result.board).toBe(clearedBoard);
    });

    it('piece 应该包含 snapshot.next 方块的 shape', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      const result = advanceSnapshot(snapshot, move);

      expect(result.piece).toHaveProperty('shape');
      expect(result.piece.shape).toEqual(O_SHAPE);
    });

    it('piece.position.x 应该根据 next 方块居中计算', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      const result = advanceSnapshot(snapshot, move);

      // O_SHAPE 宽度 2，cols=10，居中 x = floor(10/2) - floor(2/2) = 5 - 1 = 4
      expect(result.piece.position.x).toBe(4);
    });

    it('piece.position.y 应该为 0', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      const result = advanceSnapshot(snapshot, move);

      expect(result.piece.position.y).toBe(0);
    });

    it('cur 应该等于 snapshot.next', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      const result = advanceSnapshot(snapshot, move);

      // cur 现在是 snapshot.next，不是 randomShape 的返回值
      expect(result.cur.shape).toEqual(snapshot.next.shape);
      expect(result.cur.color).toBe(snapshot.next.color);
    });

    it('next 应该是 randomShape 的返回值', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const nextShape = { shape: [[1]], color: '#fff' };
      randomShape.mockReturnValue(nextShape);

      const result = advanceSnapshot(snapshot, move);

      expect(result.next).toBe(nextShape);
    });
  });

  // ==================== 不可变性 ====================
  describe('不可变性', () => {
    it('不应该修改原始快照', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const snapshotCopy = JSON.parse(JSON.stringify(snapshot));

      advanceSnapshot(snapshot, move);

      expect(snapshot).toEqual(snapshotCopy);
    });

    it('不应该修改原始快照的 board', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const originalBoard = snapshot.board.map((row) => [...row]);

      advanceSnapshot(snapshot, move);

      expect(snapshot.board).toEqual(originalBoard);
    });

    it('不应该修改原始快照的 piece', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const originalPiece = JSON.parse(JSON.stringify(snapshot.piece));

      advanceSnapshot(snapshot, move);

      expect(snapshot.piece).toEqual(originalPiece);
    });
  });

  // ==================== snapshot.next 为 null 时的降级处理 ====================
  describe('snapshot.next 为 null', () => {
    it('应该降级使用 randomShape 作为当前方块', () => {
      const snapshot = createSnapshot();
      snapshot.next = null;
      const move = createMove();
      const fallbackShape = { shape: [[1]], color: '#fff' };
      randomShape.mockReturnValue(fallbackShape);

      const result = advanceSnapshot(snapshot, move);

      // cur 应该降级使用 randomShape
      expect(result.cur).toBe(fallbackShape);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('move.y 为 0 时应该正常工作', () => {
      const snapshot = createSnapshot();
      const move = { ...createMove(), y: 0 };

      const result = advanceSnapshot(snapshot, move);

      expect(result).toBeDefined();
      expect(simulatePlacement).toHaveBeenCalledWith(
        snapshot.board,
        snapshot.piece.shape,
        snapshot.piece.position.x,
        0,
      );
    });

    it('move.y 为 19 时应该正常工作', () => {
      const snapshot = createSnapshot();
      const move = { ...createMove(), y: 19 };

      const result = advanceSnapshot(snapshot, move);

      expect(result).toBeDefined();
      expect(simulatePlacement).toHaveBeenCalledWith(
        snapshot.board,
        snapshot.piece.shape,
        snapshot.piece.position.x,
        19,
      );
    });
  });
});
