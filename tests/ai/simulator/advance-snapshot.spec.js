import advanceSnapshot from '@/lib/ai/simulator/advance-snapshot.js';

// Mock 依赖
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
    board: Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    ),
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
    board: Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    ),
    actions: ['DROP'],
    y: 18,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // 默认 mock 行为
    simulatePlacement.mockImplementation((board) =>
      board.map((row) => [...row]),
    );
    clearFullLines.mockImplementation((board) => board.map((row) => [...row]));
    randomShape.mockReturnValue({
      shape: O_SHAPE,
      color: '#ffa500',
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

    it('应该调用 randomShape 生成新方块', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      advanceSnapshot(snapshot, move);

      // 调用 2 次：一次 cur，一次 next
      expect(randomShape).toHaveBeenCalledTimes(2);
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

    it('piece 应该包含新方块的 shape', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      const result = advanceSnapshot(snapshot, move);

      expect(result.piece).toHaveProperty('shape');
      expect(result.piece.shape).toEqual(O_SHAPE);
    });

    it('piece.position.x 应该居中计算', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      const result = advanceSnapshot(snapshot, move);

      // O_SHAPE 宽度 2，cols=10，居中 x = floor(10/2) - floor(2/2) = 5 - 1 = 4
      expect(result.piece.position.x).toBe(4);
    });

    it('piece.position.y 应该为 0（从顶部开始）', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      const result = advanceSnapshot(snapshot, move);

      expect(result.piece.position.y).toBe(0);
    });

    it('cur 应该等于新生成的方块', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const newShape = {
        shape: O_SHAPE,
        color: '#ffa500',
      };
      randomShape.mockReturnValueOnce(newShape);
      randomShape.mockReturnValueOnce({ shape: [[1]], color: '#fff' });

      const result = advanceSnapshot(snapshot, move);

      expect(result.cur).toBe(newShape);
    });

    it('next 应该是第二次调用 randomShape 的结果', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const nextShape = { shape: [[1, 1, 1, 1]], color: '#00c8ff' };
      randomShape.mockReturnValueOnce({ shape: O_SHAPE, color: '#ffa500' });
      randomShape.mockReturnValueOnce(nextShape);

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

  // ==================== 不同方块宽度居中 ====================
  describe('新方块居中计算', () => {
    it('I 型方块（宽 4）应该居中正确', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const IShape = { shape: [[1, 1, 1, 1]], color: '#00c8ff' };
      randomShape.mockReturnValue(IShape);

      const result = advanceSnapshot(snapshot, move);

      // 宽度 4，居中 x = floor(10/2) - floor(4/2) = 5 - 2 = 3
      expect(result.piece.position.x).toBe(3);
    });

    it('单格方块（宽 1）应该居中正确', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      const singleShape = { shape: [[1]], color: '#fff' };
      randomShape.mockReturnValue(singleShape);

      const result = advanceSnapshot(snapshot, move);

      // 宽度 1，居中 x = floor(10/2) - floor(1/2) = 5 - 0 = 5
      expect(result.piece.position.x).toBe(5);
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

    it('快照的 next 为 null 时应该正常工作', () => {
      const snapshot = createSnapshot();
      snapshot.next = null;
      const move = createMove();

      const result = advanceSnapshot(snapshot, move);

      expect(result).toBeDefined();
      expect(result.next).toBeDefined();
    });
  });
});
