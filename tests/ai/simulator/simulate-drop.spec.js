import simulateDrop from '@/lib/ai/simulator/simulate-drop.js';

jest.mock('@/lib/ai/utils/collision.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/simulator/simulate-placement-in-place.js', () => ({
  __esModule: true,
  default: jest.fn((board, shape, x, y, cb) => cb(board)),
}));

import collision from '@/lib/ai/utils/collision.js';

describe('simulateDrop', () => {
  const ROWS = 20;
  const COLS = 10;

  const T_SHAPE = [
    [0, 1, 0],
    [1, 1, 1],
  ];

  const I_SHAPE = [[1, 1, 1, 1]];

  const O_SHAPE = [
    [1, 1],
    [1, 1],
  ];

  const createBoard = () =>
    Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 0));

  const mockBottomCollision = () => {
    collision.mockImplementation((_board, shape, _x, checkY) => {
      return checkY + shape.length > ROWS;
    });
  };

  const mockObstacleCollision = (obstacleRow) => {
    collision.mockImplementation((_board, shape, _x, checkY) => {
      if (checkY + shape.length > ROWS) return true;
      if (checkY + shape.length > obstacleRow) return true;
      return false;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== 基本下落 ====================
  describe('基本下落', () => {
    it('空棋盘应该下落到最底部', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 3);

      expect(result.y).toBe(18);
      expect(result.evaluate).toBeDefined();
      expect(typeof result.evaluate).toBe('function');
    });

    it('I 型方块应该下落到最底部', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, I_SHAPE, 0);

      expect(result.y).toBe(19);
    });
  });

  // ==================== 中途碰撞 ====================
  describe('中途碰撞', () => {
    it('下方有方块时应该停在上方', () => {
      const board = createBoard();
      mockObstacleCollision(10);

      const result = simulateDrop(board, T_SHAPE, 2);

      expect(result.y).toBe(8);
    });

    it('紧贴已有方块上方', () => {
      const board = createBoard();
      mockObstacleCollision(15);

      const result = simulateDrop(board, I_SHAPE, 0);

      expect(result.y).toBe(14);
    });
  });

  // ==================== 延迟评分 ====================
  describe('延迟评分', () => {
    it('evaluate 应返回回调的返回值', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);
      const score = result.evaluate(() => 42);

      expect(score).toBe(42);
    });

    it('evaluate 应接收棋盘作为参数', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);
      let receivedBoard = null;
      result.evaluate((b) => {
        receivedBoard = b;
        return 0;
      });

      expect(receivedBoard).toBe(board);
    });

    it('evaluate 不应修改原棋盘', () => {
      const board = createBoard();
      mockBottomCollision();
      const snapshot = JSON.stringify(board);

      const result = simulateDrop(board, T_SHAPE, 0);
      result.evaluate(() => 0);

      expect(JSON.stringify(board)).toBe(snapshot);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('立即碰撞（y=0）', () => {
      const board = createBoard();
      collision.mockImplementation((_board, shape, _x, checkY) => {
        return checkY + shape.length > 0;
      });

      const result = simulateDrop(board, T_SHAPE, 3);

      expect(result.y).toBe(0);
    });

    it('x 在边界位置', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 7);

      expect(result.y).toBe(18);
    });
  });

  // ==================== 返回结构 ====================
  describe('返回结构', () => {
    it('应该返回 { y, evaluate } 对象', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);

      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('evaluate');
      expect(typeof result.evaluate).toBe('function');
    });

    it('返回的 y 应该是非负整数', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);

      expect(Number.isInteger(result.y)).toBe(true);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('返回的 y 不应导致棋盘越界', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);

      expect(result.y + T_SHAPE.length).toBeLessThanOrEqual(ROWS);
    });
  });
});
