import generateMoves from '@/lib/ai/generate-moves.js';

// Mock 依赖
jest.mock('@/lib/ai/rotate-matrix.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/simulate-drop.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import rotateMatrix from '@/lib/ai/rotate-matrix.js';
import simulateDrop from '@/lib/ai/simulate-drop.js';

describe('generateMoves', () => {
  const T_SHAPE = [
    [0, 1, 0],
    [1, 1, 1],
  ];

  const O_SHAPE = [
    [1, 1],
    [1, 1],
  ];

  const createBoard = () =>
    Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => 0));

  beforeEach(() => {
    jest.clearAllMocks();

    // 默认 rotateMatrix 模拟：旋转不变（方便测试）
    rotateMatrix.mockImplementation((shape) => shape);

    // 默认 simulateDrop 模拟：返回假结果
    simulateDrop.mockImplementation((board, shape, x) => ({
      board: board.map((row) => [...row]),
      y: 18,
    }));
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该返回数组', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 3, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      expect(Array.isArray(moves)).toBe(true);
      expect(moves.length).toBeGreaterThan(0);
    });

    it('每个 move 应该包含 board 和 actions', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 3, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      moves.forEach((move) => {
        expect(move).toHaveProperty('board');
        expect(move).toHaveProperty('actions');
        expect(Array.isArray(move.actions)).toBe(true);
      });
    });

    it('每个 move 的 actions 最后一步应该是 DROP', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 3, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      moves.forEach((move) => {
        const lastAction = move.actions[move.actions.length - 1];
        expect(lastAction).toBe('DROP');
      });
    });
  });

  // ==================== 动作生成 ====================
  describe('动作生成', () => {
    it('方块在初始位置时不应该有移动动作', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 0, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      // rotation=0, x=0 的那个 move 应该只有 DROP
      const firstMove = moves[0];
      expect(firstMove.actions).toEqual(['DROP']);
    });

    it('方块在右侧时应该生成 MOVE_LEFT 动作', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 5, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      // 找到 x=0 的 move（从 x=5 移到 x=0，delta=-5）
      const leftMostMove = moves.find((m) => m.actions.includes('MOVE_LEFT'));
      expect(leftMostMove).toBeDefined();

      // 应该有 5 个 MOVE_LEFT
      const leftActions = leftMostMove.actions.filter((a) => a === 'MOVE_LEFT');
      expect(leftActions.length).toBe(5);
    });

    it('方块在左侧时应该生成 MOVE_RIGHT 动作', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 0, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      // 找到 x=7 的 move（从 x=0 移到 x=7，delta=7）
      const rightMostMove = moves.find((m) =>
        m.actions.some((a) => a === 'MOVE_RIGHT'),
      );
      expect(rightMostMove).toBeDefined();
    });
  });

  // ==================== 旋转处理 ====================
  describe('旋转处理', () => {
    it('应该为每个旋转状态生成 moves', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 3, y: 0 },
      };

      const rotatedShape = [
        [1, 0],
        [1, 1],
        [1, 0],
      ];
      rotateMatrix
        .mockReturnValueOnce(rotatedShape)
        .mockReturnValueOnce(T_SHAPE)
        .mockReturnValueOnce(rotatedShape)
        .mockReturnValueOnce(T_SHAPE); // 第四次调用

      generateMoves({ board, piece });

      // 循环 4 次，每次末尾调用一次 rotateMatrix
      expect(rotateMatrix).toHaveBeenCalledTimes(4);
    });

    it('包含旋转的动作序列应该正确', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 3, y: 0 },
      };

      // 第二次旋转返回不同形状
      let rotationCount = 0;
      rotateMatrix.mockImplementation(() => {
        rotationCount++;
        return T_SHAPE;
      });

      const moves = generateMoves({ board, piece });

      // 检查 rotation=2 的某个 move 有 2 个 ROTATE
      const movesWithRotations = moves.filter((m) =>
        m.actions.includes('ROTATE'),
      );
      expect(movesWithRotations.length).toBeGreaterThan(0);
    });

    it('O 型方块旋转后形状不变，仍应生成 4 组 moves', () => {
      const board = createBoard();
      const piece = {
        shape: O_SHAPE,
        position: { x: 4, y: 0 },
      };

      // O 型方块旋转不变
      rotateMatrix.mockImplementation(() => O_SHAPE);

      const moves = generateMoves({ board, piece });

      // O 型方块宽度 2，10 列棋盘，合法 x 位置 = 0..8（9 个位置）
      // 4 个旋转状态 × 9 个位置 = 36 个 moves
      expect(moves.length).toBe(36);
    });
  });

  // ==================== 移动范围 ====================
  describe('移动范围', () => {
    it('T 型方块（宽 3）在 10 列棋盘应该生成 8 个 x 位置', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 0, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      // 4 个旋转 × 8 个位置 = 32 个 moves
      expect(moves.length).toBe(32);
    });

    it('I 型方块（宽 4）在 10 列棋盘应该生成 7 个 x 位置', () => {
      const board = createBoard();
      const I_SHAPE = [[1, 1, 1, 1]];
      const piece = {
        shape: I_SHAPE,
        position: { x: 0, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      // 4 个旋转 × 7 个位置 = 28 个 moves
      expect(moves.length).toBe(28);
    });

    it('O 型方块（宽 2）在 10 列棋盘应该生成 9 个 x 位置', () => {
      const board = createBoard();
      const piece = {
        shape: O_SHAPE,
        position: { x: 0, y: 0 },
      };

      rotateMatrix.mockImplementation(() => O_SHAPE);

      const moves = generateMoves({ board, piece });

      // 4 个旋转 × 9 个位置 = 36 个 moves
      expect(moves.length).toBe(36);
    });
  });

  // ==================== simulateDrop 调用 ====================
  describe('simulateDrop 调用', () => {
    it('应该为每个合法位置调用 simulateDrop', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 3, y: 0 },
      };

      generateMoves({ board, piece });

      // 4 个旋转 × 8 个位置 = 32 次调用
      expect(simulateDrop).toHaveBeenCalledTimes(32);
    });

    it('应该传递正确的参数给 simulateDrop', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 3, y: 0 },
      };

      generateMoves({ board, piece });

      // 第一次调用：rotation=0, x=0
      expect(simulateDrop).toHaveBeenNthCalledWith(1, board, T_SHAPE, 0);
      // 第二次调用：rotation=0, x=1
      expect(simulateDrop).toHaveBeenNthCalledWith(2, board, T_SHAPE, 1);
    });
  });

  // ==================== 动作序列顺序 ====================
  describe('动作序列顺序', () => {
    it('动作顺序应该是 ROTATE → MOVE → DROP', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 5, y: 0 },
      };

      // 让 rotateMatrix 产生变化
      const rotatedShape = [
        [1, 0],
        [1, 1],
        [1, 0],
      ];
      rotateMatrix.mockReturnValue(rotatedShape);

      // rotation=1, x=0 → 应该有 1 个 ROTATE，5 个 MOVE_LEFT，1 个 DROP
      const moves = generateMoves({ board, piece });

      // 找到 rotation=1, x=0 的 move
      const targetMove = moves.find((m) => {
        const rotateCount = m.actions.filter((a) => a === 'ROTATE').length;
        const moveLeftCount = m.actions.filter((a) => a === 'MOVE_LEFT').length;
        return rotateCount === 1 && moveLeftCount === 5;
      });

      expect(targetMove).toBeDefined();

      const expectedActions = [
        'ROTATE',
        'MOVE_LEFT',
        'MOVE_LEFT',
        'MOVE_LEFT',
        'MOVE_LEFT',
        'MOVE_LEFT',
        'DROP',
      ];

      expect(targetMove.actions).toEqual(expectedActions);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('方块在左上角时应该正确处理', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 0, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      // 第一个 move 应该是 rotation=0, x=0，只有 DROP
      expect(moves[0].actions).toEqual(['DROP']);
    });

    it('方块在右下角时应该正确处理', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 7, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      // 应该有 move 包含 MOVE_LEFT 动作（移动到 x=0..6）
      const leftMoves = moves.filter((m) => m.actions.includes('MOVE_LEFT'));
      expect(leftMoves.length).toBeGreaterThan(0);
    });

    it('棋盘宽度为 3 时，T 型方块只能有一个 x 位置', () => {
      const board = Array.from({ length: 20 }, () =>
        Array.from({ length: 3 }, () => 0),
      );
      const piece = {
        shape: T_SHAPE,
        position: { x: 0, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      // 4 个旋转 × 1 个位置 = 4 个 moves
      expect(moves.length).toBe(4);
    });

    it('空棋盘场景下所有 moves 的 board 不应是原棋盘引用', () => {
      const board = createBoard();
      const piece = {
        shape: T_SHAPE,
        position: { x: 3, y: 0 },
      };

      const moves = generateMoves({ board, piece });

      moves.forEach((move) => {
        expect(move.board).not.toBe(board);
      });
    });
  });
});
