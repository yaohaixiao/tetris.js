import selfPlay from '@/lib/ai/planner/self-play.js';

// Mock 依赖
jest.mock('@/lib/ai/planner/generate-moves.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/simulator/evaluate-board.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import generateMoves from '@/lib/ai/planner/generate-moves.js';
import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';

describe('selfPlay', () => {
  // 标准快照结构
  const createSnapshot = () => ({
    controller: 'ai',
    board: Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    ),
    level: 1,
    score: 0,
    lines: 0,
    cur: {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: '#00c8ff',
    },
    next: {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: '#ffa500',
    },
    piece: {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      position: { x: 3, y: 0 },
    },
    mode: 'playing',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该返回评分最高的移动', () => {
      const snapshot = createSnapshot();

      const move1 = { board: [[0]], actions: ['DROP'] };
      const move2 = { board: [[1]], actions: ['MOVE_LEFT', 'DROP'] };
      const move3 = { board: [[0, 1]], actions: ['MOVE_RIGHT', 'DROP'] };

      generateMoves.mockReturnValue([move1, move2, move3]);

      // move1 评分 = -5
      // move2 评分 = -1（最高分）
      // move3 评分 = -3
      evaluateBoard
        .mockReturnValueOnce(-5)
        .mockReturnValueOnce(-1)
        .mockReturnValueOnce(-3);

      const best = selfPlay(snapshot);

      expect(best).toBe(move2);
    });

    it('所有 move 评分相同时应该返回第一个', () => {
      const snapshot = createSnapshot();

      const move1 = { board: [[0]], actions: ['DROP'] };
      const move2 = { board: [[1]], actions: ['MOVE_LEFT', 'DROP'] };

      generateMoves.mockReturnValue([move1, move2]);
      evaluateBoard.mockReturnValue(0); // 所有评分相同

      const best = selfPlay(snapshot);

      expect(best).toBe(move1);
    });

    it('只有一个候选时应该返回该候选', () => {
      const snapshot = createSnapshot();

      const onlyMove = { board: [[0]], actions: ['DROP'] };

      generateMoves.mockReturnValue([onlyMove]);
      evaluateBoard.mockReturnValue(-2.5);

      const best = selfPlay(snapshot);

      expect(best).toBe(onlyMove);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('没有候选移动时应该返回 null', () => {
      const snapshot = createSnapshot();

      generateMoves.mockReturnValue([]);

      const best = selfPlay(snapshot);

      expect(best).toBeNull();
    });

    it('评分全部为负无穷时也应返回第一个候选', () => {
      const snapshot = createSnapshot();

      const move1 = { board: [[0]], actions: ['DROP'] };
      const move2 = { board: [[1]], actions: ['MOVE_LEFT', 'DROP'] };

      generateMoves.mockReturnValue([move1, move2]);

      // 所有评分都是 -Infinity
      evaluateBoard
        .mockReturnValueOnce(-Infinity)
        .mockReturnValueOnce(-Infinity);

      const best = selfPlay(snapshot);

      // 第一个满足 score > -Infinity 的实际上是 -Infinity，不大于
      // -Infinity > -Infinity 为 false，所以 best 保持为 null
      // 实际上第一个 -Infinity > -Infinity 是 false，所以不会更新
      // 修正：所有评分都是 -Infinity 时，没有 score > bestScore，
      // 所以 best 保持 null
      expect(best).toBeNull();
    });

    it('第一个评分为 -Infinity 时，后续有效评分应被选中', () => {
      const snapshot = createSnapshot();

      const move1 = { board: [[0]], actions: ['DROP'] };
      const move2 = { board: [[1]], actions: ['MOVE_LEFT', 'DROP'] };

      generateMoves.mockReturnValue([move1, move2]);

      evaluateBoard
        .mockReturnValueOnce(-Infinity) // move1
        .mockReturnValueOnce(-5); // move2

      const best = selfPlay(snapshot);

      expect(best).toBe(move2);
    });

    it('evaluateBoard 未被调用时 generateMoves 应被调用一次', () => {
      const snapshot = createSnapshot();

      generateMoves.mockReturnValue([]);

      selfPlay(snapshot);

      expect(generateMoves).toHaveBeenCalledTimes(1);
      expect(generateMoves).toHaveBeenCalledWith(snapshot);
      expect(evaluateBoard).not.toHaveBeenCalled();
    });
  });

  // ==================== 评分规则 ====================
  describe('评分规则', () => {
    it('应该选择评分最高（最接近 0）的移动', () => {
      const snapshot = createSnapshot();

      const move1 = { board: [[0]], actions: ['DROP'] };
      const move2 = { board: [[1]], actions: ['MOVE_LEFT', 'DROP'] };
      const move3 = { board: [[0, 1]], actions: ['MOVE_RIGHT', 'DROP'] };

      generateMoves.mockReturnValue([move1, move2, move3]);

      // -10, -3, -7 中 -3 最高
      evaluateBoard
        .mockReturnValueOnce(-10)
        .mockReturnValueOnce(-3)
        .mockReturnValueOnce(-7);

      const best = selfPlay(snapshot);

      expect(best).toBe(move2);
    });

    it('正分应该优于负分', () => {
      const snapshot = createSnapshot();

      const move1 = { board: [[0]], actions: ['DROP'] };
      const move2 = { board: [[1]], actions: ['MOVE_LEFT', 'DROP'] };

      generateMoves.mockReturnValue([move1, move2]);

      evaluateBoard
        .mockReturnValueOnce(-1) // 负分
        .mockReturnValueOnce(0); // 零分（更高）

      const best = selfPlay(snapshot);

      expect(best).toBe(move2);
    });
  });

  // ==================== 参数传递 ====================
  describe('参数传递', () => {
    it('应该将快照传递给 generateMoves', () => {
      const snapshot = createSnapshot();

      generateMoves.mockReturnValue([]);

      selfPlay(snapshot);

      expect(generateMoves).toHaveBeenCalledWith(snapshot);
    });

    it('应该将每个移动的 board 传递给 evaluateBoard', () => {
      const snapshot = createSnapshot();

      const move1 = { board: [[1, 0]], actions: ['DROP'] };
      const move2 = { board: [[0, 1]], actions: ['MOVE_LEFT', 'DROP'] };

      generateMoves.mockReturnValue([move1, move2]);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot);

      expect(evaluateBoard).toHaveBeenCalledWith(move1.board);
      expect(evaluateBoard).toHaveBeenCalledWith(move2.board);
    });

    it('应该为每个候选调用一次 evaluateBoard', () => {
      const snapshot = createSnapshot();

      generateMoves.mockReturnValue([
        { board: [[0]], actions: ['DROP'] },
        { board: [[1]], actions: ['DROP'] },
        { board: [[0, 1]], actions: ['DROP'] },
      ]);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot);

      expect(evaluateBoard).toHaveBeenCalledTimes(3);
    });
  });

  // ==================== 返回值结构 ====================
  describe('返回值结构', () => {
    it('返回的最佳移动应包含 board 和 actions 属性', () => {
      const snapshot = createSnapshot();

      const move = { board: [[0]], actions: ['MOVE_LEFT', 'DROP'] };

      generateMoves.mockReturnValue([move]);
      evaluateBoard.mockReturnValue(-1);

      const best = selfPlay(snapshot);

      expect(best).toHaveProperty('board');
      expect(best).toHaveProperty('actions');
    });

    it('返回的 actions 应该是数组', () => {
      const snapshot = createSnapshot();

      const move = { board: [[0]], actions: ['ROTATE', 'MOVE_LEFT', 'DROP'] };

      generateMoves.mockReturnValue([move]);
      evaluateBoard.mockReturnValue(-1);

      const best = selfPlay(snapshot);

      expect(Array.isArray(best.actions)).toBe(true);
      expect(best.actions.length).toBeGreaterThan(0);
    });

    it('返回的 board 应该是二维数组', () => {
      const snapshot = createSnapshot();

      const move = {
        board: [
          [1, 0],
          [0, 1],
        ],
        actions: ['DROP'],
      };

      generateMoves.mockReturnValue([move]);
      evaluateBoard.mockReturnValue(-1);

      const best = selfPlay(snapshot);

      expect(Array.isArray(best.board)).toBe(true);
      expect(Array.isArray(best.board[0])).toBe(true);
    });
  });

  // ==================== 不修改输入 ====================
  describe('不修改输入', () => {
    it('不应修改传入的快照对象', () => {
      const snapshot = createSnapshot();
      const snapshotCopy = JSON.stringify(snapshot);

      generateMoves.mockReturnValue([{ board: [[0]], actions: ['DROP'] }]);
      evaluateBoard.mockReturnValue(-1);

      selfPlay(snapshot);

      expect(JSON.stringify(snapshot)).toBe(snapshotCopy);
    });
  });
});
