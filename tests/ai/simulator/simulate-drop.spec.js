import simulateDrop from '@/lib/ai/simulator/simulate-drop.js';

// Mock 依赖
jest.mock('@/lib/ai/utils/clone-board.js', () => ({
  __esModule: true,
  default: jest.fn((board) => board.map((row) => [...row])),
}));

jest.mock('@/lib/ai/utils/collision.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import cloneBoard from '@/lib/ai/utils/clone-board.js';
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

  /** 创建一个模拟底部碰撞的 collision mock 仅当方块底部超出棋盘时才返回 true */
  const mockBottomCollision = () => {
    collision.mockImplementation((_board, shape, _x, checkY) => {
      return checkY + shape.length > ROWS;
    });
  };

  /**
   * 创建一个带障碍物的 collision mock
   *
   * @param {number} obstacleRow - 障碍物所在行，方块底部到达这一行时碰撞
   */
  const mockObstacleCollision = (obstacleRow) => {
    collision.mockImplementation((_board, shape, _x, checkY) => {
      // 底部碰撞
      if (checkY + shape.length > ROWS) return true;
      // 障碍物碰撞：方块的底部位置 >= 障碍物行
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

      // T_SHAPE 高度 2，停在 y=18（y=19 时 y+1=20，20+2=22>20 碰撞）
      expect(result.y).toBe(18);
      expect(result.board).toBeDefined();
      expect(cloneBoard).toHaveBeenCalledWith(board);
    });

    it('I 型方块应该下落到最底部', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, I_SHAPE, 0);

      // I_SHAPE 高度 1，停在 y=19
      expect(result.y).toBe(19);
    });
  });

  // ==================== 中途碰撞 ====================
  describe('中途碰撞', () => {
    it('下方有方块时应该停在上方', () => {
      const board = createBoard();
      // 障碍物在 row 10，方块底部到达 row 10 时碰撞
      mockObstacleCollision(10);

      const result = simulateDrop(board, T_SHAPE, 2);

      // T_SHAPE 高度 2，y + 2 > 10 → y > 8，所以停在 y=8
      expect(result.y).toBe(8);
    });

    it('紧贴已有方块上方', () => {
      const board = createBoard();
      mockObstacleCollision(15);

      const result = simulateDrop(board, I_SHAPE, 0);

      // I_SHAPE 高度 1，y + 1 > 15 → y > 14，停在 y=14
      expect(result.y).toBe(14);
    });
  });

  // ==================== 棋盘写入 ====================
  describe('棋盘写入', () => {
    it('应该将方块写入正确位置', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 3);

      // T_SHAPE 停在 y=18，放在 (3, 18)
      // 形状的实心格子：
      // shape[0][1] → (3+1, 18+0) = (4, 18)
      // shape[1][0] → (3+0, 18+1) = (3, 19)
      // shape[1][1] → (3+1, 18+1) = (4, 19)
      // shape[1][2] → (3+2, 18+1) = (5, 19)
      expect(result.board[18][4]).toBe(1);
      expect(result.board[19][3]).toBe(1);
      expect(result.board[19][4]).toBe(1);
      expect(result.board[19][5]).toBe(1);

      // 空单元格不应该被写入
      expect(result.board[18][3]).toBe(0);
      expect(result.board[18][5]).toBe(0);
    });

    it('不应该修改原棋盘', () => {
      const board = createBoard();
      mockBottomCollision();

      const boardCopy = board.map((row) => [...row]);

      simulateDrop(board, T_SHAPE, 0);

      expect(board).toEqual(boardCopy);
    });

    it('写入的值应该为 1', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);

      // T_SHAPE 在 (0, 18)，shape[0][1] → (1, 18)
      expect(result.board[18][1]).toBe(1);
    });
  });

  // ==================== 不同形状 ====================
  describe('不同形状', () => {
    it('I 型方块应该正确下落到空棋盘', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, I_SHAPE, 0);

      // I_SHAPE 高度 1，停在 y=19
      expect(result.y).toBe(19);
      expect(result.board[19][0]).toBe(1);
      expect(result.board[19][1]).toBe(1);
      expect(result.board[19][2]).toBe(1);
      expect(result.board[19][3]).toBe(1);
    });

    it('O 型方块应该正确下落', () => {
      const board = createBoard();
      mockObstacleCollision(12);

      const result = simulateDrop(board, O_SHAPE, 4);

      // O_SHAPE 高度 2，y + 2 > 12 → y > 10，停在 y=10
      expect(result.y).toBe(10);
      // 写满 2x2 区域
      expect(result.board[10][4]).toBe(1);
      expect(result.board[10][5]).toBe(1);
      expect(result.board[11][4]).toBe(1);
      expect(result.board[11][5]).toBe(1);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('立即碰撞（y=0 时下方有方块）', () => {
      const board = createBoard();
      // 障碍物在 row 0，任何方块都会立即碰撞
      collision.mockImplementation((_board, shape, _x, checkY) => {
        return checkY + shape.length > 0;
      });

      const result = simulateDrop(board, T_SHAPE, 3);

      // T_SHAPE 高度 2，y+1+2>0 始终 true（y>=0），但 while 循环从 y=0 开始
      // 第一次检查 y=0 → checkY=1，1+2=3>0 true，跳出，y=0
      expect(result.y).toBe(0);
    });

    it('x 在边界位置', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 7);

      // T_SHAPE 宽度 3，x=7 时占据列 7,8,9，都在棋盘内
      expect(result.y).toBe(18);
    });

    it('形状有空单元格时不影响写入', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);

      // T_SHAPE 的 (0,0) 和 (0,2) 是空的，不应写入
      expect(result.board[18][0]).toBe(0);
      expect(result.board[18][2]).toBe(0);
      // 实心格子应写入
      expect(result.board[18][1]).toBe(1);
    });
  });

  // ==================== 返回结构 ====================
  describe('返回结构', () => {
    it('应该返回 { board, y } 对象', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);

      expect(result).toHaveProperty('board');
      expect(result).toHaveProperty('y');
    });

    it('返回的 y 应该是非负整数', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);

      expect(Number.isInteger(result.y)).toBe(true);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('返回的 board 应该是深拷贝', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);

      expect(result.board).not.toBe(board);
      expect(cloneBoard).toHaveBeenCalledWith(board);
    });

    it('返回的 y 不应导致棋盘越界', () => {
      const board = createBoard();
      mockBottomCollision();

      const result = simulateDrop(board, T_SHAPE, 0);

      // y + shape 高度不应超过棋盘行数
      expect(result.y + T_SHAPE.length).toBeLessThanOrEqual(ROWS);
    });
  });
});
