import simulatePlacement from '@/lib/ai/simulator/simulate-placement.js';

// Mock 依赖
jest.mock('@/lib/ai/utils/clone-board.js', () => ({
  __esModule: true,
  default: jest.fn((board) => board.map((row) => [...row])),
}));

import cloneBoard from '@/lib/ai/utils/clone-board.js';

describe('simulatePlacement', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== 基本放置 ====================
  describe('基本放置', () => {
    it('应该将方块写入正确位置', () => {
      const board = createBoard();

      const result = simulatePlacement(board, T_SHAPE, 3, 18);

      // T_SHAPE 放在 (3, 18)，形状的实心格子：
      // shape[0][1] → (3+1, 18+0) = (4, 18)
      // shape[1][0] → (3+0, 18+1) = (3, 19)
      // shape[1][1] → (3+1, 18+1) = (4, 19)
      // shape[1][2] → (3+2, 18+1) = (5, 19)
      expect(result[18][4]).toBe(1);
      expect(result[19][3]).toBe(1);
      expect(result[19][4]).toBe(1);
      expect(result[19][5]).toBe(1);
    });

    it('不应该修改原棋盘', () => {
      const board = createBoard();
      const boardCopy = board.map((row) => [...row]);

      simulatePlacement(board, T_SHAPE, 0, 0);

      expect(board).toEqual(boardCopy);
    });

    it('应该调用 cloneBoard 进行深拷贝', () => {
      const board = createBoard();

      simulatePlacement(board, T_SHAPE, 0, 0);

      expect(cloneBoard).toHaveBeenCalledWith(board);
    });

    it('返回的棋盘不应是原棋盘引用', () => {
      const board = createBoard();

      const result = simulatePlacement(board, T_SHAPE, 0, 0);

      expect(result).not.toBe(board);
    });
  });

  // ==================== 形状处理 ====================
  describe('形状处理', () => {
    it('应该正确处理 T 型方块的空格子', () => {
      const board = createBoard();

      const result = simulatePlacement(board, T_SHAPE, 0, 0);

      // T_SHAPE[0][0] 和 T_SHAPE[0][2] 是空格子，不应被写入
      expect(result[0][0]).toBe(0);
      expect(result[0][2]).toBe(0);
      // T_SHAPE[0][1] 是实心格子，应被写入
      expect(result[0][1]).toBe(1);
    });

    it('应该正确处理 I 型方块', () => {
      const board = createBoard();

      const result = simulatePlacement(board, I_SHAPE, 0, 19);

      // I_SHAPE 高度 1，宽度 4
      expect(result[19][0]).toBe(1);
      expect(result[19][1]).toBe(1);
      expect(result[19][2]).toBe(1);
      expect(result[19][3]).toBe(1);
    });

    it('应该正确处理 O 型方块', () => {
      const board = createBoard();

      const result = simulatePlacement(board, O_SHAPE, 4, 10);

      // O_SHAPE 2×2 实心
      expect(result[10][4]).toBe(1);
      expect(result[10][5]).toBe(1);
      expect(result[11][4]).toBe(1);
      expect(result[11][5]).toBe(1);
    });

    it('应该处理只有空格子的形状（全零矩阵）', () => {
      const board = createBoard();
      const emptyShape = [
        [0, 0],
        [0, 0],
      ];

      const result = simulatePlacement(board, emptyShape, 0, 0);

      // 全零形状不应修改任何格子
      expect(result).toEqual(board);
    });

    it('应该处理单格方块', () => {
      const board = createBoard();
      const singleBlock = [[1]];

      const result = simulatePlacement(board, singleBlock, 5, 10);

      expect(result[10][5]).toBe(1);
    });
  });

  // ==================== 边界处理 ====================
  describe('边界处理', () => {
    it('顶部越界（by < 0）的格子应被跳过，不写入', () => {
      const board = createBoard();
      // T_SHAPE 放在 y=-1 时：
      // shape[0] (y=0)：y=-1，全部跳过
      // shape[1] (y=1)：y=0，正常写入
      const result = simulatePlacement(board, T_SHAPE, 0, -1);

      // shape[1][0] 在 (0, 0)，应写入
      expect(result[0][0]).toBe(1);
      // shape[1][1] 在 (1, 0)，应写入
      expect(result[0][1]).toBe(1);
      // shape[1][2] 在 (2, 0)，应写入
      expect(result[0][2]).toBe(1);

      // shape[0] 整行在 y=-1，全部不应写入
      // 验证 result[0] 除了被 shape[1] 写入的三个位置外，其余都是 0
      // 但 shape[1] 已经写了 (0,0), (1,0), (2,0)，所以这些位置是 1
      // shape[0][1] 在 (1, -1)，被跳过，不覆盖 shape[1][1] 写入的 (1, 0)

      // 验证没有越界写入导致的异常
      // 函数正常返回即可
      expect(result).toBeDefined();
    });

    it('底部越界（by >= rows）的格子应被跳过，不写入', () => {
      const board = createBoard();
      // T_SHAPE 放在 y=19 时，shape[1] 在 y=20，超出棋盘
      const result = simulatePlacement(board, T_SHAPE, 0, 19);

      // shape[0] 在 y=19，应写入
      expect(result[19][1]).toBe(1);
      // shape[1] 在 y=20，超出范围，不应报错也不应写入
      // 函数正常返回即可
      expect(result).toBeDefined();
    });

    it('放置在棋盘最底部合法位置', () => {
      const board = createBoard();
      // I_SHAPE 高度 1，可放在 y=19
      const result = simulatePlacement(board, I_SHAPE, 0, 19);

      expect(result[19][0]).toBe(1);
      expect(result[19][3]).toBe(1);
    });

    it('放置在棋盘最左侧', () => {
      const board = createBoard();

      const result = simulatePlacement(board, T_SHAPE, 0, 0);

      expect(result[0][1]).toBe(1);
      expect(result[1][0]).toBe(1);
      expect(result[1][1]).toBe(1);
      expect(result[1][2]).toBe(1);
    });

    it('放置在棋盘最右侧合法位置', () => {
      const board = createBoard();
      // T_SHAPE 宽度 3，x=7 时占据列 7,8,9
      const result = simulatePlacement(board, T_SHAPE, 7, 0);

      expect(result[0][8]).toBe(1);
      expect(result[1][7]).toBe(1);
      expect(result[1][8]).toBe(1);
      expect(result[1][9]).toBe(1);
    });
  });

  // ==================== 与已有方块共存 ====================
  describe('与已有方块共存', () => {
    it('应该覆盖已有方块的位置', () => {
      const board = createBoard();
      board[10][4] = 2; // 已有方块

      const result = simulatePlacement(board, O_SHAPE, 4, 10);

      // O_SHAPE 写入 1，覆盖原有的 2
      expect(result[10][4]).toBe(1);
      expect(result[10][5]).toBe(1);
      expect(result[11][4]).toBe(1);
      expect(result[11][5]).toBe(1);
    });

    it('不应该影响已有方块的其他位置', () => {
      const board = createBoard();
      board[5][5] = 2; // 已有方块，不在放置区域内

      const result = simulatePlacement(board, I_SHAPE, 0, 19);

      // 不在放置区域的已有方块应保持不变
      expect(result[5][5]).toBe(2);
      // 放置区域正常写入
      expect(result[19][0]).toBe(1);
    });

    it('写入的值应该为 1', () => {
      const board = createBoard();

      const result = simulatePlacement(board, T_SHAPE, 0, 0);

      // 所有写入的格子值应为 1
      expect(result[0][1]).toBe(1);
      expect(result[1][0]).toBe(1);
      expect(result[1][1]).toBe(1);
      expect(result[1][2]).toBe(1);
    });
  });

  // ==================== 返回结构 ====================
  describe('返回结构', () => {
    it('应该返回一个二维数组', () => {
      const board = createBoard();

      const result = simulatePlacement(board, T_SHAPE, 0, 0);

      expect(Array.isArray(result)).toBe(true);
      expect(Array.isArray(result[0])).toBe(true);
    });

    it('返回的棋盘应该保持原始尺寸', () => {
      const board = createBoard();

      const result = simulatePlacement(board, T_SHAPE, 0, 0);

      expect(result.length).toBe(ROWS);
      result.forEach((row) => {
        expect(row.length).toBe(COLS);
      });
    });

    it('应该返回棋盘副本而非原棋盘', () => {
      const board = createBoard();

      const result = simulatePlacement(board, T_SHAPE, 0, 0);

      // 修改返回的棋盘不应影响原棋盘
      result[0][0] = 99;
      expect(board[0][0]).toBe(0);
    });
  });
});
