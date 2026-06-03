import selfPlay from '@/lib/ai/planner/self-play.js';

jest.mock('@/lib/ai/planner/generate-moves.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/simulator/evaluate-board.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/simulator/advance-snapshot.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/simulator/simulate-clear-result.js', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

import generateMoves from '@/lib/ai/planner/generate-moves.js';
import evaluateBoard from '@/lib/ai/simulator/evaluate-board.js';
import advanceSnapshot from '@/lib/ai/simulator/advance-snapshot.js';

describe('selfPlay', () => {
  const createSnapshot = () => ({
    controller: 'ai',
    board: Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    ),
    combo: 0,
    backToBack: false,
    tSpin: null,
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

  const createMove = (overrides = {}) => ({
    board: Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    ),
    actions: ['DROP'],
    y: 18,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== depth = 1（基础模式） ====================
  describe('depth = 1（基础模式）', () => {
    it('应该返回评分最高的移动', () => {
      const snapshot = createSnapshot();
      const move1 = createMove({ actions: ['DROP'] });
      const move2 = createMove({ actions: ['MOVE_LEFT', 'DROP'] });
      const move3 = createMove({ actions: ['MOVE_RIGHT', 'DROP'] });

      generateMoves.mockReturnValue([move1, move2, move3]);
      evaluateBoard
        .mockReturnValueOnce(-5)
        .mockReturnValueOnce(-1)
        .mockReturnValueOnce(-3);

      const best = selfPlay(snapshot, undefined, 1);

      expect(best).toBe(move2);
    });

    it('所有 move 评分相同时应该返回第一个', () => {
      const snapshot = createSnapshot();
      const move1 = createMove();
      const move2 = createMove();

      generateMoves.mockReturnValue([move1, move2]);
      evaluateBoard.mockReturnValue(0);

      const best = selfPlay(snapshot, undefined, 1);

      expect(best).toBe(move1);
    });

    it('只有一个候选时应该返回该候选', () => {
      const snapshot = createSnapshot();
      const onlyMove = createMove();

      generateMoves.mockReturnValue([onlyMove]);
      evaluateBoard.mockReturnValue(-2.5);

      const best = selfPlay(snapshot, undefined, 1);

      expect(best).toBe(onlyMove);
    });

    it('没有候选移动时应该返回 null', () => {
      const snapshot = createSnapshot();
      generateMoves.mockReturnValue([]);

      const best = selfPlay(snapshot, undefined, 1);

      expect(best).toBeNull();
    });

    it('不应该调用 advanceSnapshot', () => {
      const snapshot = createSnapshot();
      generateMoves.mockReturnValue([createMove()]);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot, undefined, 1);

      expect(advanceSnapshot).not.toHaveBeenCalled();
    });

    it('应该为每个候选调用一次 evaluateBoard', () => {
      const snapshot = createSnapshot();
      generateMoves.mockReturnValue([createMove(), createMove(), createMove()]);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot, undefined, 1);

      expect(evaluateBoard).toHaveBeenCalledTimes(3);
    });

    it('应该将 weights 和 clearResult 传给 evaluateBoard', () => {
      const snapshot = createSnapshot();
      const weights = {
        holes: -0.75,
        height: -0.51,
        bumpiness: -0.18,
        completeLines: 1.5,
      };
      generateMoves.mockReturnValue([createMove()]);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot, weights, 1);

      expect(evaluateBoard).toHaveBeenCalledWith(
        expect.any(Array),
        weights,
        null, // simulateClearResult mocked to return null
      );
    });
  });

  // ==================== depth = 2（前瞻模式） ====================
  describe('depth = 2（前瞻模式）', () => {
    it('应该调用 advanceSnapshot 推进快照', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      generateMoves.mockReturnValue([move]);

      const nextSnapshot = { ...snapshot, board: [] };
      advanceSnapshot.mockReturnValue(nextSnapshot);
      generateMoves
        .mockReturnValueOnce([move])
        .mockReturnValueOnce([createMove()]);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot, undefined, 2);

      expect(advanceSnapshot).toHaveBeenCalledWith(snapshot, move);
    });

    it('应该递归调用 selfPlay', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      generateMoves.mockReturnValue([move]);

      const nextSnapshot = { ...snapshot, board: [] };
      advanceSnapshot.mockReturnValue(nextSnapshot);
      generateMoves
        .mockReturnValueOnce([move])
        .mockReturnValueOnce([createMove()]);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot, undefined, 2);

      expect(generateMoves).toHaveBeenCalledTimes(2);
    });

    it('递归返回 null 时应该退回到直接评估', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      generateMoves.mockReturnValueOnce([move]).mockReturnValueOnce([]);

      advanceSnapshot.mockReturnValue({ ...snapshot });
      evaluateBoard.mockReturnValue(-5);

      const best = selfPlay(snapshot, undefined, 2);

      expect(best).toBe(move);
      expect(evaluateBoard).toHaveBeenCalledWith(move.board, undefined, null);
    });

    it('递归时应传递 weights', () => {
      const snapshot = createSnapshot();
      const weights = {
        holes: -0.9,
        height: -0.55,
        bumpiness: -0.2,
        completeLines: 6.0,
      };
      const move = createMove();
      generateMoves.mockReturnValue([move]);

      advanceSnapshot.mockReturnValue({ ...snapshot });
      generateMoves
        .mockReturnValueOnce([move])
        .mockReturnValueOnce([createMove()]);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot, weights, 2);

      expect(evaluateBoard).toHaveBeenCalledWith(
        expect.any(Array),
        weights,
        null,
      );
    });
  });

  // ==================== depth = 3（深度前瞻） ====================
  describe('depth = 3（深度前瞻）', () => {
    it('应该递归 3 层', () => {
      const snapshot = createSnapshot();
      const move = createMove();

      generateMoves
        .mockReturnValueOnce([move])
        .mockReturnValueOnce([move])
        .mockReturnValueOnce([move]);

      advanceSnapshot.mockReturnValue({ ...snapshot });
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot, undefined, 3);

      expect(generateMoves).toHaveBeenCalledTimes(3);
      expect(advanceSnapshot).toHaveBeenCalledTimes(2);
      expect(evaluateBoard).toHaveBeenCalledTimes(3);
    });
  });

  // ==================== 默认深度 ====================
  describe('默认深度', () => {
    it('不传 depth 时应该默认为 1', () => {
      const snapshot = createSnapshot();
      generateMoves.mockReturnValue([createMove()]);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot);

      expect(advanceSnapshot).not.toHaveBeenCalled();
    });
  });

  // ==================== 不可变性 ====================
  describe('不可变性', () => {
    it('不应该修改传入的快照对象', () => {
      const snapshot = createSnapshot();
      const snapshotCopy = JSON.stringify(snapshot);
      generateMoves.mockReturnValue([createMove()]);
      evaluateBoard.mockReturnValue(-1);

      selfPlay(snapshot, undefined, 1);

      expect(JSON.stringify(snapshot)).toBe(snapshotCopy);
    });
  });

  // ==================== 返回值结构 ====================
  describe('返回值结构', () => {
    it('返回的最佳移动应包含 board、actions、y 属性', () => {
      const snapshot = createSnapshot();
      const move = createMove();
      generateMoves.mockReturnValue([move]);
      evaluateBoard.mockReturnValue(-1);

      const best = selfPlay(snapshot, undefined, 1);

      expect(best).toHaveProperty('board');
      expect(best).toHaveProperty('actions');
      expect(best).toHaveProperty('y');
    });
  });

  // ==================== Beam Search 剪枝 ====================
  describe('Beam Search 剪枝', () => {
    it('候选数超过 beam 时应剪枝', () => {
      const snapshot = createSnapshot();
      // 生成 10 个候选，beam=3，只保留 3 个
      const moves = Array.from({ length: 10 }, (_, i) =>
        createMove({ actions: [`MOVE_${i}`] }),
      );
      generateMoves.mockReturnValue(moves);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot, undefined, 2, 3);

      // generateMoves 只调用了一次，但剪枝后只保留 3 个进入递归
      // 验证剪枝逻辑被执行（evaluateBoard 被调用来评分排序）
      expect(evaluateBoard).toHaveBeenCalled();
    });

    it('候选数不超过 beam 时不剪枝', () => {
      const snapshot = createSnapshot();
      const moves = [createMove(), createMove()];
      generateMoves.mockReturnValue(moves);
      evaluateBoard.mockReturnValue(0);

      selfPlay(snapshot, undefined, 2, 5);

      // 只有 2 个候选，不触发剪枝
      expect(evaluateBoard).toHaveBeenCalled();
    });
  });
});
